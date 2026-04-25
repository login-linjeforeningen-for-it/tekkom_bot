import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

function normalizeGameField(value: string | null | undefined) {
    if (typeof value !== 'string') {
        return null
    }

    const trimmed = value.trim()
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
        return null
    }

    return trimmed
}

export default async function postGame(req: FastifyRequest, res: FastifyReply) {
    const {
        name,
        user,
        userId,
        avatar,
        details,
        state,
        application,
        start,
        party,
        image,
        imageText
    } = req.body as Game

    const { valid } = await tokenWrapper(req, res, ['tekkom_bot'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    const normalizedName = normalizeGameField(name)
    const normalizedUser = normalizeGameField(user)
    const normalizedAvatar = normalizeGameField(avatar)
    const normalizedStart = normalizeGameField(start)

    if (!normalizedName || !normalizedUser || !userId || !normalizedAvatar || !normalizedStart) {
        return res.status(400).send({ error: 'Please provide a valid game activity.' })
    }

    try {
        console.log(`Adding game '${normalizedName}' for user '${normalizedUser}'.`)
        const userQuery = await loadSQL('postUser.sql')
        await run(userQuery, [userId, normalizedAvatar, normalizedUser])
        const gameQuery = await loadSQL('postGame.sql')
        const gameResult = await run(gameQuery, [
            normalizedName,
            normalizeGameField(image),
            normalizeGameField(imageText),
        ])
        const gameId = gameResult.rows[0].id
        const gameActivityQuery = await loadSQL('postGameActivity.sql')
        await run(gameActivityQuery, [
            gameId,
            userId,
            normalizeGameField(details),
            normalizeGameField(state),
            normalizeGameField(application),
            normalizedStart,
            normalizeGameField(party),
        ])

        return res.send({ message: `Successfully added game ${normalizedName} for ${normalizedUser}.` })
    } catch (error) {
        console.log('Database error:', error)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
