import run from '#db'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function postDebt(req: FastifyRequest, res: FastifyReply) {
    const { valid } = await tokenWrapper(req, res, ['tekkom_bot'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    const { user_id, amount } = req.body as { user_id: string, amount: number }

    if (!user_id || !amount) {
        return res.status(400).send({ error: 'user_id, amount must be provided.' })
    }

    try {
        await run(
            'INSERT INTO debt (user_id, amount) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET amount = debt.amount + EXCLUDED.amount',
            [user_id, amount]
        )

        return res.send({ message: 'Debt added successfully.' })
    } catch (error) {
        console.log(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
