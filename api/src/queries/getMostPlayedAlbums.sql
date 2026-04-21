WITH top_songs AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY artist, album ORDER BY listens DESC) AS rn
    FROM songs
)
SELECT 
    al.name AS album,
    al.id AS album_id,
    ar.name AS artist,
    ar.id AS artist_id,
    SUM(s.listens) AS total_listens,
    ts.name AS top_song,
    ts."image" AS top_song_image,
    ts.id AS song_id
FROM songs s
JOIN albums al ON s.album = al.id
JOIN artists ar ON s.artist = ar.id
JOIN top_songs ts 
    ON ts.artist = s.artist AND ts.album = s.album AND ts.rn = 1
WHERE ar.id IS NOT NULL
  AND ar.id <> 'Unknown'
  AND ar.id <> 'undefined'
GROUP BY al.name, al.id, ar.name, ar.id, ts.name, ts."image", ts.id
ORDER BY total_listens DESC
LIMIT 5;
