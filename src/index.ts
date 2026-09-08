import { installJsonConsoleLogger, log } from '#utils/jsonLogger.ts'
import config from '#config'
import autoCreateTekKomMeetings from '#utils/meetings/autoCreateTekKomMeetings.ts'
import autoCreateStyretMeetings from '#utils/meetings/autoCreateStyretMeetings.ts'
import channelTemplates from '#utils/channelTemplates.ts'
import queenbeeMonitor from '#utils/queenbee/queenbeeMonitor.ts'
import heartbeat from '#utils/heartbeat/heartbeat.ts'
import handleListens from '#utils/activity/handleListens.ts'
import checkAndHandleListenRepeats from '#utils/activity/checkAndHandleListenRepeats.ts'
import handleInteraction from '#utils/handleInteraction.ts'
import setupClient from '#utils/setupClient.ts'
import type { CacheType, ThreadChannel, Presence, Interaction } from 'discord.js'
import { Events } from 'discord.js'

installJsonConsoleLogger()

const token = config.token
const client = await setupClient()
const lastListens: LastListens = new Map()

client.once(Events.ClientReady, async () => {
    autoCreateTekKomMeetings(client)
    autoCreateStyretMeetings(client)
    queenbeeMonitor(client)
    heartbeat()
    log('info', 'Discord bot ready', {
        event: 'bot.ready',
        guildId: client.guilds.cache.first()?.id,
        userId: client.user.id,
        username: client.user.username,
    })

    setInterval(async () => {
        await checkAndHandleListenRepeats(client, lastListens)
    }, 5000)
})

client.on<Events.InteractionCreate>(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
    await handleInteraction({ interaction, client })
})

client.on(Events.ThreadCreate, async (thread: ThreadChannel) => {
    await channelTemplates(thread)
})

client.on<Events.PresenceUpdate>(Events.PresenceUpdate, async (oldPresence: Presence | null, newPresence: Presence) => {
    handleListens({ oldPresence, newPresence, lastListens })
})

client.login(token)

client.rest.on('rateLimited', (info) => console.warn('Discord REST rate limited', {
    event: 'discord.rate_limited',
    route: info.route,
    method: info.method,
    hash: info.hash,
    majorParameter: info.majorParameter,
    limit: info.limit,
    retryAfter: info.retryAfter,
    scope: info.scope,
})
)

process.on('unhandledRejection', async (error) => {
    if ((error as { message: string }).message === 'Interaction has already been acknowledged.') {
        console.warn('Interaction has already been acknowledged.', {
            event: 'discord.interaction_already_acknowledged',
        })
        return
    }

    console.error('Unhandled promise rejection', {
        event: 'process.unhandled_rejection',
        error,
    })
})

process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception', {
        event: 'process.uncaught_exception',
        error,
    })
})

process.on('uncaughtExceptionMonitor', async (error) => {
    console.error('Uncaught exception monitor', {
        event: 'process.uncaught_exception_monitor',
        error,
    })
})

export default client
