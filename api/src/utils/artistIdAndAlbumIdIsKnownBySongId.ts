import run from '#db'

export default async function artistIdAndAlbumIdIsKnownBySongId(id: string): Promise<boolean> {
    try {
        const res = await run('SELECT artist, album FROM songs WHERE id = $1 LIMIT 1;', [id])
        if (res) {
            const data = res.rows[0] as { album: string, artist: string }
            if (data) {
                if (data.album !== 'Unknown' && data.artist !== 'Unknown') {
                    return true
                }
            }
        }

        return false
    } catch (error) {
        console.log(`Error while checking if artist id and album id is known by song id: ${error}`)
        return false
    }
}
