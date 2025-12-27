import config from '#config'

const tekkomBotApiToken = config.tekkomBotApiToken

export default async function getMessages() {
    try {
        const url = new URL(`${config.api}/announcements`)
        url.searchParams.set('shouldBeSent', 'true')
        url.searchParams.set('active', 'true')
        const response = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
                'btg': 'tekkom_bot',
                'Authorization': `Bearer ${tekkomBotApiToken}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.log(`Error while fetching messages from Queenbee: ${error}`)
        return []
    }
}
