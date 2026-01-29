import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export default async function preloadGameActivityQueriesCold() {
    const [
        getStatistics,
        getMostPlayedGames,
        getGamesPlayedPerDay,
        getTopFiveToday,
        getTopFiveYesterday,
        getTopFiveThisWeek,
        getTopFiveLastWeek,
        getTopFiveThisMonth,
        getTopFiveLastMonth,
        getTopFiveThisYear,
        getTopFiveLastYear,
        getMostActiveUsers,
        getMostSkippingUsers,
        getMostLikedGames,
        getMostSkippedGames
    ] = await Promise.all([
        loadSQL('getGameStatistics.sql'),
        loadSQL('getMostPlayedGames.sql'),
        loadSQL('getGamesPlayedPerDay.sql'),
        loadSQL('getTopFiveGamesToday.sql'),
        loadSQL('getTopFiveGamesYesterday.sql'),
        loadSQL('getTopFiveGamesThisWeek.sql'),
        loadSQL('getTopFiveGamesLastWeek.sql'),
        loadSQL('getTopFiveGamesThisMonth.sql'),
        loadSQL('getTopFiveGamesLastMonth.sql'),
        loadSQL('getTopFiveGamesThisYear.sql'),
        loadSQL('getTopFiveGamesLastYear.sql'),
        loadSQL('getMostActivePlayingUsers.sql'),
        loadSQL('getMostSkippingGameUsers.sql'),
        loadSQL('getMostLikedGames.sql'),
        loadSQL('getMostSkippedGames.sql')
    ])

    const [
        statsResult,
        mostPlayedGamesResult,
        mostPlayedGamesPerDayResult,
        topFiveTodayResult,
        topFiveYesterdayResult,
        topFiveThisWeekResult,
        topFiveLastWeekResult,
        topFiveThisMonthResult,
        topFiveLastMonthResult,
        topFiveThisYearResult,
        topFiveLastYearResult,
        mostActiveUsersResult,
        mostSkippingUsersResult,
        mostLikedGamesResult,
        mostSkippedGamesResult
    ] = await Promise.all([
        run(getStatistics),
        run(getMostPlayedGames),
        run(getGamesPlayedPerDay),
        run(getTopFiveToday),
        run(getTopFiveYesterday),
        run(getTopFiveThisWeek),
        run(getTopFiveLastWeek),
        run(getTopFiveThisMonth),
        run(getTopFiveLastMonth),
        run(getTopFiveThisYear),
        run(getTopFiveLastYear),
        run(getMostActiveUsers),
        run(getMostSkippingUsers),
        run(getMostLikedGames),
        run(getMostSkippedGames)
    ])

    const stats = statsResult.rows[0]
    const mostPlayedGames = mostPlayedGamesResult.rows
    const mostPlayedGamesPerDay = mostPlayedGamesPerDayResult.rows
    const topFiveToday = topFiveTodayResult.rows
    const topFiveYesterday = topFiveYesterdayResult.rows
    const topFiveThisWeek = topFiveThisWeekResult.rows
    const topFiveLastWeek = topFiveLastWeekResult.rows
    const topFiveThisMonth = topFiveThisMonthResult.rows
    const topFiveLastMonth = topFiveLastMonthResult.rows
    const topFiveThisYear = topFiveThisYearResult.rows
    const topFiveLastYear = topFiveLastYearResult.rows
    const mostActiveUsers = mostActiveUsersResult.rows
    const mostSkippingUsers = mostSkippingUsersResult.rows
    const mostLikedGames = mostLikedGamesResult.rows
    const mostSkippedGames = mostSkippedGamesResult.rows

    return {
        stats,
        mostPlayedGames,
        mostPlayedGamesPerDay,
        topFiveToday,
        topFiveYesterday,
        topFiveThisWeek,
        topFiveLastWeek,
        topFiveThisMonth,
        topFiveLastMonth,
        topFiveThisYear,
        topFiveLastYear,
        mostActiveUsers,
        mostSkippingUsers,
        mostLikedGames,
        mostSkippedGames
    }
}
