import {
    ActionRowBuilder,
    ButtonInteraction,
    CategoryChannel,
    Collection,
    MessageFlags,
    StringSelectMenuBuilder,
    TextChannel
} from 'discord.js'
import type { CategoryChildChannel } from 'discord.js'
import { getTickets } from '#utils/tickets/ticket.ts'
import formatChannelName from '#utils/tickets/format.ts'
import { MAX_CHANNELS, ticketIdPattern } from '#constants'
import { closeTicket } from '#utils/ticket.ts'
import closeChannel from '#utils/tickets/closeChannel.ts'

export async function handleCloseTicket(interaction: ButtonInteraction) {
    const guild = interaction.guild

    if (guild === null) {
        return
    }

    const currentChannel = interaction.channel as TextChannel

    // Checks if the current channel name fits the ticket ID scheme
    if (ticketIdPattern.test(currentChannel.name)) {
        try {
            // Closes the channel
            await closeChannel({ guild, currentChannel })

            // Closes the ticket in Zammad
            closeTicket(Number(currentChannel.name), interaction.user.username)

            // Lets the user know that the ticket has been archived
            await interaction.editReply({
                content: `Closed by ${interaction.user.username}.`,
            })
        } catch (error) {
            console.log(`Error while closing ticket: ${error}`)

            await interaction.editReply({
                content: 'There was an error closing the ticket. Please try again later.'
            })
        }
    } else {
        // Fetch all text channels that the user has access to
        const options = await getTickets(interaction)

        // Create a channel select menu for choosing a channel
        const selectChannel = new StringSelectMenuBuilder()
            .setCustomId('close_ticket_selected')
            .setPlaceholder('Select a ticket to close')
            .addOptions(options)

        // Create an action row that holds the select menu
        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectChannel)

        // Send the message with the select menu
        await interaction.reply({
            content: 'Choose a ticket to close:',
            components: [actionRow],
            flags: MessageFlags.Ephemeral
        })
    }
}

export async function handleCloseSelectedTicket(interaction: ButtonInteraction) {
    const guild = interaction.guild
    if (!guild) {
        return await interaction.reply({
            content: 'Guild not found.',
            flags: MessageFlags.Ephemeral
        })
    }


    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channels: Collection<string, CategoryChildChannel> = guild.channels.cache as any

        // Checks and handles max closed channels
        if (channels.size >= MAX_CHANNELS) {
            const sortedChannels: { channel: CategoryChildChannel; timestamp: number }[] = []

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_, channel] of channels) {
                if (channel instanceof TextChannel) {
                    try {
                        const lastMessageId = channel.lastMessageId || ''
                        const lastMessage = await channel.messages.fetch(lastMessageId)

                        if (lastMessage) {
                            const timestamp = lastMessage.createdTimestamp

                            sortedChannels.push({
                                channel,
                                timestamp,
                            })
                        }
                    } catch {
                        // Assumes no activity if no messages can be found
                        sortedChannels.push({
                            channel,
                            timestamp: 0,
                        })
                    }
                } else {
                    // Not a TextChannel
                    sortedChannels.push({
                        channel,
                        timestamp: 0
                    })
                }
            }

            sortedChannels.sort((a, b) => a.timestamp - b.timestamp)

            // Deletes 10 oldest channels (20%, to avoid fetching all channels every time someone closes a ticket)
            for (let i = 0; i < 10; i++) {
                const channelToDelete = sortedChannels[i]?.channel
                if (channelToDelete) {
                    await channelToDelete.delete('Archiving a new ticket, deleted the oldest one.')
                    console.warn(`Deleted channel: ${channelToDelete.name}`)
                }
            }
        }

        // Get the selected channel from interaction.customId (assuming it contains the channel ID)
        // @ts-expect-error
        const selectedChannel = channels.get(interaction.values[0]) as TextChannel | undefined
        if (!selectedChannel || !(selectedChannel instanceof TextChannel)) {
            return await interaction.reply({
                content: 'Could not find the specified channel.',
                flags: MessageFlags.Ephemeral
            })
        }

        // Get the "archived-tickets" category
        const archiveCategory = guild.channels.cache.find(
            c => c instanceof CategoryChannel && c.name === 'archived-tickets'
        ) as CategoryChannel | undefined

        if (!archiveCategory) {
            return await interaction.reply({
                content: 'Could not find the "archived-tickets" category.',
                flags: MessageFlags.Ephemeral
            })
        }

        // Move the channel to the "archived-tickets" category
        await selectedChannel.setParent(archiveCategory.id, { lockPermissions: false })

        // Remove the user's permission to view the channel
        await selectedChannel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: false,  // Removes the user's ability to see the channel
        })

        // Sends a message to the ticket that it was closed
        await selectedChannel.send({
            content: `Closed by ${interaction.user.username}.`
        })

        // Send a confirmation message to the user who closed the ticket
        await interaction.reply({
            content: `${formatChannelName(selectedChannel.name)} closed.`,
            flags: MessageFlags.Ephemeral
        })

    } catch (error) {
        console.log(`Failed to close the ticket: ${error}`)
        await interaction.reply({
            content: 'There was an error closing the ticket. Please try again later.',
            flags: MessageFlags.Ephemeral
        })
    }
}
