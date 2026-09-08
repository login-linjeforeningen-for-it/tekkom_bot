import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Embed,
    EmbedBuilder,
} from 'discord.js'
import type { EmbedField } from 'discord.js'
import pages from '#utils/commands.ts'

const commands = {
    chat: 'Establishes a link between the current channel and the Minecraft survival and creative servers. ' +
        'Use the command by typing the following: `/chat`. The link will be established automatically.',
    syntax: '`/help command:name`\n',
    history: 'Displays history about the bot. Use the command by typing the following: `/history`',
    info: 'Displays info about the bot. Use the command by typing the following: `/info`',
    log: 'Starts logging the whitelist messages in the chat where the command was sent. ' +
        'Use the command by typing the following: `/log`',
    notify: 'Sends a notification to the Login app. Use the command by typing the following: ' +
        '`/notify title:your_title_here desscription:your_description_here topic:your_topic_here data:your_json_object_here`. ' +
        'The title, description and topic are required, but data is optional, ' +
        'and only required to navigate to something automatically in the app.',
    ping: 'Pings the bot. The bot replies \'Pong!\' if online. Use the command by typing the following: `/ping`',
    registry: 'Displays how to interact with Logins gitlab registry. Use the command by typing the following: `/registry`',
    setup: [
        {name: 'Setup', value: 'Sets up the specified service. Use the command by typing the following: `/setup service:name`'},
        {name: 'Available services', value: ' '},
        {name: 'chat', value: 'Sets up a chat service that mirrors in game messages from both the creative and survival server to Discord' +
            ', and mirrors the Discord server to in game.'},
        {name: 'log', value: 'Logs the whitelist messages in the chat where the command was sent.'},
        {name: 'chat stop mirror', value: 'Stops the bot from mirroring in game messages to Discord'},
        {name: 'chat stop listener', value: 'Stops the bot from mirroring Discord messages to in game'}
    ],
    tag: 'Info on how to tag a git commit. Use the command by typing the following: `/tag`. All info will be displayed in the message.',
    version: 'Displays the bots version number. Use the command by typing the following: `/version`',
    whitelist: 'Whitelists the user specified. Use the command by typing the following: `/whitelist user:name`',
    whitelist_remove: 'Removes the specified user from the whitelist. ' +
        'Use the command by typing the following: `/whitelist_remove user:name`',
    name: '\'name\' is a placeholder, please replace it with the command you want help for. ' +
        'For example for help on the ping command, write `/help command:ping`'
} as {[key: string]: string | {name: string, value: string}[]}

export default function getEmbed(command: string | undefined, page: number = 0) {
    if (command === 'name') {
        return createEmbed('Help', 'Displays how to use the command specified',
            [{name: `Showing page ${page + 1} / ${pages.length}`, value: commands['name'] as string, inline: false}])
    }

    if (command === undefined) {
        return createEmbed('Help', 'Displays how to use the command specified',
            [{name: `Showing page ${page + 1} / ${pages.length}`, value: getPage(page).join('\n'), inline: false}])
    }

    if (commands[command] === undefined) {
        return createEmbed('Help', 'Displays how to use the command specified',
            [{name: 'Invalid command', value: pages[0].join('\n'), inline: false}])
    }

    if (Array.isArray(commands[command])) {
        return createEmbed('Help', `Help for **${command}**`, commands[command] as EmbedField[])
    }

    return createEmbed('Help', `Help for **${command}**`, [{name: command, value: commands[command] as string, inline: false}])
}

function createEmbed(title: string, description: string, fields: EmbedField[]) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('#fd8738')
        .setTimestamp()

    for (const field of fields) {
        embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline ? field.inline : false,
        })
    }

    return embed
}

function getPage(page: number) {
    return pages[page]
}

export function getButtons(page: number) {
    const previous = new ButtonBuilder()
        .setCustomId('previous_page_help')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)

    const next = new ButtonBuilder()
        .setCustomId('next_page_help')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)

    const buttons = new ActionRowBuilder<ButtonBuilder>()

    if (page > 0 && page < pages.length - 1) {
        buttons.addComponents(previous, next)
    } else if (page > 0) {
        buttons.addComponents(previous)
    } else if (page < pages.length) {
        buttons.addComponents(next)
    }

    return [buttons]
}

export async function nextPage(interaction: ButtonInteraction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const previousPage = page + 1

    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage)
    const newButtons = getButtons(previousPage)

    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons })
}

export async function previousPage(interaction: ButtonInteraction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const previousPage = page - 1

    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage)
    const newButtons = getButtons(previousPage)

    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons })
}

function extractPageNumberFromEmbed(embed: Embed): number {
    const pageField = embed.data.fields?.find(field => field.name.startsWith('Showing page'))
    if (pageField) {
        const match = pageField.name.match(/Showing page (\d+) \/ \d+/)
        if (match && match[1]) {
            // Converts 1-based page to 0-based and returns it
            return parseInt(match[1], 10) - 1
        }
    }

    // Defaults to the first page if no match is found
    return 0
}
