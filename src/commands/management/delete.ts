import clear from '#utils/clear.ts'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Clears all messages in the current channel.')

export async function execute(interaction: ChatInputCommandInteraction) {
    clear(interaction)
}
