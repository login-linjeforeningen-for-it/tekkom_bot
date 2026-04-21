import type { CacheType, ChatInputCommandInteraction, TextChannel } from 'discord.js'
import config from '#config'
import { log as writeJsonLog } from '#utils/jsonLogger.ts'

/**
 * Logs the status of a whitelist message to the log channel
 * @param {*} message Message object from Discord
 * @param {*} content Content to log
 */
export default function log(message: ChatInputCommandInteraction<CacheType>, content: string) {
    const guild = message.guild

    if (!guild) {
        writeJsonLog('warn', 'Whitelist log message missing guild', {
            event: 'minecraft.log_missing_guild',
            commandName: message.commandName,
            userId: message.user.id,
        })
        return
    }

    if (!message.member) {
        writeJsonLog('warn', 'Whitelist log message missing member', {
            event: 'minecraft.log_missing_member',
            guildId: guild.id,
            userId: message.user.id,
        })
        return
    }

    const logChannel = guild.channels.cache.get(config.minecraft_log) as TextChannel

    const nickname = 'nickname' in message.member ? message.member.nickname : ''

    if (logChannel) {
        // Sends a message to the target channel
        logChannel.send(`${nickname} (ID: ${message.user.id}, Username: ${message.user.username}): ${content}`)
    } else {
        // Logs it in the terminal if no channel is set
        writeJsonLog('info', 'Minecraft whitelist audit', {
            event: 'minecraft.whitelist_audit',
            guildId: guild.id,
            userId: message.user.id,
            username: message.user.username,
            nickname,
            content,
        })
    }
}
