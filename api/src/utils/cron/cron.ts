import checkAnnouncements from './checks/announcements.ts'
import checkBtg from './checks/btg.ts'
import checkMaxConnections from './checks/maxConnections.ts'

export default async function cron() {
    Bun.cron('* * * * *', async() => {
        await checkMaxConnections()
        await checkAnnouncements()
        await checkBtg()
    })
}
