
import 'fastify'

declare module 'fastify' {
    interface FastifyInstance {
        cachedListenJSON: Buffer
        cachedGameJSON: Buffer
    }
}
