import run from '#db'
import alertSlowQuery from '#utils/alertSlowQuery.ts'
import formatRows from '#utils/formatRows.ts'
import { loadSQL } from '#utils/loadSQL.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

type GetAnnouncements = {
    id?: string
    search?: string
    offset?: string
    limit?: string
    active?: string
    shouldBeSent?: string
    includePlaceholders?: boolean | string
}

export default async function getAnnouncements(req: FastifyRequest, res: FastifyReply) {
    const { id, search, offset, limit, active, shouldBeSent, includePlaceholders } =  (req.query as GetAnnouncements) ?? {}

    if (id) {
        const result = await run('SELECT * FROM announcements WHERE id = $1;', [id])
        return res.send(result.rows)
    }

    const query = (await loadSQL('getAnnouncements.sql'))
    const offsetInt = parseInt(offset || '0', 10)
    const limitInt = parseInt(limit || '10', 10)
    const activeBool = active === 'true'
    const shouldBeSentBool = shouldBeSent === 'true'
    const searchTerm = search || ''
    const start = Date.now()
    const result = await run(query, [offsetInt, limitInt, activeBool, shouldBeSentBool, searchTerm])
    const duration = (Date.now() - start) / 1000
    alertSlowQuery(duration, 'announcements')

    if (parseBool(includePlaceholders)) {
        return res.send({ announcements: result.rows, total_count: result.rows[0]?.total_count || 0 })
    }

    const finalRows = formatRows(result.rows)
    return res.send(finalRows)
}

function parseBool(value: unknown) {
    return value === true || value === 'true'
}
