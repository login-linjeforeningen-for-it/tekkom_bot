import run from '#db'
import { loadSQL } from '#utils/loadSQL.ts'

export async function preloadListenActivityQueries() {
    const [
        getStatistics,
        getCurrentlyListening,
        getMostPlayedAlbums,
        getMostPlayedArtists,
        getMostPlayedSongs,
        getMostPlayedEpisodes,
        getSongsPlayedPerDay,
        getTopFiveSongsToday,
        getTopFiveSongsYesterday,
        getTopFiveSongsThisWeek,
        getTopFiveSongsLastWeek,
        getTopFiveSongsThisMonth,
        getTopFiveEpisodesThisMonth,
        getTopFiveSongsLastMonth,
        getTopFiveSongsThisYear,
        getTopFiveSongsLastYear,
        getMostActiveListenUsers,
        getMostSkippingUsers,
        getMostLikedAlbums,
        getMostLikedArtists,
        getMostLikedSongs,
        getMostLikedEpisodes,
        getMostSkippedAlbums,
        getMostSkippedArtists,
        getMostSkippedSongs,
        getMostSkippedEpisodes
    ] = await Promise.all([
        loadSQL('getStatistics.sql'),
        loadSQL('getCurrentlyListening.sql'),
        loadSQL('getMostPlayedAlbums.sql'),
        loadSQL('getMostPlayedArtists.sql'),
        loadSQL('getMostPlayedSongs.sql'),
        loadSQL('getMostPlayedEpisodes.sql'),
        loadSQL('getSongsPlayedPerDay.sql'),
        loadSQL('getTopFiveSongsToday.sql'),
        loadSQL('getTopFiveSongsYesterday.sql'),
        loadSQL('getTopFiveSongsThisWeek.sql'),
        loadSQL('getTopFiveSongsLastWeek.sql'),
        loadSQL('getTopFiveSongsThisMonth.sql'),
        loadSQL('getTopFiveEpisodesThisMonth.sql'),
        loadSQL('getTopFiveSongsLastMonth.sql'),
        loadSQL('getTopFiveSongsThisYear.sql'),
        loadSQL('getTopFiveSongsLastYear.sql'),
        loadSQL('getMostActiveListenUsers.sql'),
        loadSQL('getMostSkippingUsers.sql'),
        loadSQL('getMostLikedAlbums.sql'),
        loadSQL('getMostLikedArtists.sql'),
        loadSQL('getMostLikedSongs.sql'),
        loadSQL('getMostLikedEpisodes.sql'),
        loadSQL('getMostSkippedAlbums.sql'),
        loadSQL('getMostSkippedArtists.sql'),
        loadSQL('getMostSkippedSongs.sql'),
        loadSQL('getMostSkippedEpisodes.sql')
    ])

    const [
        statsResult,
        currentlyListeningResult,
        mostPlayedAlbumsResult,
        mostPlayedArtistsResult,
        mostPlayedSongsResult,
        mostPlayedEpisodesResult,
        mostPlayedSongsPerDayResult,
        topFiveTodayResult,
        topFiveYesterdayResult,
        topFiveThisWeekResult,
        topFiveLastWeekResult,
        topFiveThisMonthResult,
        topFiveEpisodesThisMonthResult,
        topFiveLastMonthResult,
        topFiveThisYearResult,
        topFiveLastYearResult,
        mostActiveUsersResult,
        mostSkippingUsersResult,
        mostLikedAlbumsResult,
        mostLikedArtistsResult,
        mostLikedSongsResult,
        mostLikedEpisodesResult,
        mostSkippedAlbumsResult,
        mostSkippedArtistsResult,
        mostSkippedSongsResult,
        mostSkippedEpisodesResult,
    ] = await Promise.all([
        run(getStatistics),
        run(getCurrentlyListening),
        run(getMostPlayedAlbums),
        run(getMostPlayedArtists),
        run(getMostPlayedSongs),
        run(getMostPlayedEpisodes),
        run(getSongsPlayedPerDay),
        run(getTopFiveSongsToday),
        run(getTopFiveSongsYesterday),
        run(getTopFiveSongsThisWeek),
        run(getTopFiveSongsLastWeek),
        run(getTopFiveSongsThisMonth),
        run(getTopFiveEpisodesThisMonth),
        run(getTopFiveSongsLastMonth),
        run(getTopFiveSongsThisYear),
        run(getTopFiveSongsLastYear),
        run(getMostActiveListenUsers),
        run(getMostSkippingUsers),
        run(getMostLikedAlbums),
        run(getMostLikedArtists),
        run(getMostLikedSongs),
        run(getMostLikedEpisodes),
        run(getMostSkippedAlbums),
        run(getMostSkippedArtists),
        run(getMostSkippedSongs),
        run(getMostSkippedEpisodes)
    ])

    const stats = statsResult.rows[0]
    const currentlyListening = currentlyListeningResult.rows
    const mostPlayedAlbums = mostPlayedAlbumsResult.rows
    const mostPlayedArtists = mostPlayedArtistsResult.rows
    const mostPlayedSongs = mostPlayedSongsResult.rows
    const mostPlayedEpisodes = mostPlayedEpisodesResult.rows
    const mostPlayedSongsPerDay = mostPlayedSongsPerDayResult.rows
    const topFiveToday = topFiveTodayResult.rows
    const topFiveYesterday = topFiveYesterdayResult.rows
    const topFiveThisWeek = topFiveThisWeekResult.rows
    const topFiveLastWeek = topFiveLastWeekResult.rows
    const topFiveThisMonth = topFiveThisMonthResult.rows
    const topFiveEpisodesThisMonth = topFiveEpisodesThisMonthResult.rows
    const topFiveLastMonth = topFiveLastMonthResult.rows
    const topFiveThisYear = topFiveThisYearResult.rows
    const topFiveLastYear = topFiveLastYearResult.rows
    const mostActiveUsers = mostActiveUsersResult.rows
    const mostSkippingUsers = mostSkippingUsersResult.rows
    const mostLikedAlbums = mostLikedAlbumsResult.rows
    const mostLikedArtists = mostLikedArtistsResult.rows
    const mostLikedSongs = mostLikedSongsResult.rows
    const mostLikedEpisodes = mostLikedEpisodesResult.rows
    const mostSkippedAlbums = mostSkippedAlbumsResult.rows
    const mostSkippedArtists = mostSkippedArtistsResult.rows
    const mostSkippedSongs = mostSkippedSongsResult.rows
    const mostSkippedEpisodes = mostSkippedEpisodesResult.rows

    return {
        stats,
        currentlyListening,
        mostPlayedAlbums,
        mostPlayedArtists,
        mostPlayedSongs,
        mostPlayedEpisodes,
        mostPlayedSongsPerDay,
        topFiveToday,
        topFiveYesterday,
        topFiveThisWeek,
        topFiveLastWeek,
        topFiveThisMonth,
        topFiveEpisodesThisMonth,
        topFiveLastMonth,
        topFiveThisYear,
        topFiveLastYear,
        mostActiveUsers,
        mostSkippingUsers,
        mostLikedAlbums,
        mostLikedArtists,
        mostLikedSongs,
        mostLikedEpisodes,
        mostSkippedAlbums,
        mostSkippedArtists,
        mostSkippedSongs,
        mostSkippedEpisodes
    }
}
