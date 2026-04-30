import type { FastifyReply, FastifyRequest } from 'fastify'
import { runOnce } from '#db'

export default async function getDatabaseHealth(_: FastifyRequest, res: FastifyReply) {
    const startedAt = performance.now()

    try {
        await runOnce('SELECT 1;')
        const latency = Math.max(0, Math.round(performance.now() - startedAt))

        res.header('x-monitor-delay-ms', String(latency))
        return res.send({
            ok: true,
            service: 'tekkom_bot_database',
            latency,
        })
    } catch (error) {
        const latency = Math.max(0, Math.round(performance.now() - startedAt))

        res.header('x-monitor-delay-ms', String(latency))
        return res.status(503).send({
            ok: false,
            service: 'tekkom_bot_database',
            latency,
            error: error instanceof Error ? error.message : 'Database health check failed',
        })
    }
}
