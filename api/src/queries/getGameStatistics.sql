SELECT
    ROUND(AVG(EXTRACT(EPOCH FROM ("end" - "start"))))::BIGINT AS avg_seconds,
    ROUND(SUM(EXTRACT(EPOCH FROM ("end" - "start")) / 60.0))::BIGINT AS total_minutes,
    ROUND(
        SUM(
            CASE WHEN DATE_PART('year', "end") = DATE_PART('year', CURRENT_DATE)
                 THEN EXTRACT(EPOCH FROM ("end" - "start")) / 60.0
                 ELSE 0
            END
        )
    )::BIGINT AS total_minutes_this_year,
    COUNT(*)::BIGINT AS total_sessions
FROM game_activity;
