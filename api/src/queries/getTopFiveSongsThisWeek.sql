SELECT 
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
WHERE DATE_TRUNC('week', l."start") = DATE_TRUNC('week', CURRENT_DATE)
  AND NOT l.skipped
GROUP BY s.name, ar.name, al.name, s."image", s.id, s.artist, s.album
ORDER BY listens DESC
LIMIT 5;
