import type { Roles } from '#interfaces'
import config from '#config'
import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Role,
    MessageFlags
} from 'discord.js'
import getRepositories from '#utils/github/getRepositories.ts'
import create from '#utils/github/createIssueWrapper.ts'
import sanitize from '#utils/sanitize.ts'

export const data = new SlashCommandBuilder()
    .setName('issue')
    .setDescription('Creates a new issue in a repository.')
    .addStringOption((option) =>
        option
            .setName('repository')
            .setDescription('Repository to create the issue in.')
            .setAutocomplete(true)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('title')
            .setDescription('Title of the issue.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('description')
            .setDescription('Description of the issue.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Type of the issue.')
            .addChoices(
                { name: 'Bug', value: 'bug' },
                { name: 'Feature Request', value: 'feature' },
                { name: 'Task', value: 'task' },
                { name: 'Enhancement', value: 'enhancement' }
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('projecttype')
            .setDescription('Project type for the issue.')
            .addChoices(
                { name: 'Development', value: 'dev' },
                { name: 'Infrastructure', value: 'infra' }
            )
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('status')
            .setDescription('Status of the issue in the project board.')
            .addChoices(
                { name: 'Todo', value: 'Todo' },
                { name: 'In Progress', value: 'In Progress' },
                { name: 'Done', value: 'Done' }
            )
            .setRequired(false)
    )

export async function execute(interaction: ChatInputCommandInteraction) {
    const isAllowedAnywhere = (interaction.member?.roles as unknown as Roles)?.cache
        .some((role: Role) => role.id === config.roleID)

    // Get all the input options
    const repository = sanitize(interaction.options.getString('repository') || 'default')
    const title = sanitize(interaction.options.getString('title') || '')
    const description = sanitize(interaction.options.getString('description') || '')
    const type = sanitize(interaction.options.getString('type') || 'task')
    const projectType = sanitize(interaction.options.getString('projecttype') || 'dev') as 'dev' | 'infra'
    const status = sanitize(interaction.options.getString('status') || '')

    let match = null as GithubRepoSearchResultItem | null
    const repositories = await getRepositories(25, repository)

    const notTekkomKontakt = !interaction.channel || !('name' in interaction.channel) ||
        !interaction.channel.name?.toLocaleLowerCase().includes('tekkom-kontakt')
    if (notTekkomKontakt && !isAllowedAnywhere) {
        return await interaction.reply({ content: 'This isnt a tekkom-kontakt channel.', flags: MessageFlags.Ephemeral })
    }

    for (const repo of repositories) {
        if (repo.name === repository) {
            match = repo
        }
    }

    if (!match) {
        return await interaction.reply({ content: `No repository matches '${repository}'.`, flags: MessageFlags.Ephemeral })
    }

    try {
        const issueBody = `${description}` +
            '\n\n---\n' +
            `**Created by:** ${interaction.user.displayName} (${interaction.user.username})\n` +
            '**Created from:** Discord TekKom Bot'

        const issue = await create({
            repositoryId: match.node_id,
            title: title,
            body: issueBody,
            projectType: projectType,
            status: status
        })

        if (!issue) {
            throw new Error('Failed to create issue')
        }

        const embed = new EmbedBuilder()
            .setTitle(`Issue Created: ${title}`)
            .setURL(issue.url)
            .setDescription(description)
            .setTimestamp()
            .setColor('#28a745')
            .addFields([
                {
                    name: 'Type',
                    value: type.charAt(0).toUpperCase() + type.slice(1),
                    inline: true
                },
                {
                    name: 'Project Board',
                    value: issue.projectAdded ? `Added to ${projectType} board${status ? ` (${status})` : ''}` : '⚠️ Not added to board',
                    inline: true
                },
                {
                    name: 'Created by',
                    value: `<@${interaction.user.id}>`,
                    inline: true
                }
            ])
            .setFooter({
                text: `Issue #${issue.number} created in ${match.name}`,
            })

        await interaction.reply({ embeds: [embed] })

    } catch (error) {
        console.error('Error creating GitHub issue:', error)

        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Failed to Create Issue')
            .setDescription(`Failed to create issue in **${match.name}**: ${error}`)
            .setColor('#dc3545')
            .setTimestamp()
            .setFooter({
                text: 'Error occurred while creating issue',
                iconURL: interaction.user.displayAvatarURL()
            })

        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral })
    }
}
