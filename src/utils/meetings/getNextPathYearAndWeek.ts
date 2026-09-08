export default  function getNextPathYearAndWeek(isStyret: boolean) {
    // Current date
    const currentDate = new Date()

    // Set to Monday (start of the week)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)

    // Calculate current week's year and week
    const currentWeek = getYearAndWeek(currentDate)

    // Move to next week's date
    const nextWeekDate = new Date(currentDate)
    nextWeekDate.setDate(nextWeekDate.getDate() + 7)

    // Calculate next week's year and week
    const nextWeek = getYearAndWeek(nextWeekDate)

    // The page is created on the Monday of the meeting week, but the meeting
    // itself is on the Thursday. Format that Thursday to dd.mm.yy.
    const meetingDate = new Date(currentDate)
    meetingDate.setDate(meetingDate.getDate() + 3)

    const meetingDay = String(meetingDate.getDate()).padStart(2, '0')
    const meetingMonth = String(meetingDate.getMonth() + 1).padStart(2, '0')
    const meetingYear = String(meetingDate.getFullYear())

    // Today
    const todaysDate = new Date()
    const todayDay = String(todaysDate.getDate()).padStart(2, '0')
    const todayMonth = String(todaysDate.getMonth() + 1).padStart(2, '0')
    const todayYear = String(todaysDate.getFullYear())

    const meeting = `${meetingDay}.${meetingMonth}.${meetingYear.slice(-2)}`
    const today = `${todayDay}.${todayMonth}.${todayYear}`

    return {
        currentPath: isStyret ? `${currentWeek.year}-${currentWeek.week - 1}` : '2026-00',
        nextPath: isStyret
            ? `${nextWeek.year}-${nextWeek.week - 1}`
            : `${currentWeek.year}-${currentWeek.week}`,
        currentWeek: currentWeek.week,
        date: isStyret ? today : meeting
    }
}

function getYearAndWeek(date: Date) {
    // Copy the date to avoid modifying the original
    const d = new Date(date.getTime())

    // Move date to the nearest Thursday (ISO week date system)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)

    // Get the first day of the year
    const firstThursday = new Date(d.getFullYear(), 0, 4)
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7)

    // Calculate week number
    const weekNumber = Math.ceil(((d.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7)

    return {
        year: d.getFullYear(),
        week: weekNumber
    }
}
