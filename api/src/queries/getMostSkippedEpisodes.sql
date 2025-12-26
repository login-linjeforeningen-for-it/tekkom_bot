SELECT 
    e.name AS "name",
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
ORDER BY e.skips DESC
LIMIT 5;
