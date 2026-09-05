-- Convert legacy teacher event drafts to the pending approval state.
UPDATE events
SET status = 'pending', updated_at = CURRENT_TIMESTAMP
WHERE status = 'draft';

-- Run these statements only if the live events.status column still has a
-- default of draft or a CHECK constraint that excludes pending.
ALTER TABLE events
    ALTER COLUMN status SET DEFAULT 'pending';