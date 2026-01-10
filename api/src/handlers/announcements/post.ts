import run from '#db'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function postAnnouncements(req: FastifyRequest, res: FastifyReply) {
    const { title, description, channel, roles, embed, color, interval, time } = req.body as Announcement ?? {}
    const { valid } = await tokenWrapper(req, res)
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    if (!title?.length || !description?.length || !channel) {
        return res.status(400).send({ error: 'Title, description and channel must be provided.' })
    }

    try {
        console.log(`Adding announcement with title '${title}', description '${description}', channel '${channel}', roles '${roles}', embed '${embed}', color '${color}', interval '${interval}' and time '${time}'.`)

        await run(
            `INSERT INTO announcements (title, description, channel, roles, embed, color, interval, time) 
             SELECT $1, $2, $3, $4, $5, $6, $7, $8;`,
            [title, description, channel, roles || null, embed || null, color || null, interval || null, time || null]
        )

        return res.send({ message: `Successfully added announcement ${title[0]}${interval ? ` with interval ${interval}` : ''}.` })
    } catch (error) {
        console.log(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
