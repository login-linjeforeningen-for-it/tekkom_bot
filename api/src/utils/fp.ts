import { preloadListenActivityQueries } from '#utils/listenActivityQueries.ts'
import { preloadGameActivityQueries } from './gameActivityQueries.ts'
import alertSlowQuery from '#utils/alertSlowQuery.ts'
import config from '#constants'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
    async function refreshQueries() {
        const start = Date.now()
        const newListenData = await preloadListenActivityQueries()
        const newGameData = await preloadGameActivityQueries()
        const duration = (Date.now() - start) / 1000
        alertSlowQuery(duration, 'cache')
        fastify.cachedListenJSON = Buffer.from(JSON.stringify(newListenData))
        fastify.cachedGameJSON = Buffer.from(JSON.stringify(newGameData))
        fastify.log.info('Activity queries refreshed')
    }

    refreshQueries()
    setInterval(refreshQueries, config.CACHE_TTL)
})
