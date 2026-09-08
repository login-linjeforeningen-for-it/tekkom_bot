import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import getAnnouncements from './handlers/announcements/get.ts'
import postAnnouncements from './handlers/announcements/post.ts'
import putAnnouncements from './handlers/announcements/put.ts'
import deleteAnnouncements from './handlers/announcements/delete.ts'
import getChannels from './handlers/channels/get.ts'
import postChannels from './handlers/channels/post.ts'
import getIndex from './handlers/index/getIndex.ts'
import postSentAnnouncements from './handlers/sent/post.ts'
import getRoles from './handlers/roles/get.ts'
import postRoles from './handlers/roles/post.ts'
import postListen from './handlers/activity/postListen.ts'
import getActivity from './handlers/activity/getListen.ts'
import postHideActivity from './handlers/activity/postHide.ts'
import postGame from './handlers/activity/postGame.ts'
import getTrackPreview from './handlers/spotify/get.ts'
import getDebt from './handlers/debt/get.ts'
import postDebt from './handlers/debt/post.ts'
import deleteDebt from './handlers/debt/delete.ts'
import getGameActivity from './handlers/activity/getGame.ts'
import getDatabaseHealth from './handlers/health/getDatabase.ts'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function apiRoutes(fastify: FastifyInstance, _: FastifyPluginOptions) {
    // index
    fastify.get('/', getIndex)
    fastify.get('/health/database', getDatabaseHealth)

    // channels
    fastify.get('/channels', getChannels)
    fastify.post('/channels', postChannels)

    // roles
    fastify.get('/roles', getRoles)
    fastify.post('/roles', postRoles)

    // announcements
    fastify.get('/announcements', getAnnouncements)
    fastify.put('/announcements', putAnnouncements)
    fastify.post('/announcements', postAnnouncements)
    fastify.delete('/announcements', deleteAnnouncements)
    fastify.post('/sent', postSentAnnouncements)

    // activity
    fastify.get('/activity', getActivity)
    fastify.get('/activity/games', getGameActivity)
    fastify.post('/activity/listen', postListen)
    fastify.post('/activity/game', postGame)
    fastify.post('/activity/hide', postHideActivity)

    // spotify
    fastify.get('/track/:id', getTrackPreview)

    // debt
    fastify.get('/debt', getDebt)
    fastify.post('/debt', postDebt)
    fastify.delete('/debt', deleteDebt)
}
