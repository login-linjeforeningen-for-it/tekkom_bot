import preloadGameActivityQueriesHot from './gameActivityQueriesHot.ts'
import alertSlowQuery from '#utils/alertSlowQuery.ts'
import config from '#constants'
import fp from 'fastify-plugin'
import preloadListenActivityQueriesHot from './listenActivityQueriesHot.ts'
import preloadListenActivityQueriesCold from './listenActivityQueriesCold.ts'
import preloadGameActivityQueriesCold from './gameActivityQueriesCold.ts'

export default fp(async (fastify) => {
    fastify.gameHot = {}
    fastify.gameCold = {}
    fastify.listenHot = {}
    fastify.listenCold = {}

    async function refreshHot() {
        const start = Date.now()

        fastify.gameHot = await preloadGameActivityQueriesHot()
        console.log('Refresh games HOT (keys):', Object.keys(fastify.gameHot))
        fastify.listenHot = await preloadListenActivityQueriesHot()
        console.log('Refresh listens HOT (keys):', Object.keys(fastify.listenHot))

        alertSlowQuery((Date.now() - start) / 1000, 'cache hot')
        console.log('Hot activity queries refreshed')
    }

    async function refreshCold() {
        const start = Date.now()

        fastify.gameCold = await preloadGameActivityQueriesCold()
        console.log('Refresh games COLD (keys):', Object.keys(fastify.gameCold))
        fastify.listenCold = await preloadListenActivityQueriesCold()
        console.log('Refresh listens COLD (keys):', Object.keys(fastify.listenCold))

        alertSlowQuery((Date.now() - start) / 1000, 'cache-cold')
        console.log('Cold activity queries refreshed')
    }

    function rebuildBuffers() {
        fastify.cachedGameJSON = Buffer.from(
            JSON.stringify({ ...fastify.gameCold, ...fastify.gameHot })
        )

        fastify.cachedListenJSON = Buffer.from(
            JSON.stringify({ ...fastify.listenCold, ...fastify.listenHot })
        )
    }

    async function refreshHotAndRebuild() {
        await refreshHot()
        rebuildBuffers()
    }

    async function refreshColdAndRebuild() {
        await refreshCold()
        rebuildBuffers()
    }

    refreshColdAndRebuild()
        .then(() => refreshHotAndRebuild())
        .catch((error) => console.log('Initial cache population failed, will retry on next interval', error))

    setInterval(refreshHotAndRebuild, config.CACHE_TTL_HOT)
    setInterval(refreshColdAndRebuild, config.CACHE_TTL_COLD)
})
