import getRepositories from '#utils/gitlab/getRepositories.ts'
import { AutocompleteInteraction } from 'discord.js'
import sanitize from '#utils/sanitize.ts'

const REPOSITORY = 'repository'
const DEPLOY = 'deploy'

export default async function handleDeployAndReleaseAutoComplete(interaction: AutocompleteInteraction<'cached'>) {
    const focusedName = interaction.options.getFocused(true).name
    const query = sanitize(interaction.options.getFocused(true).value).toLowerCase()
    let relevant = new Set<RepositorySimple>()
    const isDeploy = interaction.commandName === DEPLOY
    const repositories = await getRepositories(25, query)
    const matchText = query.length > 0 ? `matching '${query}'` : ''
    const fallbackResult = `No repositories ${matchText} are ready for ${isDeploy ? 'deployment' : 'release'}.`

    // Autocompletes repositories
    if (focusedName === REPOSITORY) {
        if (query.length) {
            for (const repo of repositories) {
                const name = repo.name.toLowerCase()
                if (name.includes(query)) {
                    relevant.add(repo)
                }
            }
        } else {
            relevant = new Set(repositories)
        }
    }

    if (!relevant.size) {
        return await interaction.respond([{name: fallbackResult, value: fallbackResult}])
    }

    const seen: string[] = []
    const uniqueResponse: {name: string, value: string}[] = []
    // eslint-disable-next-line array-callback-return
    Array.from(relevant).slice(0, 25).map((item: RepositorySimple) => {
        const name = item.name
        if (!seen.includes(name)) {
            seen.push(name)
            uniqueResponse.push({
                name: name,
                value: name
            })
        }
    })

    await interaction
        .respond(uniqueResponse)
        .catch(console.log)
}
