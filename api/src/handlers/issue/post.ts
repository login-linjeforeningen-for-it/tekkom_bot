import discordIssue from '#utils/discordIssue.ts'
import getIssueName from '#utils/getIssueInfo.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'
import crypto from 'crypto'
import config from '#constants'

type GitHubProjectsV2ItemPayload = {
    action: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects_v2_item: any
    changes?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field_value?: any
    }
    sender: {
        login: string
    }
}

export default async function postIssue(req: FastifyRequest, res: FastifyReply) {
    const signature = req.headers['x-hub-signature-256'] as string
    if (!signature) {
        return res.status(401).send({ error: 'Missing signature' })
    }

    const payload = JSON.stringify(req.body)
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', config.GITHUB_WEBHOOK_SECRET as string).update(payload).digest('hex')
    if (signature !== expectedSignature) {
        return res.status(401).send({ error: 'Invalid signature' })
    }

    const eventType = req.headers['x-github-event']
    if (eventType === 'ping') {
        return res.status(200).send({ msg: 'pong' })
    } else if (eventType === 'push') {
        return res.status(202).send({ msg: 'Ignoring push events' })
    } else if (eventType !== 'projects_v2_item') {
        return res.status(400).send({ error: 'Invalid event type' })
    }

    const body = req.body as GitHubProjectsV2ItemPayload
    const { action, projects_v2_item, changes, sender } = body

    try {
        const { issueTitle, issueUrl, repoName, projectName, color } = await getIssueName(projects_v2_item.node_id)
        const isEdit = action === 'edited' && changes && changes.field_value.field_name === 'Status'

        if (action === 'created') {
            await discordIssue(
                'Issue created',
                `'${issueTitle}'`,
                `${repoName} • ${projectName} • Action by ${sender.login}`,
                color,
                issueUrl
            )
        } else if (isEdit && changes.field_value.to.name === 'Done') {
            await discordIssue(
                'Issue closed',
                `'${issueTitle}'`,
                `${repoName} • ${projectName} • Action by ${sender.login}`,
                changes.field_value.to.color,
                issueUrl
            )
        } else if (isEdit && changes.field_value.to.name !== null && changes.field_value.from.name !== null) {
            await discordIssue(
                'Issue moved',
                `'${issueTitle}'\nMoved to ${changes.field_value.to.name} from ${changes.field_value.from.name}`,
                `${repoName} • ${projectName} • Action by ${sender.login}`,
                changes.field_value.to.color,
                issueUrl
            )
        }

        return res.status(200).send({ ok: true })
    } catch (error) {
        console.log(`Error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
