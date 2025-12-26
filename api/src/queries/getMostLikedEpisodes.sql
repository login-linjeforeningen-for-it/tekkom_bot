SELECT 
    e.name AS episode,
    ar.name AS show,
    e.skips,
    e.listens,
    e.id,
    e."image",
    (
        e.listens::float / NULLIF(e.listens + e.skips, 0)
    ) AS like_ratio
FROM episodes e
    JOIN artists ar ON e.show = ar.id
WHERE e.listens >= 5
    AND e.skips >= 2
ORDER BY like_ratio DESC
LIMIT 5;
