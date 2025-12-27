import config from '#constants'
import getSpotifyToken from '#utils/getSpotifyToken.ts'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function getTrackPreview(req: FastifyRequest, res: FastifyReply) {
    const { valid } = await tokenWrapper(req, res, ['tekkom_bot'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    try {
        const { id } = req.params as { id: string } ?? {}
        const token = await getSpotifyToken()
        const response = await fetch(`${config.SPOTIFY_API_TRACK_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()
        console.log(`Track preview: ${data}`)
        res.send({ data })
    } catch (error) {
        console.log(`Error while getting track preview: ${error}`)
        return { url: null, error }
    }
}
