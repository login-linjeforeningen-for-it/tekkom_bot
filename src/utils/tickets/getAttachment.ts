import config from '#config'

export default async function getAttachment(url: string) {
    try {
        const response = await fetch(`${config.api}/dizambee/attachment/${url}`)

        if (!response.ok) {
            throw new Error(await response.json())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.log(`Failed to fetch attachment "${url}". Reason: ${JSON.stringify(error)}`)
    }
}
