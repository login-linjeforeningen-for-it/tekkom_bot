SELECT 
    s.name AS song, 
    ar.name AS artist, 
    al.name AS album, 
    s.skips, 
    s."image", 
    s.id AS song_id,
    s.artist AS artist_id,
    s.album AS album_id
FROM songs s
JOIN artists ar ON s.artist = ar.id
JOIN albums al ON s.album = al.id
ORDER BY s.skips DESC
LIMIT 5;
