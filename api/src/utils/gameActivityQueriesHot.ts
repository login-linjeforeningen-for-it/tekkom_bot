import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export default async function preloadGameActivityQueriesHot() {
    const [getCurrentlyPlaying] = await Promise.all([loadSQL('getCurrentlyPlaying.sql')])
    const [currentlyPlayingResult] = await Promise.all([run(getCurrentlyPlaying)])
    const currentlyPlaying = currentlyPlayingResult.rows
    return { currentlyPlaying }
}
