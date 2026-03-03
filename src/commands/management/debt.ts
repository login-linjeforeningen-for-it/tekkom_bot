import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import type { Roles } from '#interfaces'
import config from '#config'
import { Role } from 'discord.js'

interface DebtRow {
    user_id: string
    amount: number
}

interface RemoveDebtBody {
    user_id: string
    amount?: number
}

export const data = new SlashCommandBuilder()
    .setName('debt')
    .setDescription('Manage debt for late meetings')
    .addSubcommand(sub =>
        sub
            .setName('add')
            .setDescription('Add debt to a user')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to add debt to')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('amount')
                    .setDescription('Number of packs of snacks')
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub
            .setName('show')
            .setDescription('Show all debt')
    )
    .addSubcommand(sub =>
        sub
            .setName('remove')
            .setDescription('Remove debt from a user')
            .addUserOption(option =>
                option
                    .setName('user')
                    .setDescription('User to remove debt from')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('amount')
                    .setDescription('Number of packs to remove (leave empty to remove all)')
                    .setRequired(false)
            )
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand()
    const isAllowed = (interaction.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    if (!isAllowed) {
        return await interaction.reply({ content: 'Unauthorized.', ephemeral: true })
    }

    const PLAYHOUSE_CHANNEL_ID = '940907390629449769'
    if (subcommand !== 'show') {
        if (interaction.channelId !== config.tekkomVervChannelId!) {
            return await interaction.reply({ content: 'This command can only be used in the tekkom-verv-møte channel.', ephemeral: true })
        }
    } else {
        if (interaction.channelId !== config.tekkomVervChannelId &&
            interaction.channelId !== PLAYHOUSE_CHANNEL_ID) {
            return await interaction.reply({
                content: 'This command can only be used in the tekkom-verv-møte or a playhouse channel.',
                ephemeral: true
            })
        }
    }

    await interaction.deferReply()

    try {
        const headers = {
            'Authorization': `Bearer ${config.tekkomBotApiToken}`,
            'btg': 'tekkom_bot',
            'Content-Type': 'application/json'
        }

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user')!
            const amount = interaction.options.getInteger('amount')!

            const response = await fetch(`${config.api}/debt`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    user_id: user.id,
                    amount
                })
            })

            if (!response.ok) {
                await interaction.deleteReply().catch(() => {})
                return await interaction.followUp({ content: 'Failed to add debt.', ephemeral: true })
            }

            await interaction.editReply(`Added ${amount} pack${amount > 1 ? 's' : ''} of debt to <@${user.id}>.`)
            return
        }

        if (subcommand === 'show') {
            const response = await fetch(`${config.api}/debt`, { headers })

            if (!response.ok) {
                await interaction.deleteReply().catch(() => {})
                return await interaction.followUp({ content: 'Failed to fetch debt.', ephemeral: true })
            }

            const debts: DebtRow[] = (await response.json()) as DebtRow[]
            if (!Array.isArray(debts) || debts.length === 0) {
                return await interaction.editReply('No debt recorded.')
            }

            const embed = new EmbedBuilder()
                .setTitle('<:gifflarcrumbs:1443288386788917469> Gifflar Debt <:gifflarcrumbs:1443288386788917469>')
                .setColor('#fd8738')
                .setTimestamp()

            const userPromises = debts.map(async (row) => {
                try {
                    const packs = row.amount
                    return `<@${row.user_id}>: ${packs} pack${packs > 1 ? 's' : ''} <:gifflar:1443288439263989873>`
                } catch {
                    const packs = row.amount
                    return `<@${row.user_id}>: ${packs} pack${packs > 1 ? 's' : ''} <:gifflar:1443288439263989873>`
                }
            })

            const descriptions = await Promise.all(userPromises)
            const description = descriptions.join('\n')

            embed.setDescription(description)
            await interaction.editReply({ embeds: [embed] })
            return
        }

        if (subcommand === 'remove') {
            const user = interaction.options.getUser('user')!
            const amount = interaction.options.getInteger('amount')

            const body: RemoveDebtBody = { user_id: user.id }
            if (amount !== null) {
                body.amount = amount
            }

            const response = await fetch(`${config.api}/debt`, {
                method: 'DELETE',
                headers,
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                const error = await response.json()
                await interaction.deleteReply().catch(() => {})
                return await interaction.followUp({ content: error?.error || 'Failed to remove debt.', ephemeral: true })
            }

            if (amount !== null) {
                await interaction.editReply(`Removed ${amount} pack${amount > 1 ? 's' : ''} of debt from <@${user.id}>.`)
            } else {
                await interaction.editReply(`Removed all debt from <@${user.id}>.`)
            }
            return
        }
    } catch (err) {
        console.error('Debt command error', err)
        await interaction.deleteReply().catch(() => {})
        await interaction.followUp({ content: 'An error occurred while processing the command. Please try again later.', ephemeral: true })
    }
}
