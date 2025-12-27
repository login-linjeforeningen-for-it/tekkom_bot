import { GITHUB_API, GITHUB_ORGANIZATION } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getRepositories(limit: number, query: string): Promise<GithubRepoSearchResultItem[]> {
    try {
        logNullValue('getRepositories', ['limit'], [limit])
        const search = query ? `${query}+` : ''
        const response = await fetch(`${GITHUB_API}search/repositories?q=${search}org:${GITHUB_ORGANIZATION}&per_page=${limit}`, {
            headers: {
                'Authorization': `Bearer ${config.githubToken}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data.items
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Error while getting repositories: ${error}`)
        }

        return []
    }
}
