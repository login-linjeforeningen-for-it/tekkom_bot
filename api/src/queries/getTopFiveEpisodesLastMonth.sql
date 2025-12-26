SELECT 
    e.name AS song,
    ar.name AS show,
    e."image",
    e.id,
    COUNT(*)::INT AS listens
FROM listens l
    JOIN episodes e ON l.song_id = e.id
    JOIN artists ar ON e.show = ar.id
WHERE DATE_TRUNC('month', l."start") = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND NOT l.skipped
GROUP BY e.name,
    ar.name,
    e."image",
    e.id
ORDER BY listens DESC
LIMIT 5;
