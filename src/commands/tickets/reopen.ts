import sanitize from '#utils/sanitize.ts'
import reopenTicket from '#utils/tickets/reopen.ts'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('reopen')
    .setDescription('Reopens a ticket.')
    .addStringOption(option =>
        option.setName('ticket')
            .setDescription('Search for a ticket')
            .setAutocomplete(true)
    )

export async function execute(interaction: ChatInputCommandInteraction<'cached'>) {
    const ticket = sanitize(interaction.options.getString('ticket') || '')
    reopenTicket(interaction, ticket)
    return
}
