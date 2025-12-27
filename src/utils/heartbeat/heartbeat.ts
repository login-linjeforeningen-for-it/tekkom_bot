import config from '#config'

export default async function heartbeat() {
    try {
        setInterval(async() => {
            const response = await fetch(config.heartbeat.url, {
                method: 'POST'
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            const data = await response.json()
            return data
        }, config.heartbeat.interval)
    } catch (error) {
        console.log(`Error sending heartbeat: ${error}`)
    }
}
