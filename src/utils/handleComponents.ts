import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { nextPage, previousPage } from '#utils/help.ts'

export default async function handleComponents(interaction: ButtonInteraction | ChatInputCommandInteraction, id: string | undefined) {
    const buttonInteraction = interaction as ButtonInteraction

    // id is present if interaction is ChatInputCommandInteraction
    switch (id || buttonInteraction.customId) {
        case 'next_page_help':
            await nextPage(buttonInteraction)
            break
        case 'previous_page_help':
            await previousPage(buttonInteraction)
            break
        default:
            console.log(`${buttonInteraction.customId || id} is unhandled in handleComponents.`)
            await buttonInteraction.reply({ content: `Unknown action. ${buttonInteraction.customId}`, flags: MessageFlags.Ephemeral })
            break
    }
}
