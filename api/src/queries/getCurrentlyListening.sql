SELECT * FROM (
  SELECT DISTINCT ON (l.user_id)
    l.*,
    COALESCE(s."image", e."image") AS "image",
    COALESCE(s.name, e.name) AS name,
    COALESCE(s.artist, e.show) AS artist_id,
    s.album AS album_id,
    ar.name AS artist,
    al.name AS album
  FROM listens l
  LEFT JOIN songs s ON l.song_id = s.id
  LEFT JOIN episodes e ON l.song_id = e.id
  LEFT JOIN artists ar ON s.artist = ar.id OR e.show = ar.id
  LEFT JOIN albums al ON s.album = al.id
  WHERE l."start" <= NOW()
    AND l."end" >= NOW()
    AND NOT l.skipped
  ORDER BY l.user_id, l."start" DESC
) AS per_user
ORDER BY (NOW() - per_user."start") ASC;
