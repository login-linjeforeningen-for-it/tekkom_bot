import type { Roles } from '#interfaces'
import config from '#config'
import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Role,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js'
import getRepositories from '#utils/gitlab/getRepositories.ts'
import sanitize from '#utils/sanitize.ts'
import { EDIT_INTERVAL_SECONDS, FALLBACK_TAG, GITLAB_BASE, TWO_WEEKS } from '#constants'
import getTags from '#utils/gitlab/tags.ts'
import formatCommits from '#utils/gitlab/formatCommits.ts'
import getCommits from '#utils/gitlab/getCommits.ts'
import continueRelease from '#utils/gitlab/continueRelease.ts'

export const data = new SlashCommandBuilder()
    .setName('release')
    .setDescription('Releases a new version of a repository to production.')
    .addStringOption((option) =>
        option
            .setName('repository')
            .setDescription(
                'Repository to release.',
            )
            .setRequired(true)
            .setAutocomplete(true),
    )

export async function execute(message: ChatInputCommandInteraction) {
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache
        .some((role: Role) => role.id === config.roleID || role.id === config.styret)
    const repository = sanitize(message.options.getString('repository') || '')
    let match = null as RepositorySimple | null
    const repositories = await getRepositories(25, repository)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: 'Unauthorized.', flags: MessageFlags.Ephemeral })
    }

    // Aborts if the channel isnt a operations channel
    if (!message.channel || !('name' in message.channel) || !message.channel.name?.toLocaleLowerCase().includes('operations')) {
        return await message.reply({ content: 'This isnt a operations channel.', flags: MessageFlags.Ephemeral })
    }

    // Aborts if no repository is selected
    if (!repository) {
        return await message.reply({ content: 'No repository selected.', flags: MessageFlags.Ephemeral })
    }

    // Tries to find a matching repository
    for (const repo of repositories) {
        if (repo.name === repository) {
            match = repo
        }
    }

    // Aborts if no matching repository exists
    if (!match) {
        return await message.reply({ content: `No repository matches '${repository}'.`, flags: MessageFlags.Ephemeral })
    }

    const tags = await getTags(match.id)
    let error

    // Sets error to unable to fetch tags
    if (!Array.isArray(tags)) {
        error = `Unable to fetch tags for ${match.name}. Please try again later.`
    }

    const baseTag = tags[0]
    const baseName = baseTag.name
    // Sets error to tag already deployed
    if (!baseName.includes('-dev')) {
        // eslint-disable-next-line no-useless-escape
        error = `Tag ${baseName} for ${match.name} is already deployed.\nPlease use \`\/deploy\` first.`
    }

    // Aborts if there is an error
    if (error) {
        const embed = new EmbedBuilder()
            .setTitle(error)
            .setColor('#fd8738')
            .setTimestamp()

        return message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
    }

    const [version, commits] = await Promise.all([
        await getTags(match.id),
        await getCommits(match.id)
    ])

    const now = new Date()
    const latestCommitDate = new Date(commits[0].created_at)
    const latestVersion = version[0] || FALLBACK_TAG
    const tag = baseTag.name.includes('-dev') ? baseTag.name.slice(0, baseTag.name.length - 4) : baseTag.name
    const avatar = match.avatar_url || `${GITLAB_BASE}${match.namespace.avatar_url}`
    const embed = new EmbedBuilder()
        .setTitle(`Releasing v${tag} for ${repository}.`)
        .setDescription(match.description || ' ')
        .setColor('#fd8738')
        .setTimestamp()
        .setThumbnail(avatar || null)
        .setURL(latestVersion.commit.web_url)
        .addFields([
            { name: 'ID', value: String(match.id), inline: true },
            { name: 'Branch', value: match.default_branch, inline: true },
            { name: 'Last activity', value: new Date(match.last_activity_at).toLocaleString(), inline: true },
            { name: 'Current version', value: latestVersion.name, inline: true },
            { name: 'Commit', value: latestVersion.commit.short_id, inline: true },
            { name: 'Created At', value: new Date(latestVersion.commit.created_at).toLocaleString(), inline: true },
            { name: 'Title', value: latestVersion.commit.title },
            { name: 'Author', value: latestVersion.commit.author_name, inline: true },
            { name: 'Author Email', value: latestVersion.commit.author_email, inline: true },
            { name: 'Recent commits', value: ' ' },
            ...formatCommits(commits, 5)
        ])

    if (now.getTime() - latestCommitDate.getTime() > TWO_WEEKS) {
        const embedOldWarning = new EmbedBuilder()
            .setTitle('Very old commit (>2w). Are you sure?')
            .setDescription(
                `The most recent commit for ${match.name} branch 'main' is more than two weeks old. ` +
                `It was created ${latestCommitDate.toLocaleString('no-NO')}. ` +
                'Are you sure you want to release this version?'
            )
            .setColor('#ff0000')

        // Creates 'yes' button
        const releaseYes = new ButtonBuilder()
            .setCustomId('releaseYes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Secondary)

        // Creates 'no' button
        const releaseNo = new ButtonBuilder()
            .setCustomId('releaseNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Primary)

        // Creates 'trash' button
        const trash = new ButtonBuilder()
            .setCustomId('trash')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary)

        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(releaseNo, releaseYes, trash)

        return await message.reply({ embeds: [embed, embedOldWarning], components: [buttons] })
    }

    const id = match.id
    await continueRelease({ message, embed, id, tag, repository, interval: EDIT_INTERVAL_SECONDS })
}
