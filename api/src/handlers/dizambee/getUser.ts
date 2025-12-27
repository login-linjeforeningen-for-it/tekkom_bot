import type { FastifyReply, FastifyRequest } from 'fastify'
import config from '#constants'

export default async function getUser(req: FastifyRequest, res: FastifyReply) {
    const { userID } = req.params as { userID: string }

    try {
        const response = await fetch(`${config.ZAMMAD_API}/users/${userID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${config.ZAMMAD_TOKEN}`
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.log(`Error while getting user: ${error}`)
        res.status(500).send(error)
    }
}
