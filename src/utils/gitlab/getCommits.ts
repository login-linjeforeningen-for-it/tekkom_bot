import { GITLAB_API } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getCommits(id: number, branch = 'main'): Promise<Commit[]> {
    try {
        logNullValue('getCommits', ['id'], [id])
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/commits?per_page=5&ref_name=${branch}`, {
            headers: {
                'Private-Token': config.privateToken,
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Error while getting commits: ${error}`)
        }

        return []
    }
}
