import { Client } from 'discord.js'
import getAndSendChannels from '#utils/queenbee/getAndSendChannels.ts'
import getMessages from '#utils/queenbee/getMessages.ts'
import sendMessages from '#utils/queenbee/sendMessages.ts'
import updateApi from '#utils/queenbee/updateApi.ts'
import getAndSendRoles from '#utils/queenbee/getAndSendRoles.ts'

export default async function queenbeeMonitor(client: Client) {
    Bun.cron('* * * * *', async() => {
        getAndSendChannels(client)
        getAndSendRoles(client)
        const messages = await getMessages()
        const result = await sendMessages(client, messages)
        await updateApi(result)
    })
}
