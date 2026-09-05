CREATE TABLE IF NOT EXISTS event_rejections (
    rejection_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    rejected_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS event_rejections_event_id_created_at_idx
    ON event_rejections (event_id, created_at DESC);