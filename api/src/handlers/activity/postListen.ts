import config from '#constants'
import run from '#db'
import artistIdAndAlbumIdIsKnownBySongId from '#utils/artistIdAndAlbumIdIsKnownBySongId.ts'
import getSpotifyToken from '#utils/getSpotifyToken.ts'
import { loadSQL } from '#utils/loadSQL.ts'
import tokenWrapper from '#utils/tokenWrapper.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

export default async function postListen(
    req: FastifyRequest,
    res: FastifyReply
) {
    const {
        id,
        user,
        name,
        artist,
        start,
        end,
        album,
        image,
        source,
        avatar,
        userId,
        skipped,
    } = (req.body as Activity) ?? {}

    const { valid } = await tokenWrapper(req, res, ['tekkom_bot'])
    if (!valid) {
        return res.status(400).send({ error: 'Unauthorized' })
    }

    if (
        !user || !name || !artist || !start || !end || !album || !image ||
        !source || !avatar || !userId
    ) {
        console.log(`Missing those that are undefined:\n${JSON.stringify({
            id,
            user,
            name,
            artist,
            start,
            end,
            album,
            image,
            source,
            avatar,
            userId
        })}`)
        return res
            .status(400)
            .send({ error: 'Please provide a valid listen activity.' })
    }

    try {
        console.log(`Adding song: '${name}' by artist '${artist}' for user '${user}'.`)

        let artistId: string = 'Unknown'
        let albumId: string = 'Unknown'
        let type = 'Unknown'

        let show: string | null = null

        const artistIdAndAlbumIdIsNotKnown = !(await artistIdAndAlbumIdIsKnownBySongId(id))
        const shouldQuerySpotify = artistIdAndAlbumIdIsNotKnown || Math.random() < 0.1

        if (shouldQuerySpotify) {
            try {
                const token = await getSpotifyToken()
                let response = await fetch(`${config.SPOTIFY_API_TRACK_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data?.artists?.[0]?.id) {
                        artistId = data.artists[0].id
                    }
                    if (data?.album?.id) {
                        albumId = data.album.id
                    }
                    type = 'track'
                } else {
                    response = await fetch(`${config.SPOTIFY_API_EPISODE_URL}/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })

                    if (!response.ok) {
                        throw new Error(
                            `Spotify Error, Status: ${response.status} ${await response.text()}`
                        )
                    }
                    const data = await response.json()
                    if (data.show?.id) {
                        artistId = data.show.id
                    }

                    if (data.show?.name) {
                        show = data.show.name
                    }

                    type = 'episode'
                }

            } catch (error) {
                console.log('Spotify lookup failed:', error)
            }
        } else {
            const result = await run('SELECT * FROM songs WHERE id = $1;', [id])
            if (result && result.rows.length > 0) {
                const row = result.rows[0]
                artistId = row.artist_id || 'Unknown'
                albumId = row.album_id || 'Unknown'
                type = 'track'
            } else {
                const episodeResult = await run('SELECT * FROM episodes WHERE id = $1;', [id])
                if (episodeResult && episodeResult.rows.length > 0) {
                    const row = episodeResult.rows[0]
                    artistId = row.show || 'Unknown'
                    type = 'episode'
                }
            }
        }

        if (skipped) {
            const previousQuery = await loadSQL('getPreviousSongForUser.sql')
            const previous = await run(previousQuery, [userId])

            if (previous && previous.rows.length > 0) {
                const listenId = previous.rows[0].id
                const prevSongId = previous.rows[0].song_id
                await run('UPDATE listens SET skipped = $1 WHERE id = $2', [true, listenId])
                const songUpdate = await run(
                    'UPDATE songs SET skips = COALESCE(skips, 0) + 1 WHERE id = $1',
                    [prevSongId]
                )
                type = 'track'
                if ((songUpdate.rowCount ?? 0) === 0) {
                    await run(
                        'UPDATE episodes SET skips = COALESCE(skips, 0) + 1 WHERE id = $1',
                        [prevSongId]
                    )
                    type = 'episode'
                }
            }
        }

        if (type === 'Unknown') {
            return res.status(400).send({ error: 'Could not determine listen type (track or episode).' })
        }

        const userQuery = await loadSQL('postUser.sql')
        await run(userQuery, [userId, avatar, user])

        const artistQuery = await loadSQL('postArtist.sql')
        let insertedSongId = null

        const currentlyListeningQuery = await loadSQL('getCurrentlyListening.sql')

        if (type === 'track') {
            // Check if somebody else is listening to the song
            const currentlyListens = (await run(currentlyListeningQuery)).rows
            try {
                for (const listen of currentlyListens) {
                    if (listen.song_id === id && listen.user_id !== userId) {
                        console.log(`${user} is now listening to the same song as ${listen.user_id}`)
                        const postSongInspiredQuery = await loadSQL('postSongInspired.sql')
                        await run(postSongInspiredQuery, [id])
                        console.log(`Incremented ${name} (ID: ${listen.song_id}) inspired field`)
                    }
                }
            } catch (error) {
                console.log(`Error with currently listens: ${JSON.stringify(error)}`)
            }

            await run(artistQuery, [artistId || 'Unknown', artist])
            const albumQuery = await loadSQL('postAlbum.sql')
            await run(albumQuery, [albumId || 'Unknown', album])
            const songQuery = await loadSQL('postSongListen.sql')
            const songResult = await run(songQuery, [id, name, artistId, albumId, image])
            insertedSongId = songResult.rows[0].id
        } else if (type === 'episode') {
            await run(artistQuery, [artistId || 'Unknown', show])
            const episodeQuery = await loadSQL('postEpisode.sql')
            const episodeResult = await run(episodeQuery, [id, name, artistId, image])
            insertedSongId = episodeResult.rows[0].id
        }

        const listenQuery = await loadSQL('postListen.sql')
        await run(listenQuery, [userId, insertedSongId, type, start, end, source, skipped ?? false])

        return res.send({
            message: type === 'track'
                ? `Successfully added song ${name} by ${artist}, played by ${user}`
                : `Successfully added episode ${name} from show ${artist}, played by ${user}`,
        })
    } catch (error) {
        console.log(`Database error: ${JSON.stringify(error)}`)
        return res.status(500).send({ error: 'Internal Server Error' })
    }
}
