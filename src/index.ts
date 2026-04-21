import { installJsonConsoleLogger, log } from '#utils/jsonLogger.ts'
import config from '#config'
import { removeRole } from '#utils/roles.ts'
import autoCreateTekKomMeetings from '#utils/meetings/autoCreateTekKomMeetings.ts'
import handleTickets from '#utils/tickets/handler.ts'
import autoSyncZammad from '#utils/tickets/autoSyncZammad.ts'
import autoCreateStyretMeetings from '#utils/meetings/autoCreateStyretMeetings.ts'
import channelTemplates from '#utils/channelTemplates.ts'
import queenbeeMonitor from '#utils/queenbee/queenbeeMonitor.ts'
import heartbeat from '#utils/heartbeat/heartbeat.ts'
import handleListens from '#utils/activity/handleListens.ts'
import handlePlays from '#utils/activity/handlePlays.ts'
import checkAndHandleListenRepeats from '#utils/activity/checkAndHandleListenRepeats.ts'
import handleInteraction from '#utils/handleInteraction.ts'
import handleRoles from '#utils/handleRoles.ts'
import setupClient from '#utils/setupClient.ts'
import type { CacheType, ThreadChannel, Presence, Message, Interaction } from 'discord.js'
import { Events } from 'discord.js'

installJsonConsoleLogger()

const token = config.token
const client = await setupClient()
const lastListens: LastListens = new Map()

client.once(Events.ClientReady, async () => {
    handleRoles(client)
    autoCreateTekKomMeetings(client)
    autoCreateStyretMeetings(client)
    queenbeeMonitor(client)
    autoSyncZammad(client)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
client.on(Events.MessageReactionRemove, async (reaction: any, user: any) => {
    // Checks if a reaction is partial, and if so fetches the entire structure
    if (reaction.partial) {
        try {
            await reaction.fetch()
        } catch (error) {
            console.log('Something went wrong when fetching the message:', error)
            return
        }
    }

    removeRole({ reaction, user })
})

client.on(Events.MessageCreate, async (message: Message) => {
    handleTickets(message)
})

client.on<Events.PresenceUpdate>(Events.PresenceUpdate, async (oldPresence: Presence | null, newPresence: Presence) => {
    handleListens({ oldPresence, newPresence, lastListens })
    handlePlays({ newPresence })
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
