import { ButtonInteraction, EmbedBuilder } from 'discord.js'
import { postTag } from '#utils/gitlab/tags.ts'
import { initialButtons } from '#utils/gitlab/buttons.ts'
import editEverySecondTillDone from '#utils/gitlab/editEverySecondTillDone.ts'

export default async function deploy(
    interaction: ButtonInteraction,
    tag: string,
    name: string,
    id: number,
    dev: string,
    ref?: string,
    rerun?: true
) {
    const message = interaction.message
    const title = `Deploying v${tag}${dev} for ${name}`
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription('(0s) Currently deploying ...')
        .setColor('#fd8738')
        .setTimestamp()

    await postTag(id, `${tag}${dev}`, ref)

    const embeds = message.embeds

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    rerun && embeds.pop()
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    embeds.length > 1 && embeds.pop()
    message.edit({
        embeds: [...embeds, embed],
        components: [initialButtons]
    })
    console.warn(`${interaction.user.username} started ${rerun ? 're' : ''}deploying ${tag}${dev} for ${name} (Repository ID ${id}).`)
    interaction.deferUpdate()

    if (rerun) {
        setTimeout(async() => {
            await editEverySecondTillDone(interaction.message, interaction.user.username, id, tag, name || '', 1)
        }, 10000)
    } else {
        await editEverySecondTillDone(interaction.message, interaction.user.username, id, tag, name || '', 1)
    }
}
