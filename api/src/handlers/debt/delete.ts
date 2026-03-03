import run from '#db'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function deleteDebt(req: FastifyRequest, res: FastifyReply) {
    const { valid } = await tokenWrapper(req, res, ['tekkom_bot'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    const { user_id, amount } = req.body as { user_id: string, amount?: number }

    if (!user_id) {
        return res.status(400).send({ error: 'user_id must be provided.' })
    }

    try {
        if (amount !== undefined) {
            // Subtract amount
            const current = await run('SELECT amount FROM debt WHERE user_id = $1', [user_id])
            if (current.rows.length === 0) {
                return res.status(404).send({ error: 'No debt found for user.' })
            }
            const newAmount = current.rows[0].amount - amount
            if (newAmount <= 0) {
                await run('DELETE FROM debt WHERE user_id = $1', [user_id])
            } else {
                await run('UPDATE debt SET amount = $1 WHERE user_id = $2', [newAmount, user_id])
            }
        } else {
            // Remove all
            const result = await run('DELETE FROM debt WHERE user_id = $1', [user_id])
            if (result.rowCount === 0) {
                return res.status(404).send({ error: 'No debt found for user.' })
            }
        }

        return res.send({ message: 'Debt removed successfully.' })
    } catch (error) {
        console.log(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
