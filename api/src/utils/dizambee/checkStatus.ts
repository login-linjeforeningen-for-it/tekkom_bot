import config from '#constants'

export default async function checkStatus(ticketID: string) {
    try {
        const response = await fetch(`${config.ZAMMAD_API}/tickets/${ticketID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${config.ZAMMAD_TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()

        // state_id 4 = closed
        return data.state_id === 4
    } catch (error) {
        console.log(`Error while checking status: ${error}`)
        return false
    }
}
