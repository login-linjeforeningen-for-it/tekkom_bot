import { GITLAB_API } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getRepositories(limit: number, query: string): Promise<RepositorySimple[]> {
    try {
        logNullValue('getRepositories', ['limit'], [limit])
        const search = query ? `&search=${query}` : ''
        const response = await fetch(`${GITLAB_API}projects?simple=true&archived=false${search}`, {
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data.slice(0, limit)
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Error while getting repositories: ${error}`)
        }

        return []
    }
}
