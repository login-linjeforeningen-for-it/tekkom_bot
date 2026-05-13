import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'
import { CronExpressionParser } from 'cron-parser'

export default async function checkAnnouncements() {
    const query = (await loadSQL('getSentAnnouncements.sql'))
    const result = await run(query)
    const announcements = result.rows as RecurringAnnouncement[]
    for (const announcement of announcements) {
        if (cronTimeHasCome(announcement)) {
            await run(
                `UPDATE announcements 
                SET sent = false
                WHERE id = $1;`,
                [announcement.id]
            )
        }
    }
}

function cronTimeHasCome(announcement: RecurringAnnouncement) {
    const interval = announcement.interval
    const lastSent = announcement.last_sent

    const cronMatch = interval.match(/^(\S+) (\S+) (\S+) (\S+) (\S+)(?: (\*?\/(\d+)))?$/)
    if (!cronMatch) {
        return false
    }

    const cronExpr = `${cronMatch[1]} ${cronMatch[2]} ${cronMatch[3]} ${cronMatch[4]} ${cronMatch[5]}`
    const step = cronMatch[7] ? parseInt(cronMatch[7]) : 1

    try {
        const cronInterval = CronExpressionParser.parse(cronExpr, { currentDate: new Date() })
        const prevDate = cronInterval.prev().toDate()
        const prev = new Date(prevDate.getTime() - (step - 1) * 7 * 24 * 60 * 60 * 1000)

        if (!announcement.last_sent) {
            return true
        }

        const lastSentDate = new Date(lastSent)
        return lastSentDate < prev
    } catch (err) {
        console.log('Invalid cron expression:', interval, err)
        return false
    }
}
