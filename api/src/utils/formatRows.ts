import getWeek from '#utils/getWeek.ts'

export default function formatRows(rows: Announcement[]) {
    const now = new Date()
    const year = now.getFullYear()
    const week = getWeek()
    return rows.map((row) => ({
        ...row,
        description: typeof row.description === 'string'
            ? (row.description as string)
                .replace(/{week}/g, week.toString())
                .replace(/{year}/g, year.toString())
            : row.description
    }))
}
