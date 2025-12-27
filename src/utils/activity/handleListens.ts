import { Presence } from 'discord.js'
import sendListen from '#utils/activity/sendListen.ts'

type HandleListenProps = {
    oldPresence: Presence | null
    newPresence: Presence
    lastListens: LastListens
}

export default async function handleListens({oldPresence, newPresence, lastListens}: HandleListenProps) {
    const oldData = oldPresence?.activities.find(a => a.type === 2 && a.name === 'Spotify')
    const listening = newPresence.activities.find(a => a.type === 2 && a.name === 'Spotify')
    const user = newPresence.user?.tag ?? 'Unknown'
    const userId = newPresence.userId

    if (listening) {
        const oldStart = oldData?.timestamps?.start ?? null
        const oldEnd = oldData?.timestamps?.end ?? null
        const start = listening.timestamps?.start?.toISOString() ?? new Date().toISOString()
        const end = listening.timestamps?.end?.toISOString() ?? new Date().toISOString()
        const image = listening.assets?.largeImage?.split(':')[1] ?? 'ab67616d0000b273153d79816d853f2694b2cc70'
        let skipped = false

        if (oldStart && oldEnd) {
            const listenedDuration = new Date().getTime() - oldStart.getTime()
            const totalDuration = oldData?.syncId ? (oldEnd.getTime() - oldStart.getTime()) : listenedDuration
            skipped = listenedDuration < (totalDuration * 2 / 3)
        }

        const listen = {
            user,
            name: listening.details ?? 'Unknown',
            artist: listening.state ?? 'Unknown',
            start,
            end,
            album: listening.assets?.largeText ?? 'Unknown',
            image,
            source: listening.name,
            userId,
            avatar: newPresence.user?.avatar,
            skipped,
            id: listening.syncId ?? 'Unknown'
        }

        const last = lastListens.get(userId)
        if (!last) {
            const response = await sendListen(listen)
            console.log(`Handle listens response: ${response.message}`)
            lastListens.set(userId, {
                syncId: listening.syncId!,
                start: new Date(start).getTime(),
                end: new Date(end).getTime()
            })
        }

        return
    }
}
