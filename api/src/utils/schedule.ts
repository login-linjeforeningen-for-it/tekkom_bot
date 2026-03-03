export function humanToSchedule(
    interval: string,
    minute: string = '0',
    hour: string = '0',
    day: string = '1',
    week: string = '0'
) {
    let output

    if (isValidCronExpr(interval)) {
        return interval
    }

    switch (interval.toLowerCase()) {
        case 'every minute':
            output = '* * * * *'
            break
        case 'hourly':
            output = `${minute} * * * *`
            break
        case 'daily':
            output = `${minute} ${hour} * * *`
            break
        case 'weekly':
            output = `${minute} ${hour} * * ${week}`
            break
        case 'biweekly':
            output = '* * * * * */2'
            break
        case 'once a month':
            output = `${minute} ${hour} ${day} * *`
            break
        case 'once a year':
            output = `${minute} ${hour} ${day} 1 *`
            break
        default:
            throw new Error(`Unsupported interval: ${interval}`)
    }

    return output
}

// Cron -> Human
export function scheduleToHuman(interval: string) {
    const parts = interval.split(' ')
    if (parts.length !== 5 && parts.length !== 6) throw new Error('Invalid cron expression')

    const [minute, hour, day, month, week] = parts
    let output

    switch (true) {
        case interval === '* * * * *':
            output = 'every minute'
            break
        case hour === '*' && day === '*' && week === '*':
            output = 'hourly'
            break
        case day === '*' && week === '*' && month === '*':
            output = 'daily'
            break
        case week !== '*':
            output = 'weekly'
            break
        case month === '*' && day !== '*':
            output = 'once a month'
            break
        case month === '1':
            output = 'once a year'
            break
        default:
            output = 'custom'
            break
    }

    return { output, minute, hour, day, week }
}

function isValidCronExpr(expr: string): boolean {
    const cronRegex = new RegExp(
        String.raw`
^
(\*|([0-5]?\d))
( (\*|([01]?\d|2[0-3])))
( (\*|([01]?\d|2[0-3])))
( (\*|([1-9]|[12]\d|3[01])))
( (\*|[0-6]))
( (\/(\d+)))?
$
        `.replace(/\s+/g, '')
    )

    return cronRegex.test(expr)
}
