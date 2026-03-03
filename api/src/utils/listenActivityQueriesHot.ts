import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export default async function preloadListenActivityQueriesHot() {
    const [getCurrentlyListening, getCurrentlyInspiredSongs] = await Promise.all([
        loadSQL('getCurrentlyListening.sql'),
        loadSQL('getCurrentlyInspiredSongs.sql')
    ])

    const [
        currentlyListeningResult,
        currentlyInspiredResult
    ] = await Promise.all([run(getCurrentlyListening), run(getCurrentlyInspiredSongs)])
    const currentlyListening = currentlyListeningResult.rows
    const currentlyInspired = currentlyInspiredResult.rows

    return { currentlyListening, currentlyInspired }
}
