import config from '#constants'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function getUsers(_: FastifyRequest, res: FastifyReply) {
    try {
        const response = await fetch(`${config.ZAMMAD_API}/users`, {
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
        console.log(`Error while getting users: ${error}`)
        res.status(500).send(error)
    }
}
