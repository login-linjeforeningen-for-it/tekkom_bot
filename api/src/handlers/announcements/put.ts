import run from '#db'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

type PutAnnouncements = {
    id: number
    title: string[]
    description: string[]
    channel: string
    roles: string[]
    embed?: boolean
    color?: string
    interval: string
    time: string
}

export default async function putAnnouncements(req: FastifyRequest, res: FastifyReply) {
    const { id, title, description, channel, roles, embed, color, interval, time } = (req.body as PutAnnouncements) ?? {}
    const { valid } = await tokenWrapper(req, res)
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    if (!id) {
        return res.status(400).send({ error: 'No id provided.' })
    }

    if (!interval && !time) {
        return res.status(400).send({ error: 'You cannot edit an already sent announcement without also giving it a schedule to be resent.' })
    }

    const exists = await run('SELECT * FROM announcements WHERE id = $1', [id])
    if (!exists.rows.length) {
        return res.status(404).send({ error: `ID ${id} not found.` })
    }

    try {
        console.log(`Updating announcement ${id} with title '${title}', description '${description}', channel '${channel}', roles '${roles}', embed '${embed}', color '${color}', interval '${interval}' and time '${time}'.`)

        await run(
            `UPDATE announcements 
            SET title = $2, description = $3, channel = $4, roles = $5, embed = $6, color = $7, interval = $8, time = $9
            WHERE id = $1;`,
            [id, title, description, channel, roles, typeof embed === 'boolean' ? embed : false, color || null, interval, time]
        )

        return res.send({ message: `Successfully updated announcement ${id}.` })
    } catch (error) {
        console.log(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
