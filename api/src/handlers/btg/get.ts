import run from '#db'
import discordAlert from '#utils/discordAlert.ts'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function getBtg(req: FastifyRequest, res: FastifyReply) {
    const { name, service, author } =  (req.query as Btg) ?? {}
    const { valid } = await tokenWrapper(req, res, ['tekkom_bot_btg'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    if (!name || !service || !author) {
        return res.status(400).send({ error: 'Name, service and author must be provided when fetching tokens.' })
    }

    await discordAlert(`BTG ping exceptions for user ${name} for ${service} were
        fetched from the TekKom Bot API by <@${author}>. Please verify that
        there are currently known issues with Authentik and that this is 
        expected.`, 'get')

    const result = await run(
        'SELECT name, service FROM btg WHERE name = $1 AND service = $2;',
        [name, service]
    )
    return res.send(result.rows)
}
