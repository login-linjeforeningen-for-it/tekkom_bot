import config from '#config'

const tekkomBotBtgToken = config.tekkomBotBtgToken

export default async function getBtg(): Promise<Btg[]> {
    try {
        const response = await fetch(`${config.api}/btg`, {
            headers: {
                'Content-Type': 'application/json',
                'btg': 'tekkom_bot_btg',
                'Authorization': `Bearer ${tekkomBotBtgToken}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.log(`Error while getting BTG: ${error}`)
        return []
    }
}
