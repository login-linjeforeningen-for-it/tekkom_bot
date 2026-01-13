import cors from '@fastify/cors'
import Fastify from 'fastify'
import apiRoutes from './routes.ts'
import cron from './utils/cron/cron.ts'
import fp from './utils/fp.ts'
import fs from 'fs'
import path from 'path'

import getIndex from './handlers/index/getIndex.ts'
import getFavicon from './handlers/favicon/getFavicon.ts'

const fastify = Fastify({
    logger: true
})

fastify.decorate('cachedListenJSON', Buffer.from(''))
fastify.decorate('cachedGameJSON', Buffer.from(''))
fastify.decorate('cachedCurrentlyListening', Buffer.from(''))
fastify.decorate('favicon', fs.readFileSync(path.join(process.cwd(), 'public', 'favicon.ico')))
fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
})

const port = Number(process.env.PORT) || 8080

fastify.register(fp)
fastify.register(apiRoutes, { prefix: '/api' })
fastify.get('/', getIndex)
fastify.get('/favicon.ico', getFavicon)

async function start() {
    try {
        await fastify.listen({ port, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

async function main() {
    cron()
    start()
}

main()
