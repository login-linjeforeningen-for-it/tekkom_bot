INSERT INTO episodes (id, "name", show, "image")
VALUES ($1, $2, $3, $4)
ON CONFLICT (id)
DO UPDATE 
SET 
    listens = episodes.listens + 1,
    "image" = EXCLUDED."image",
    show = CASE 
               WHEN EXCLUDED.show IS NOT NULL 
                    AND EXCLUDED.show <> 'Unknown' 
               THEN EXCLUDED.show 
               ELSE episodes.show 
             END
RETURNING id;
