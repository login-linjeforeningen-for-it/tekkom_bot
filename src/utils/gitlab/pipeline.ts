import { GITLAB_API } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getPipelines(id: number): Promise<Pipeline[]> {
    try {
        logNullValue('getPipelines', ['id'], [id])
        const response = await fetch(`${GITLAB_API}projects/${id}/pipelines`, {
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
        console.log(`Error while getting pipelines: ${error}`)
        return []
    }
}

export async function getJobsForPipeline(projectID: number, id: number): Promise<Job[]> {
    try {
        logNullValue('getJobsForPipeline', ['projectID', 'id'], [projectID, id])
        const response = await fetch(`${GITLAB_API}projects/${projectID}/pipelines/${id}/jobs`, {
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
            console.log(`Error while getting jobs for pipeline: ${error}`)
        }

        return []
    }
}

export async function getBridgesForPipeline(projectID: number, id: number): Promise<Job[]> {
    try {
        logNullValue('getBridgesForPipeline', ['projectID', 'id'], [projectID, id])
        const response = await fetch(`${GITLAB_API}projects/${projectID}/pipelines/${id}/bridges`, {
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
            console.log(`Error while getting bridges for pipeline: ${error}`)
        }

        return []
    }
}