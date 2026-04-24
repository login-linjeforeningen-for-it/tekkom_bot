INSERT INTO artists (id, name)
VALUES ($1, $2)
ON CONFLICT (id) DO UPDATE
SET 
    listens = artists.listens + 1,
    timestamp = NOW(),
    name = CASE
             WHEN EXCLUDED.name IS NOT NULL
                  AND BTRIM(EXCLUDED.name) <> ''
                  AND EXCLUDED.name <> 'Unknown'
             THEN EXCLUDED.name
             ELSE artists.name
           END,
    id = CASE 
           WHEN artists.id = 'Unknown' AND EXCLUDED.id IS NOT NULL AND EXCLUDED.id <> 'Unknown' 
           THEN EXCLUDED.id
           ELSE artists.id
         END;
