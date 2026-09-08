import { AutocompleteInteraction } from 'discord.js'
import handleReopenAutoComplete from './handleReopenAutoComplete.ts'

export default async function Autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    switch (interaction.commandName) {
        case 'reopen': handleReopenAutoComplete(interaction); break
    }
}
