import config from '#constants'
import run from '#db'

export default async function checkMaxConnections() {
    try {
        const result = await run('SELECT count(*) FROM pg_stat_activity WHERE state=\'active\';')
        const active = Number(result.rows[0].count)
        const maxRes = await run('SHOW max_connections;')
        const maxConnections = Number(maxRes.rows[0].max_connections)
        const THRESHOLD = Math.floor(maxConnections / 2)

        if (active > THRESHOLD && config.WEBHOOK_URL) {
            console.warn(`Active connections ${active} > ${THRESHOLD}, sending Discord alert...`)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: { content?: string; embeds: any[] } = {
                embeds: [
                    {
                        title: '🐝 TekKom Bot Database Max Connections 🐝',
                        description: `🐝 Many connections detected: ${active.toFixed(2)}/${THRESHOLD}.`,
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }
                ]
            }

            await fetch(config.WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
        } else {
            console.log(`Active connections: ${active}`)
        }
    } catch (error) {
        console.log(`checkMaxConnections error: ${error}`)
    }
}
