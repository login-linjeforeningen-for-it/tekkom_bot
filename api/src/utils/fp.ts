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
        fastify.listenHot = await preloadListenActivityQueriesHot()

        alertSlowQuery((Date.now() - start) / 1000, 'cache hot')
        fastify.log.debug('Hot activity queries refreshed')
    }

    async function refreshCold() {
        const start = Date.now()

        fastify.gameCold = await preloadGameActivityQueriesCold()
        fastify.listenCold = await preloadListenActivityQueriesCold()

        alertSlowQuery((Date.now() - start) / 1000, 'cache-cold')
        fastify.log.info('Cold activity queries refreshed')
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
        .catch((err) => fastify.log.error({ err }, 'Initial cache population failed, will retry on next interval'))

    setInterval(refreshHotAndRebuild, config.CACHE_TTL_HOT)
    setInterval(refreshColdAndRebuild, config.CACHE_TTL_COLD)
})
