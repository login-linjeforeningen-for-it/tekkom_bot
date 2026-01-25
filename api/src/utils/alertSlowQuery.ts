import config from '#constants'

export default async function alertSlowQuery(duration: number, name: string) {
    const firstUpperCaseName = `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`
    if (duration > config.CACHE_TTL / 2 && config.WEBHOOK_URL) {
        console.warn(`${firstUpperCaseName} query exceeded half of cache TTL: ${duration.toFixed(2)}s`)

        await fetch(config.WEBHOOK_URL, {
            method: 'POST',
        })
    }
}
