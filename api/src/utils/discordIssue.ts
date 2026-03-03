import config from '#constants'

const { WEBHOOK_URL_ISSUE } = config

export default async function discordIssue(title: string, description: string, footer: string, color: string) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: { content?: string; embeds: any[] } = {
            embeds: [
                {
                    title: title,
                    description: description,
                    color: getColor(color),
                    timestamp: new Date().toISOString(),
                    footer: footer ? { text: footer } : undefined
                }
            ]
        }

        const response = await fetch(WEBHOOK_URL_ISSUE ?? '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.status
    } catch (error) {
        console.log(`Error while creating Discord issue: ${error}`)
        throw error
    }
}

function getColor(name: string) {
    switch (name.toLowerCase()) {
        case 'blue':
            return 0x4493f8
        case 'green':
            return 0x3fb950
        case 'yellow':
            return 0xd29922
        case 'orange':
            return 0xdb6d28
        case 'red':
            return 0xf85149
        case 'pink':
            return 0xdb61a2
        case 'purple':
            return 0xab7df8
        default:
            return 0x9198a1
    }
}
