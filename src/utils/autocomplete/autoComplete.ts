import { AutocompleteInteraction } from 'discord.js'
import handleDeployAndReleaseAutoComplete from './handleDeployAutoComplete.ts'
import handleReopenAutoComplete from './handleReopenAutoComplete.ts'
import handleGithubAutoComplete from '#utils/autocomplete/handleGithubAutoComplete.ts'
import handleRetroactiveAutoComplete from './handleRetroactiveAutoComplete.ts'

export default async function Autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    switch (interaction.commandName) {
        case 'retroactive': handleRetroactiveAutoComplete(interaction); break
        case 'reopen': handleReopenAutoComplete(interaction); break
        case 'issue': handleGithubAutoComplete(interaction); break
        case 'deploy':
        case 'release': handleDeployAndReleaseAutoComplete(interaction); break
    }
}
