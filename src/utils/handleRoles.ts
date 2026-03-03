import { DiscordClient } from '#interfaces'
import roles from '#managed/roles.ts'
import addRole from '#utils/roles.ts'

export default async function handleRoles(client: DiscordClient) {
    for (const role of roles) {
        try {
            const { message, channelID } = role

            // Fetch channel and message
            const channel = await client.channels.fetch(channelID)
            if (!channel) {
                return console.log(`Channel with ID ${channelID} not found.`)
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const roleMessage = await (channel as any).messages.fetch(message)
            if (!roleMessage) {
                return console.log(`Message with ID ${message} not found.`)
            }

            // Fetches missing partial data for the message
            if (roleMessage.partial) {
                try {
                    await roleMessage.fetch()
                } catch (error) {
                    console.log(`Something went wrong when fetching role message partial: ${error}`)
                    return
                }
            }

            // Extract guild, roles, and icons
            const guild = client.guilds.cache.get(roleMessage.guildId)
            const content = roleMessage.embeds[0].data.fields[0].value
            if (!guild) {
                return console.log(`Guild ${roleMessage.guildId} does not exist.`)
            }

            const roleRegex = /<@&(\d+)>/g
            const messageRoles = content.match(roleRegex) || []
            const roleIds = messageRoles.map((match: string) => match.slice(3, -1))

            const icons = content.split('\n').map((icon: string) =>
                icon[1] === ':' ? icon.split(':')[1] : icon.substring(0, 2)
            )

            // Create a reaction collector
            const roleCollector = roleMessage.createReactionCollector({
                filter: (_: Reaction, user: User) => !user.bot,
                dispose: true,
            })

            addRole({ collector: roleCollector, guild, roles: roleIds, icons })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.log(`Error processing roles: ${error}`)
        }
    }
}
