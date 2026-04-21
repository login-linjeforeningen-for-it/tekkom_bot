SELECT
    al.name AS album,
    al.id AS album_id,
    ar.name AS artist,
    ar.id AS artist_id,
    s_top."image",
    s_top.id AS song_id,
    SUM(s.listens) AS total_listens,
    SUM(s.skips) AS total_skips,
    (SUM(s.listens)::float / NULLIF(SUM(s.listens + s.skips), 0)) AS like_ratio
FROM songs s
JOIN albums al ON s.album = al.id
JOIN artists ar ON s.artist = ar.id
JOIN LATERAL (
    SELECT *
    FROM songs s2
    WHERE s2.album = s.album AND s2.artist = s.artist
    ORDER BY s2.listens DESC
    LIMIT 1
) AS s_top ON true
GROUP BY al.name, al.id, ar.name, ar.id, s_top."image", s_top.id
HAVING SUM(s.listens) >= 10
   AND SUM(s.skips) >= 5
ORDER BY like_ratio DESC
LIMIT 5;
