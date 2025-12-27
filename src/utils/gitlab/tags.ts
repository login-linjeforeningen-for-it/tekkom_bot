import { GITLAB_API } from '#constants'
import config from '#config'
import logNullValue from '#utils/logNullValue.ts'

export default async function getTags(id: number): Promise<Tag[]> {
    try {
        logNullValue('getTags', ['id'], [id])
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/tags?per_page=3`, {
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
            console.log(`Error while getting tags: ${error}`)
        }

        return []
    }
}

export async function postTag(id: number, tag: string, ref?: string): Promise<Tag | number> {
    try {
        logNullValue('getTags', ['id', 'tag'], [id, tag])
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/tags`, {
            method: 'POST',
            headers: {
                'Private-Token': config.privateToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tag_name: tag,
                ref: ref || 'main',
                message: `Release v${tag}`
            })
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Error posting tag: ${error}`)
            return 400
        }

        if (error.message.includes('already exists')) {
            return 409
        }

        console.log(`Error posting tag: ${error}`)
        return 404
    }
}

export async function deleteTag(id: number, tag: string): Promise<boolean> {
    try {
        logNullValue('getTags', ['id', 'tag'], [id, tag])
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/tags/${encodeURIComponent(tag)}`, {
            method: 'DELETE',
            headers: {
                'Private-Token': config.privateToken,
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return true
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.log(`Failed to delete tag ${tag}:`, error)
        }

        return false
    }
}
