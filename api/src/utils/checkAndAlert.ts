import run from '#db'
import discordAlert from '#utils/discordAlert.ts'

export default async function checkAndAlert(name: string, service: string, middleware: boolean) {
    let ping = true
    let author = ''
    const result = await run(
        'SELECT name, service FROM btg WHERE name = $1 AND service = $2;',
        [name, service]
    )
    const benign = result.rows as Btg[]

    for (const account of benign) {
        if (account.name === name && account.service === service) {
            ping = false
            author = account.author
        }
    }

    if (!ping) {
        return await discordAlert(`Detected BTG login towards ${service} from 
            user ${name} allowed by <@${author}>. Please verify that there are 
            currently known issues with Authentik and that this is expected.`)
    }

    if (!middleware) {
        await discordAlert(`Detected BTG login towards ${service} from user 
            ${name}. Please verify that there are currently known issues with 
            Authentik and that this is expected.`, '', true)
    }
}
