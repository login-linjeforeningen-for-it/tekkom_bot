
import 'fastify'

declare module 'fastify' {
    interface FastifyInstance {
        cachedListenJSON: Buffer
        cachedCurrentlyListening: Buffer
        cachedGameJSON: Buffer
    }
}
