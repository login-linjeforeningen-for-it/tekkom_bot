import {
    ActionRowBuilder,
    CategoryChannel,
    ChatInputCommandInteraction,
    MessageFlags,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    TextChannel,
    UserSelectMenuBuilder
} from 'discord.js'
import topics from '#utils/tickets/topics.ts'
import formatChannelName from '#utils/tickets/format.ts'

export default async function reopenTicket(interaction: ChatInputCommandInteraction<'cached'>, ticket: string) {
    const guild = interaction.guild

    if (guild === null) {
        return
    }

    const channel = guild.channels.cache.get(ticket) as TextChannel | undefined
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

        const content = `${interaction.user}, your ticket has been reopened!\n` +
            'Please select the tags, roles, and users you want to add to this ticket.\n' +
            'Note that tags can only be set once per 5 minutes.'
        const components = [tags, roles, users]
        await channel.send({ content, components })

        await interaction.reply({
            content: `${formatChannelName(channel.name)} reopened.`,
            flags: MessageFlags.Ephemeral
        })
    } catch (error) {
        console.log(`Error while reopening ticket: ${error}`)
        await interaction.reply({
            content: 'There was an error reopening the ticket. Please try again later.',
            flags: MessageFlags.Ephemeral
        })
    }
}
