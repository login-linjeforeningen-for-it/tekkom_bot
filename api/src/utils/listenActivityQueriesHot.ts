import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export default async function preloadListenActivityQueriesHot() {
    const [getCurrentlyListening] = await Promise.all([loadSQL('getCurrentlyListening.sql')])
    const [currentlyListeningResult] = await Promise.all([run(getCurrentlyListening)])
    const currentlyListening = currentlyListeningResult.rows

    return { currentlyListening }
}
