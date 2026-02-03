import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import packagejson from '#package' with { type: 'json' }
import config from '#config'

const { version } = packagejson

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Inform about the current status of the bot responding')

export async function execute(message: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('Status')
        .setColor('#fd8738')
        .addFields(
            { name: 'Version', value: version, inline: true },
            { name: 'Bot ID', value: config.runningId, inline: true }
        )
        .setTimestamp()
    await message.reply({ embeds: [embed]})
}
