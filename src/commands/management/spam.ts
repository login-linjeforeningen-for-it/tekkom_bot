import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import type { Roles } from '#interfaces'
import config from '#config'
import { Role } from 'discord.js'

const activeSpamJobs = new Map<string, { cancelled: boolean, resolve?: () => void }>()

function cancellableSleep(ms: number, job: { cancelled: boolean, resolve?: () => void }): Promise<void> {
    return new Promise(resolve => {
        const timer = setTimeout(resolve, ms)
        job.resolve = () => {
            clearTimeout(timer)
            resolve()
        }
    })
}

export const data = new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Send a message at a internal')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Channel to send the message in')
        .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread)
        .setRequired(true)
    )
    .addUserOption(option => option
        .setName('user')
        .setDescription('User to ping in the message')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('message')
        .setDescription('Message to send')
        .setRequired(true)
    )
    .addNumberOption(option => option
        .setName('interval')
        .setDescription('Interval in seconds between messages (max 86400s)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(86_400)
    )
    .addNumberOption(option => option
        .setName('count')
        .setDescription('Number of messages to send (max 1000)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('channel') ?? interaction.channel
    const user = interaction.options.getUser('user', true)
    const message = interaction.options.getString('message', true)
    const interval = interaction.options.getNumber('interval') ?? 5
    const count = interaction.options.getNumber('count') ?? 10

    const isAllowed = (interaction.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    if (!isAllowed) {
        return await interaction.reply({ content: 'Unauthorized.', ephemeral: true })
    }

    const permittedTypes = [
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
    ]

    if (!channel || !permittedTypes.includes(channel.type)) {
        return interaction.reply({ content: 'I can only spam in text channels or threads.', ephemeral: true })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textChannel = channel as any

    const job: { cancelled: boolean, resolve?: () => void } = { cancelled: false }
    activeSpamJobs.set(interaction.id, job)

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel_spam')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancelButton)

    await interaction.reply({
        content: `Starting to spam ${user} with your message every ${interval} seconds, ${count} times.`,
        ephemeral: true,
        components: [row],
    })

    const collector = interaction.channel?.createMessageComponentCollector({
        filter: i => i.customId === 'cancel_spam' && i.user.id === interaction.user.id,
        max: 1,
    })
    collector?.on('collect', async i => {
        job.cancelled = true
        job.resolve?.()
        await i.reply({ content: 'Spam cancelled.', ephemeral: true })
    })

    let sent = 0
    for (let i = 0; i < count; i++) {
        if (job.cancelled) break
        await textChannel.send(`${user}: ${message}`)
        sent++
        if (i < count - 1 && !job.cancelled) {
            await cancellableSleep(interval * 1000, job)
        }
    }

    collector?.stop()
    activeSpamJobs.delete(interaction.id)

    const disabledButton = ButtonBuilder.from(cancelButton).setDisabled(true)
    const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButton)

    await interaction.editReply({
        content: job.cancelled
            ? `Spam cancelled after ${sent} message(s).`
            : `Finished spamming ${user} (${sent} message(s) sent).`,
        components: [disabledRow],
    })
}
