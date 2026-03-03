import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export async function preloadCurrentlyListensQueries() {
    const [
        getCurrentlyListening,
    ] = await Promise.all([
        loadSQL('getCurrentlyListening.sql')
    ])

    const [
        currentlyListeningResult
    ] = await Promise.all([
        run(getCurrentlyListening)
    ])

    const currentlyListening = currentlyListeningResult.rows

    return currentlyListening
}