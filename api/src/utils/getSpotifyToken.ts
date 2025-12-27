import config from '#constants'

export default async function getSpotifyToken() {
    try {
        const response = await fetch(config.SPOTIFY_API_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${config.SPOTIFY_API_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data.access_token
    } catch (error) {
        console.log(`Error while getting Spotify token: ${error}`)
        return null
    }
}
