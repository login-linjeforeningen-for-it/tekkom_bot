import { Client, Role } from 'discord.js'
import config from '#config'

const tekkomBotApiToken = config.tekkomBotApiToken
const guild = config.guildId

/**
 * Fetches all channels the bot can write to in the 'Login - Linjeforeningen for IT' server
 * @param client Discord client
 * @returns void
 */
export default async function getAndSendRoles(client: Client): Promise<void> {
    const GUILD_ID = guild
    const data: { name: string, id: string, color: string }[] = []

    try {
        const guild = client.guilds.cache.get(GUILD_ID)
        if (!guild) {
            console.warn(`Bot is not in guild with ID ${GUILD_ID}`)
            return
        }

        const roles = await guild.roles.fetch()
        roles.forEach((role: Role) => {
            if (role.name === '@everyone' || role.id === GUILD_ID) {
                return
            }

            data.push({
                name: role.name,
                id: role.id,
                color: role.hexColor
            })
        })

        const response = await fetch(`${config.api}/roles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tekkomBotApiToken}`,
                'btg': 'tekkom_bot',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const result = await response.json() as { message: string }
        console.log(`Get and send roles response: ${result.message}`)
    } catch (error) {
        console.log(`Error while getting and sending roles: ${error}`)
    }
}
