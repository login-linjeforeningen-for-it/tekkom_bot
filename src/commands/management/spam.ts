import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, TextChannel } from 'discord.js'
import type { Roles } from '#interfaces'
import config from '#config'
import { Role } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('spam')
    .setDescription('Send a message at a internal')
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('Channel to send the message in')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
    )
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to ping in the message')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('message')
            .setDescription('Message to send')
            .setRequired(true)
    )
    .addNumberOption(option =>
        option
            .setName('interval')
            .setDescription('Interval in seconds between messages (max 86400s)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(86_400)
    )
    .addNumberOption(option =>
        option
            .setName('count')
            .setDescription('Number of messages to send (max 100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100)
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

    if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: 'I can only spam in text channels.', ephemeral: true })
    }

    const textChannel = channel as TextChannel

    await interaction.reply({ content: `Starting to spam ${user} with your message every ${interval} seconds, ${count} times.`, ephemeral: true })

    for (let i = 0; i < count; i++) {
        await textChannel.send(`${user}: ${message}`)
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, interval * 1000))
        }
    }

    await interaction.followUp({ content: `Finished spamming ${user}.`, ephemeral: true })
}

