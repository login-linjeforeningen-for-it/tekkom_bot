-- Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    avatar TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- Artists 
CREATE TABLE IF NOT EXISTS artists (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    listens INT DEFAULT 1,
    skips INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Albums
CREATE TABLE IF NOT EXISTS albums (
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY (id)
);

-- Songs 
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    artist TEXT NOT NULL REFERENCES artists(id),
    album TEXT NOT NULL REFERENCES albums(id),
    "image" TEXT NOT NULL,
    listens INT DEFAULT 1,
    skips INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Episodes
CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    show TEXT NOT NULL REFERENCES artists(id),
    "image" TEXT NOT NULL,
    listens INT DEFAULT 1,
    skips INT DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Listens
CREATE TABLE IF NOT EXISTS listens (
    id SERIAL PRIMARY KEY,
    song_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('track', 'episode')),
    user_id TEXT NOT NULL REFERENCES users(id),
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMESTAMPTZ NOT NULL,
    source TEXT NOT NULL,
    skipped BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    channel TEXT NOT NULL,
    roles TEXT [],
    embed BOOLEAN,
    color TEXT,
    interval TEXT,
    time TIMESTAMPTZ,
    sent BOOLEAN DEFAULT false,
    last_sent TIMESTAMPTZ
);

-- Btg
CREATE TABLE IF NOT EXISTS btg (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Games
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    image TEXT,
    players INT DEFAULT 1,
    image_text TEXT
);

-- Game Activity
CREATE TABLE IF NOT EXISTS game_activity (
    id SERIAL PRIMARY KEY,
    game_id INT NOT NULL REFERENCES games(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    details TEXT,
    state TEXT,
    application TEXT,
    "start" TIMESTAMPTZ NOT NULL,
    "end" TIMEStAMPTZ NOT NULL,
    party TEXT
);

-- Hidden 
CREATE TABLE IF NOT EXISTS "hidden" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Debt
CREATE TABLE IF NOT EXISTS debt (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    amount INT NOT NULL CHECK (amount > 0),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Optimalizations
CREATE INDEX idx_listens_timestamp_desc ON listens ("timestamp" DESC);
CREATE INDEX idx_songs_listens_skips ON songs (listens, skips);
CREATE INDEX idx_user_listens ON listens (user_id, skipped);
CREATE INDEX idx_announcements_interval_sent_time ON announcements (interval, sent, "time");
CREATE INDEX idx_listens_start_not_skipped ON listens ("start")
WHERE NOT skipped;
CREATE INDEX idx_listens_not_skipped ON listens (skipped)
WHERE skipped = false;
CREATE INDEX idx_listens_active_now ON listens ("user_id", "start", "end", skipped);

-- For top songs per artist queries
CREATE INDEX idx_songs_name_artist_album ON songs (name, artist, album);

-- For queries ordering by listens or skips
CREATE INDEX idx_songs_listens_desc ON songs (listens DESC);
CREATE INDEX idx_songs_skips_desc ON songs (skips DESC);

-- For queries combining artist with listens
CREATE INDEX idx_songs_artist_listens_desc ON songs (artist, listens DESC);
CREATE INDEX idx_songs_artist_skips_desc ON songs (artist, skips DESC);
CREATE INDEX idx_artists_listens_desc ON artists (listens DESC);
CREATE INDEX idx_artists_skips_desc ON artists (skips DESC);

-- Unique ids if not unknown
CREATE UNIQUE INDEX IF NOT EXISTS artists_unique_id ON artists(id)
WHERE id <> 'Unknown';
CREATE UNIQUE INDEX IF NOT EXISTS albums_unique_id ON albums(id)
WHERE id <> 'Unknown';

-- Number of helper functions per query to increase performance
SET max_parallel_workers_per_gather = 4;

CREATE OR REPLACE FUNCTION listens_media_exists() RETURNS trigger AS $$ BEGIN IF NEW.type = 'track' THEN IF NOT EXISTS (
        SELECT 1
        FROM songs
        WHERE id = NEW.song_id
    ) THEN RAISE EXCEPTION 'listen references non-existent track id: %',
    NEW.song_id;
END IF;
ELSIF NEW.type = 'episode' THEN IF NOT EXISTS (
    SELECT 1
    FROM episodes
    WHERE id = NEW.song_id
) THEN RAISE EXCEPTION 'listen references non-existent episode id: %',
NEW.song_id;
END IF;
ELSE RAISE EXCEPTION 'invalid type: %',
NEW.type;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_listens_media_exists BEFORE
INSERT
    OR
UPDATE ON listens FOR EACH ROW EXECUTE FUNCTION listens_media_exists();
