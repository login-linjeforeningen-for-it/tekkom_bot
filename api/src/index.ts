import cors from '@fastify/cors'
import Fastify from 'fastify'
import apiRoutes from './routes.ts'
import cron from './utils/cron/cron.ts'
import fp from './utils/fp.ts'
import fs from 'fs'
import path from 'path'
import { installJsonConsoleLogger, log } from './utils/jsonLogger.ts'

import getIndex from './handlers/index/getIndex.ts'
import getFavicon from './handlers/favicon/getFavicon.ts'

installJsonConsoleLogger()

const fastify = Fastify({
    logger: {
        level: process.env.LOG_LEVEL ?? 'info',
        base: {
            service: 'tekkom_bot_api',
            runtime: 'api',
            environment: process.env.NODE_ENV ?? 'development',
        },
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        formatters: {
            level(label) {
                return { level: label }
            }
        }
    }
})

fastify.decorate('cachedListenJSON', Buffer.from(''))
fastify.decorate('cachedGameJSON', Buffer.from(''))
fastify.decorate('favicon', fs.readFileSync(path.join(process.cwd(), 'public', 'favicon.ico')))
fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD']
})

const port = Number(process.env.PORT) || 8080

fastify.register(fp, { timeout: 30000 })
fastify.register(apiRoutes, { prefix: '/api' })
fastify.get('/', getIndex)
fastify.get('/favicon.ico', getFavicon)

async function start() {
    try {
        await fastify.listen({ port, host: '0.0.0.0' })
        log('info', 'TekKom Bot API started', {
            event: 'api.started',
            port,
        })
    } catch (error) {
        console.error('Error while starting API', error)
        process.exit(1)
    }
}

async function main() {
    cron()
    start()
}

main()
