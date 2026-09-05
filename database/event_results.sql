CREATE TABLE IF NOT EXISTS public.event_results (
    result_id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL
        REFERENCES public.events(id)
        ON DELETE CASCADE,
    registration_id BIGINT
        REFERENCES public.event_registrations(registration_id)
        ON DELETE CASCADE,
    team_id BIGINT
        REFERENCES public.teams(id)
        ON DELETE CASCADE,
    position INTEGER,
    rank_label VARCHAR(50),
    score NUMERIC(8,2),
    max_score NUMERIC(8,2),
    special_award VARCHAR(150),
    remarks TEXT,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    declared_by BIGINT
        REFERENCES public.users(user_id),
    declared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_results_one_subject_check
        CHECK ((registration_id IS NOT NULL) <> (team_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS event_results_event_id_idx
    ON public.event_results (event_id);
