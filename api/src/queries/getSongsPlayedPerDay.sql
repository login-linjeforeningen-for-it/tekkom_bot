WITH daily_counts AS (
    SELECT 
        DATE(l."start") AS day,
        s.name AS song,
        ar.name AS artist,
        al.name AS album,
        s."image",
        s.id AS song_id,
        s.artist AS artist_id,
        s.album AS album_id,
        COUNT(*)::INT AS listens
    FROM listens l
    JOIN songs s ON l.song_id = s.id
    JOIN artists ar ON s.artist = ar.id
    JOIN albums al ON s.album = al.id
    WHERE l."start" >= NOW() - INTERVAL '365 days'
      AND NOT l.skipped
    GROUP BY day, s.name, ar.name, al.name, s."image", s.id, s.artist, s.album
),
ranked AS (
    SELECT 
        day, 
        song, 
        artist, 
        album, 
        "image", 
        listens, 
        song_id,
        artist_id,
        album_id,
        ROW_NUMBER() OVER (PARTITION BY day ORDER BY listens DESC) AS rn,
        SUM(listens) OVER (PARTITION BY day)::INT AS total_songs_played
    FROM daily_counts
)
SELECT day, song, artist, album, "image", listens, total_songs_played, song_id, artist_id, album_id
FROM ranked
WHERE rn = 1
ORDER BY day ASC;
