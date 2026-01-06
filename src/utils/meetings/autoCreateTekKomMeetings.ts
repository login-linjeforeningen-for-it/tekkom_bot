import { Client, TextChannel } from 'discord.js'
import { schedule } from 'node-cron'
import autoCreate from '#utils/meetings/wiki.ts'
import getNextPathYearAndWeek from '#utils/meetings/getNextPathYearAndWeek.ts'
import { envLoad } from 'utilbee'

envLoad({ path: '.env' })

const { DISCORD_TEKKOM_VERV_CHANNEL_ID } = process.env

if (!DISCORD_TEKKOM_VERV_CHANNEL_ID) {
    throw new Error('Missing DISCORD_TEKKOM_VERV_CHANNEL_ID in autoCreateTekKomMeetings.ts')
}

export default async function autoCreateTekKomMeetings(client: Client) {
    const channel = await client.channels.fetch(DISCORD_TEKKOM_VERV_CHANNEL_ID as string) as TextChannel

    if (!channel) {
        throw new Error(`Channel with ID ${DISCORD_TEKKOM_VERV_CHANNEL_ID} not found in autoCreateTekKomMeetings.ts`)
    }

    schedule('0 15 * * 4', () => {
        const weekNumber = getNextPathYearAndWeek(false).currentWeek
        if (weekNumber % 2 !== 0) {
            autoCreate({ channel, isStyret: false })
        }
    })
}
