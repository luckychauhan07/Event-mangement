exports.getEventDetails = `
SELECT 
    e.*,

    -- ========================
    -- Coordinators
    -- ========================
    (
        SELECT COALESCE(
            json_agg(
                jsonb_build_object(
                    'user_id', u.user_id,
                    'name', u.full_name,
                    'email', u.email,
                    'phone', u.phone,
                    'role', ec.role
                )
            ),
            '[]'
        )
        FROM event_coordinators ec
        JOIN users u ON ec.user_id = u.user_id
        WHERE ec.event_id = e.id
    ) AS coordinators,

    -- ========================
    -- Form Fields
    -- ========================
    (
        SELECT COALESCE(
            json_agg(
                jsonb_build_object(
                    'field_id', f.field_key,
                    'label', f.label,
                    'type', f.field_type,
                    'required', f.is_required,
                    'options', f.options,
                    'order', f.display_order
                )
                ORDER BY f.display_order
            ),
            '[]'
        )
        FROM event_form_fields f
        WHERE f.event_id = e.id
    ) AS form_fields,

FROM events e
WHERE e.id = $1;
`;
