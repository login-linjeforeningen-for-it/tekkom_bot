import config from '#config'

const tekkomBotApiToken = config.tekkomBotApiToken

export default async function sendGame({
    name,
    user,
    userId,
    avatar,
    details,
    state,
    application,
    start,
    party,
    image,
    imageText
}: SendGame) {
    try {
        const response = await fetch(`${config.api}/activity/game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tekkomBotApiToken}`,
                'btg': 'tekkom_bot',
            },
            body: JSON.stringify({
                name,
                user,
                userId,
                avatar,
                details,
                state,
                application,
                start,
                party,
                image,
                imageText
            })
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.log(`Error while sending game: ${error}`)
        return { error, humanReadable: `Failed to add game ${name} for ${user}.` }
    }
}
