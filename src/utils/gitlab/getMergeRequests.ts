import { GITLAB_API } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getOpenMergeRequests(projectId: number): Promise<MergeRequest[]> {
    try {
        logNullValue('getOpenMergeRequests', ['projectId'], [projectId])
        const response = await fetch(`${GITLAB_API}projects/${projectId}/merge_requests?state=opened&per_page=25`, {
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Error while getting open merge requests: ${error}`)
        }

        return []
    }
}
