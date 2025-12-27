import config from '#config'

const tekkomBotBtgToken = config.tekkomBotBtgToken

export default async function postBtg(name: string, service: string, author: string): Promise<boolean> {
    try {
        const response = await fetch(`${config.api}/btg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'btg': 'tekkom_bot_btg',
                'Authorization': `Bearer ${tekkomBotBtgToken}`
            },
            body: JSON.stringify({ name, service, author })
        })

        if (!response.ok || response.status !== 200) {
            throw new Error(await response.text())
        }

        return true
    } catch (error) {
        console.log(`Error while posting BTG: ${error}`)
        return false
    }
}
