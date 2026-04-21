WITH top_songs AS (
    SELECT DISTINCT ON (s.album, s.artist)
        s.album,
        s.artist,
        s.name AS top_song,
        s."image" AS top_song_image,
        s.id,
        COUNT(l2.*) AS play_count
    FROM songs s
    JOIN listens l2
        ON l2.song_id = s.id
    GROUP BY s.album, s.artist, s.name, s."image", s.id
    ORDER BY s.album, s.artist, COUNT(l2.*) DESC
)
SELECT
    al.name AS album,
    al.id AS album_id,
    ar.name AS artist,
    ar.id AS artist_id,
    SUM(CASE WHEN l.skipped THEN 1 ELSE 0 END)::INT AS skips,
    t.top_song,
    t.top_song_image,
    t.id AS song_id
FROM listens l
JOIN songs s ON l.song_id = s.id
JOIN albums al ON s.album = al.id
JOIN artists ar ON s.artist = ar.id
JOIN top_songs t
    ON s.album = t.album AND s.artist = t.artist
GROUP BY al.name, al.id, ar.name, ar.id, t.top_song, t.top_song_image, t.id
ORDER BY skips DESC
LIMIT 5;
