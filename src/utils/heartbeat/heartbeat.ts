import { schedule } from 'node-cron'
import config from '#config'

export default async function heartbeat() {
    try {
        // Disables heartbeat if not running in Kubernetes to prevent timed
        // out requests when testing locally without a vpn.
        if (config.kubernetesServicePort) {
            schedule('* * * * *', async() => {
                const response = await fetch(config.heartbeatUrl, {
                    method: 'POST'
                })

                if (!response.ok) {
                    throw new Error(await response.text())
                }

                const data = await response.json()
                return data
            })
        }
    } catch (error) {
        console.log(error)
    }
}
