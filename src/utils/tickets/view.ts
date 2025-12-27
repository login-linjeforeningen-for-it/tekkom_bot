import {
    ActionRowBuilder,
    BaseGuildTextChannel,
    ButtonInteraction,
    Guild,
    MessageFlags,
    PermissionsBitField,
    StringSelectMenuBuilder,
    TextChannel,
    CategoryChannel,
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder
} from 'discord.js'
import { ticketIdPattern } from '#constants'
import formatChannelName from '#utils/tickets/format.ts'
import topics from '#utils/tickets/topics.ts'

export default async function handleViewTicket(interaction: ButtonInteraction) {
    // Fetches all text channels that the user has access to
    const guild = interaction.guild as Guild
    const channels = guild.channels.cache
        .filter(channel =>
            // Only considers text channels
            channel instanceof TextChannel &&
            // Matches ticket ID scheme
            ticketIdPattern.test(channel.name) &&
            channel.permissionsFor(interaction.user)?.has(PermissionsBitField.Flags.ViewChannel)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any

    // Maps the filtered channels to select menu options
    const options = channels.map((channel: BaseGuildTextChannel) => ({
        label: `${formatChannelName(channel.name)} - ${channel.topic}`,
        value: channel.id,
    }))

    if (options.length === 0) {
        // If no channels are available, send a message saying so
        await interaction.reply({
            content: 'You have no open tickets to view.',
            flags: MessageFlags.Ephemeral
        })
        return
    }

    // Create a channel select menu for choosing a channel
    const selectChannel = new StringSelectMenuBuilder()
        .setCustomId('view_ticket_command')
        .setPlaceholder('Select the ticket you want to view.')
        .addOptions(options)

    // Create an action row that holds the select menus
    const channel = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectChannel)

    // Send the message with the select menus (Pokémon and channel selection)
    await interaction.reply({
        components: [channel],
        flags: MessageFlags.Ephemeral
    })
}

export async function viewTicket(interaction: ButtonInteraction, view?: boolean) {
    const guild = interaction.guild

    if (guild === null) {
        return
    }

    // @ts-expect-error
    const channel = guild.channels.cache.get(interaction.values[0]) as TextChannel | undefined
    if (!channel || !(channel instanceof TextChannel)) {
        return await interaction.reply({
            content: 'Could not find the specified channel.',
            flags: MessageFlags.Ephemeral
        })
    }

    try {
        // Fetches "tickets" category
        const archive = guild?.channels.cache.find(c => c instanceof CategoryChannel && c.name === 'tickets') as CategoryChannel

        if (!archive) {
            return await interaction.reply({
                content: 'Could not find "tickets" category.',
                flags: MessageFlags.Ephemeral
            })
        }

        // Moves the channel to the "tickets" category
        await channel.setParent(archive.id, { lockPermissions: false })

        // Adds the user to the channel
        await channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
        })

        const selectTags = new StringSelectMenuBuilder()
            .setCustomId('add_tag_to_create')
            .setPlaceholder('Add tags')
            .addOptions(topics)
            .setMaxValues(10)

        const selectRoles = new RoleSelectMenuBuilder()
            .setCustomId('add_role_to_ticket')
            .setPlaceholder('Add roles')
            .setMinValues(1)
            .setMaxValues(25)

        const selectUsers = new UserSelectMenuBuilder()
            .setCustomId('add_user_to_ticket')
            .setPlaceholder('Add users')
            .setMinValues(1)
            .setMaxValues(25)

        const tags = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectTags)
        const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
        const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)

        const content = `Viewed by <@${interaction.user.id}>.`
        const components = view ? undefined : [tags, roles, users]
        await channel.send({ content, components })
        await interaction.reply({
            content: `${formatChannelName(channel.name)} viewed.`,
            flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        console.log(`Error while viewing ticket: ${error}`)
        await interaction.reply({
            content: 'There was an error viewing the ticket. Please try again later.',
            flags: MessageFlags.Ephemeral
        })
    }
}
