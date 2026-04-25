import { Message } from 'discord.js'

export default async function deleteWithTimeout(msg: Message, timeoutMs = 5000) {
    return Promise.race([
        msg.delete(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Delete timed out')), timeoutMs)
        )
    ])
}
