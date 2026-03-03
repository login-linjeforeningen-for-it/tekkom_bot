import config from '#config'
import { DiscordClient } from '#interfaces'
import sendListen from '#utils/activity/sendListen.ts'

export default async function checkAndHandleListenRepeats(
    client: DiscordClient,
    lastListens: LastListens
) {
    const guild = client.guilds.cache.get(config.guildId)
        ?? await client.guilds.fetch(config.guildId).catch(() => null)
    if (!guild) {
        throw new Error('Guild missing in checkAndHandleListenRepeats, check env variables.')
    }

    for (const userId of lastListens.keys()) {
        const member = guild?.members.cache.get(userId)
        if (!member) {
            // User left or not cached
            lastListens.delete(userId)
            continue
        }

        const presence = member.presence
        if (!presence) {
            // User is no longer listening
            lastListens.delete(userId)
            continue
        }

        // Checks what the user is listening to now
        const spotify = presence.activities.find(a => a.type === 2 && a.name === 'Spotify')
        const last = lastListens.get(userId)

        // Still listening to Spotify
        if (spotify && spotify.syncId && spotify.timestamps?.start && spotify.timestamps?.end && last) {
            const start = spotify.timestamps?.start?.toISOString() ?? new Date().toISOString()
            const end = spotify.timestamps?.end?.toISOString() ?? new Date().toISOString()
            const image = spotify.assets?.largeImage?.split(':')[1] ?? 'ab67616d0000b273153d79816d853f2694b2cc70'
            const oldStart = last.start
            const oldEnd = last.end
            const listenedDuration = new Date().getTime() - oldStart
            const totalDuration = last.syncId ? (oldEnd - oldStart) : listenedDuration
            const skipped = listenedDuration < (totalDuration * 2 / 3)
            const listen = {
                id: spotify.syncId,
                user: member.user.tag ?? 'Unknown',
                name: spotify.details ?? 'Unknown',
                artist: spotify.state ?? 'Unknown',
                start,
                end,
                album: spotify.assets?.largeText ?? 'Unknown',
                image,
                source: spotify.name,
                userId: member.user.id,
                avatar: member.user.avatar,
                skipped,
            }
            const startTime = spotify.timestamps.start.getTime()
            const endTime = spotify.timestamps.end.getTime()

            // Repeated song (new startTime)
            if (spotify.syncId === last.syncId && startTime > last.start) {
                const response = await sendListen(listen)
                const isError = 'error' in response
                if (isError) {
                    console.log(response.message, response.error)
                }

                console.log(
                    `${member.user.tag} ${isError ? 'tried to repeat' : 'repeated'} ` +
                    `the song: ${spotify.details} by ${spotify.state}, skipped: ${skipped}`
                )
            } else if (spotify.syncId !== last?.syncId) {
                // New song
                const response = await sendListen(listen)
                console.log(response.message)
            }

            // Stores new reference
            lastListens.set(userId, { syncId: spotify.syncId, start: startTime, end: endTime })
        }
    }
}
