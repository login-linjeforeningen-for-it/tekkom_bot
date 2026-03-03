import type { Roles } from '#interfaces'
import config from '#config'
import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Role,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageFlags
} from 'discord.js'
import getRepositories from '#utils/gitlab/getRepositories.ts'
import sanitize from '#utils/sanitize.ts'
import { FALLBACK_TAG, GITLAB_BASE, TWO_WEEKS } from '#constants'
import getTags from '#utils/gitlab/tags.ts'
import getCommits from '#utils/gitlab/getCommits.ts'
import formatCommits from '#utils/gitlab/formatCommits.ts'
import continueDeployment from '#utils/gitlab/continueDeployment.ts'

export const data = new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploys a new version of a repository to staging.')
    .addStringOption((option) =>
        option
            .setName('repository')
            .setDescription('Repository to deploy.')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption((option) =>
        option
            .setName('branch')
            .setDescription('Branch to deploy from.')
    )
export async function execute(interaction: ChatInputCommandInteraction) {
    const isAllowed = (interaction.member?.roles as unknown as Roles)?.cache
        .some((role: Role) => role.id === config.roleID || role.id === config.styret)
    const repository = sanitize(interaction.options.getString('repository') || '')
    const branch = sanitize(interaction.options.getString('branch') || 'main')
    let match = null as RepositorySimple | null
    const repositories = await getRepositories(25, repository)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await interaction.reply({ content: 'Unauthorized.', flags: MessageFlags.Ephemeral })
    }

    // Aborts if the channel isnt a playhouse channel
    if (!interaction.channel || !('name' in interaction.channel) || !interaction.channel.name?.toLocaleLowerCase().includes('playhouse')) {
        return await interaction.reply({ content: 'This isnt a playhouse channel.', flags: MessageFlags.Ephemeral })
    }

    // Aborts if no repository is selected
    if (!repository) {
        return await interaction.reply({ content: 'No repository selected.', flags: MessageFlags.Ephemeral })
    }

    // Tries to find a matching repository
    for (const repo of repositories) {
        if (repo.name === repository) {
            match = repo
        }
    }

    // Aborts if no matching repository exists
    if (!match) {
        return await interaction.reply({ content: `No repository matches '${repository}'.`, flags: MessageFlags.Ephemeral })
    }

    const [version, commits] = await Promise.all([
        await getTags(match.id),
        await getCommits(match.id, branch)
    ])
    const latestVersion = version[0] || FALLBACK_TAG

    if (!commits.length) {
        return await interaction.reply({
            content: `No commits exist for branch ${branch} in repository '${repository}'.`,
            flags: MessageFlags.Ephemeral
        })
    }

    const now = new Date()
    const latestCommitDate = new Date(commits[0].created_at)
    const avatar = match.avatar_url || `${GITLAB_BASE}${match.namespace.avatar_url}`

    const embed = new EmbedBuilder()
        .setTitle(`Creating new deployment for ${match.name}${branch ? ` from branch ${branch}` : ''}.`)
        .setDescription(match.description || match.name)
        .setColor('#fd8738')
        .setTimestamp()
        .setThumbnail(avatar || null)
        .setURL(latestVersion.commit.web_url)
        .addFields([
            { name: 'ID', value: String(match.id), inline: true },
            { name: 'Branch', value: branch || match.default_branch, inline: true },
            { name: 'Last activity', value: new Date(match.last_activity_at).toLocaleString(), inline: true },
            { name: 'Current version', value: latestVersion.name, inline: true },
            { name: 'Commit', value: latestVersion.commit.short_id, inline: true },
            { name: 'Created At', value: new Date(latestVersion.commit.created_at).toLocaleString(), inline: true },
            { name: 'Title', value: latestVersion.commit.title },
            { name: 'Author', value: latestVersion.commit.author_name, inline: true },
            { name: 'Author Email', value: latestVersion.commit.author_email, inline: true },
            { name: 'Recent commits', value: ' ' },
            ...formatCommits(commits, 5)
        ])

    if (now.getTime() - latestCommitDate.getTime() > TWO_WEEKS) {
        const embedOldWarning = new EmbedBuilder()
            .setTitle('Very old commit (>2w). Are you sure?')
            .setDescription(
                `The most recent commit for ${match.name}${branch ? ` branch ${branch}` : ''} ` +
                `is more than two weeks old. It was created ${latestCommitDate.toLocaleString('no-NO')}. ` +
                'Are you sure this is the commit you want to deploy?'
            )
            .setColor('#ff0000')

        // Creates 'yes' button
        const deployYes = new ButtonBuilder()
            .setCustomId('deployYes')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Secondary)

        // Creates 'no' button
        const deployNo = new ButtonBuilder()
            .setCustomId('deployNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Primary)

        // Creates 'trash' button
        const trash = new ButtonBuilder()
            .setCustomId('trash')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary)

        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(deployNo, deployYes, trash)

        await interaction.reply({ embeds: [embed, embedOldWarning], components: [buttons] })
    }

    continueDeployment({ interaction, embed, latestVersion: latestVersion.name })
}
