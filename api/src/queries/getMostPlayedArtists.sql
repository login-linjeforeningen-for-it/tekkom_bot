WITH artist_counts AS (
    SELECT 
        s.artist,
        COUNT(*)::INT AS listens
    FROM listens l
    JOIN songs s ON l.song_id = s.id
    GROUP BY s.artist
),
top_songs AS (
    SELECT DISTINCT ON (s.artist)
        s.artist,
        s.name AS top_song,
        al.name AS album,
        s."image",
        s.id
    FROM songs s
    JOIN listens l ON l.song_id = s.id
    JOIN albums al ON s.album = al.id
    ORDER BY s.artist, COUNT(l.*) OVER (PARTITION BY s.artist, s.id) DESC
)
SELECT 
    ar.name AS artist,
    ar.id AS artist_id,
    ac.listens,
    ts.top_song,
    ts.album,
    ts."image",
    ts.id AS song_id
FROM artist_counts ac
JOIN artists ar ON ac.artist = ar.id
LEFT JOIN top_songs ts ON ac.artist = ts.artist
WHERE ar.id IS NOT NULL
  AND ar.id <> 'Unknown'
  AND ar.id <> 'undefined'
ORDER BY ac.listens DESC
LIMIT 5;
