import 'fastify'

declare module 'fastify' {
    interface FastifyInstance {
        favicon: Buffer
        gameHot: object
        gameCold: object
        listenHot: object
        listenCold: object
    }
}
