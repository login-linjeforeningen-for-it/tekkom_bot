import config from '#constants'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function getTicket(req: FastifyRequest, res: FastifyReply) {
    const { ticketID } = req.params as { ticketID: string }

    try {
        const response = await fetch(`${config.ZAMMAD_API}/tickets/${ticketID}`, {
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
        console.log(`Error while getting ticket: ${error}`)
        res.status(500).send(error)
    }
}
