import type { Roles } from '#interfaces'
import config from '#config'
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Role,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    TextChannel,
    ComponentType,
} from 'discord.js'

export default async function clear(interaction: ChatInputCommandInteraction) {
    const isAllowed = (interaction.member?.roles as unknown as Roles)?.cache
        .some((role: Role) => role.id === config.roleID || role.id === config.styret)

    if (!isAllowed) {
        return interaction.reply({
            content: 'Unauthorized.',
            flags: MessageFlags.Ephemeral,
        })
    }

    if (!interaction.channel || interaction.channel.type !== 0) {
        return interaction.reply({
            content: 'This command can only be used in text channels.',
            flags: MessageFlags.Ephemeral,
        })
    }

    const channel = interaction.channel as TextChannel

    const messages = await channel.messages.fetch({ limit: 100 })
    const messageCount = messages.size

    if (messageCount === 0) {
        return interaction.reply({
            content: 'There are no messages to delete.',
            flags: MessageFlags.Ephemeral,
        })
    }

    const embed = new EmbedBuilder()
        .setTitle('Confirm channel clear')
        .setColor('#ff0000')
        .setDescription(`You are about to delete **${messageCount} messages** in ${channel}.`)

    if (messageCount > 25) {
        embed.addFields({
            name: 'Warning',
            value: 'This will remove a large number of messages.',
        })
    }

    if (messageCount > 50) {
        embed.addFields({
            name: 'Critical warning',
            value: 'This action is **destructive** and cannot be undone.',
        })
    }

    const confirmButton = new ButtonBuilder()
        .setCustomId('clear_confirm')
        .setLabel('Yes, clear channel')
        .setStyle(ButtonStyle.Danger)

    const cancelButton = new ButtonBuilder()
        .setCustomId('clear_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancelButton, confirmButton)

    await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral,
    })

    const reply = await interaction.fetchReply()

    const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30_000,
    })

    collector.on('collect', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
            return btn.reply({
                content: 'You cannot respond to this confirmation.',
                flags: MessageFlags.Ephemeral,
            })
        }

        if (btn.customId === 'clear_cancel') {
            collector.stop('cancelled')
            return btn.update({
                content: 'Channel clear cancelled.',
                embeds: [],
                components: [],
            })
        }

        if (btn.customId === 'clear_confirm') {
            collector.stop('confirmed')
            await btn.update({
                content: 'Deleting...',
                embeds: [],
                components: [],
            })

            let recentDeleted = 0
            while (true) {
                const batch = await channel.bulkDelete(100, true)
                if (batch.size === 0) {
                    break
                }

                recentDeleted += batch.size
                await new Promise((r) => setTimeout(r, 250))
            }

            await btn.editReply({
                content: `Deleted ${recentDeleted} recent messages, now deleting old messages...`,
                embeds: [],
                components: [],
            })

            let oldDeleted = 0
            let previousUpdate = 0
            let lastId: string | undefined
            while (true) {
                const batch = await channel.messages.fetch({ limit: 100, before: lastId })
                if (batch.size === 0) {
                    break
                }

                lastId = batch.last()?.id

                for (const msg of batch.values()) {
                    const isOld = Date.now() - msg.createdTimestamp >= 14 * 24 * 60 * 60 * 1000
                    if (!isOld) {
                        continue
                    }

                    if (oldDeleted - previousUpdate >= 10) {
                        previousUpdate = oldDeleted
                        await btn.editReply({
                            content: `Deleted ${recentDeleted} recent messages and ${oldDeleted} old messages. Still going...`,
                            embeds: [],
                            components: [],
                        })
                    }

                    try {
                        await msg.delete()
                        oldDeleted++
                        await new Promise(r => setTimeout(r, 250))
                    } catch {
                        // skips any that fail
                    }
                }
            }

            return btn.editReply({
                content: `Deleted **${recentDeleted} recent ${oldDeleted > 0 && `and ${oldDeleted}`} old messages**.`,
                embeds: [],
                components: [],
            })
        }
    })

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            await interaction.editReply({
                content: 'Confirmation timed out.',
                embeds: [],
                components: [],
            })
        }
    })
}
