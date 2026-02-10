UPDATE songs
SET inspired = COALESCE(inspired, 0) + 1
WHERE id = $1
RETURNING inspired;