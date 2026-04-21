WITH artist_skips AS (
    SELECT 
        s.artist AS artist_id,
        SUM(CASE WHEN l.skipped THEN 1 ELSE 0 END)::INT AS skips
    FROM listens l
    JOIN songs s ON l.song_id = s.id
    GROUP BY s.artist
),
top_songs AS (
    SELECT DISTINCT ON (s.artist)
        s.artist AS artist_id,
        s.id AS id,
        s.name AS top_song,
        s.album AS album_id,
        s."image",
        COUNT(l.*) OVER (PARTITION BY s.artist, s.id) AS play_count
    FROM songs s
    JOIN listens l ON l.song_id = s.id
    ORDER BY s.artist, play_count DESC
)
SELECT 
    ar.name AS artist,
    ar.id AS artist_id,
    ak.skips,
    ts.top_song,
    al.name AS album,
    al.id AS album_id,
    ts."image",
    ts.id AS song_id
FROM artist_skips ak
JOIN artists ar ON ak.artist_id = ar.id
LEFT JOIN top_songs ts ON ak.artist_id = ts.artist_id
LEFT JOIN albums al ON ts.album_id = al.id
WHERE ar.id IS NOT NULL
  AND ar.id <> 'Unknown'
  AND ar.id <> 'undefined'
ORDER BY ak.skips DESC
LIMIT 5;
