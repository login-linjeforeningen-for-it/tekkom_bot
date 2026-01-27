import { Message } from 'discord.js'
import fetchTicket from '#utils/ticket.ts'
import attachmentAsBase64 from '#utils/tickets/attachmentAsBase64.ts'
import config from '#config'

export default async function postMessage(ticketID: number, message: Message, body: string | undefined = undefined) {
    const recipient = await fetchTicket(ticketID, true)

    if (recipient) {
        try {
            const attachments = []

            for (const att of message.attachments) {
                const attachment = att[1]
                const data = await attachmentAsBase64(attachment)

                if (data) {
                    attachments.push({
                        filename: attachment.name,
                        data,
                        'mime-type': attachment.contentType
                    })
                }
            }

            const url = `${config.api}/dizambee/ticket/${ticketID}`
            const data = {
                'group_id': 37,
                'customer_id': 5567,
                'article': {
                    'body': body || `From ${message.author.username} via Discord:\n\n${message.content}`,
                    'type': 'email',
                    'internal': false,
                    'to': recipient,
                    attachments
                }
            }
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }
            const response = await fetch(url, options)

            if (!response.ok) {
                throw new Error(`Failed to post message to zammad: ${await response.text()}\nURL: ${url}\nStatus: ${response.status}\nOptions: ${JSON.stringify(options)}`)
            }

            return response.status
        } catch (error) {
            console.log(`Error while posting message: ${error}`)
        }
    }
}
