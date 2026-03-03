import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    TextChannel,
    EmbedBuilder,
    ChannelType,
    User
} from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('retroactive')
    .setDescription('Retroactively add roles based on reactions')
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel the message is in')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('message_id')
        .setDescription('The ID of the message')
        .setRequired(true)
    )
    .addRoleOption(option => option
        .setName('role')
        .setDescription('The role to assign')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('emoji')
        .setDescription('The emoji to check for')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

export async function execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('channel') as TextChannel
    const messageId = interaction.options.getString('message_id')
    const role = interaction.options.getRole('role')
    const emoji = interaction.options.getString('emoji')

    if (!channel || !messageId || !role || !emoji) {
        return await interaction.reply({
            content: 'Please provide all required arguments.',
            flags: MessageFlags.Ephemeral
        })
    }

    if (!channel.isTextBased()) {
        return await interaction.reply({
            content: 'The selected channel must be a text channel.',
            flags: MessageFlags.Ephemeral
        })
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral })

    try {
        const message = await channel.messages.fetch(messageId)
        const reaction = message.reactions.cache.find(r => r.emoji.name === emoji || r.emoji.toString() === emoji || r.emoji.id === emoji)

        if (!reaction) {
            return await interaction.editReply({
                content: `Could not find reaction with emoji ${emoji} on message ${messageId}.`
            })
        }

        const users: User[] = []
        let lastId

        while (true) {
            const fetchedUsers = await reaction.users.fetch({ limit: 100, after: lastId })
            if (fetchedUsers.size === 0) break
            users.push(...fetchedUsers.values())
            lastId = fetchedUsers.last()?.id
        }

        let addedCount = 0
        let failedCount = 0

        for (const user of users) {
            if (user.bot) continue
            try {
                const member = await interaction.guild?.members.fetch(user.id)
                if (member) {
                    await member.roles.add(role.id)
                    addedCount++
                }
            } catch (error) {
                console.error(`Failed to add role to user ${user.id}:`, error)
                failedCount++
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Retroactive Role Assignment')
            .setDescription(`Processed ${users.length} reactions.`)
            .addFields(
                { name: 'Role Added', value: `${addedCount}`, inline: true },
                { name: 'Failed', value: `${failedCount}`, inline: true }
            )
            .setColor('Green')

        await interaction.editReply({ embeds: [embed] })

    } catch (error) {
        console.error(error)
        await interaction.editReply({
            content: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
    }
}
