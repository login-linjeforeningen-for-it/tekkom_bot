SELECT 
    e.name AS "name",
    ar.name AS show,
    s.inspired,
    e.skips,
    e.listens,
    e.id,
    e."image",
    (
        e.listens::float / NULLIF(e.listens + e.skips, 0)
    ) AS like_ratio
FROM episodes e
    JOIN artists ar ON e.show = ar.id
WHERE e.inspired > 0
ORDER BY like_ratio DESC
LIMIT 5;
