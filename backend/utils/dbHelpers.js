const mapDatabaseError = (error) => {
	switch (error?.code) {
		case "42P01":
			return {
				status: 500,
				message:
					"A required database table is missing. Please verify your Supabase schema.",
				errors: {
					database: [error.message || "Missing relation"],
				},
			};
		case "23505":
			return {
				status: 409,
				message: error.detail
					? `Duplicate value: ${error.detail}`
					: "A duplicate value was found.",
				errors: {
					database: [error.detail || "Duplicate record"],
				},
			};
		case "23503":
			return {
				status: 400,
				message: "A referenced record was not found.",
				errors: {
					database: [error.detail || "Invalid reference"],
				},
			};
		case "23502":
			return {
				status: 400,
				message: "A required value is missing.",
				errors: {
					database: [
						error.column
							? `${error.column} is required`
							: error.detail || "Missing required value",
					],
				},
			};
		case "22P02":
			return {
				status: 400,
				message: "Invalid input format.",
				errors: {
					database: [error.detail || "Invalid value format"],
				},
			};
		case "23514":
			return {
				status: 400,
				message: "One or more values are outside allowed range.",
				errors: {
					database: [error.detail || "Constraint violation"],
				},
			};
		default:
			return null;
	}
};

const resolveTeamTables = async (client) => {
	const candidates = {
		teams: ["teams", "event_teams"],
		teamMembers: ["team_members", "team_memebers", "event_team_members"],
	};

	const result = await client.query(
		`
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = 'public'
			AND table_name = ANY($1::text[])
		`,
		[
			[
				...candidates.teams,
				...candidates.teamMembers,
			],
		],
	);

	const existing = new Set(result.rows.map((row) => row.table_name));

	const pickFirstExisting = (list) =>
		list.find((name) => existing.has(name)) || null;

	return {
		teamsTable: pickFirstExisting(candidates.teams),
		teamMembersTable: pickFirstExisting(candidates.teamMembers),
	};
};

const pickRegistrationOptionalValues = async (client, payload) => {
	const optionalPayload = payload || {};
	const columnsResult = await client.query(
		`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'event_registrations'
		`,
	);

	const availableColumns = new Set(
		columnsResult.rows.map((row) => row.column_name),
	);
	const optionalColumns = [];
	const optionalValues = [];
	let placeholderIndexOffset = 0;

	const maybePush = (columnName, value, cast = "") => {
		if (!availableColumns.has(columnName)) return;
		optionalColumns.push(columnName);
		optionalValues.push(value);
		placeholderIndexOffset += 1;
		return `$${placeholderIndexOffset}${cast}`;
	};

	const placeholders = [];

	if (availableColumns.has("team_name")) {
		placeholders.push(
			maybePush("team_name", optionalPayload.teamName || null),
		);
	}

	if (availableColumns.has("leader_name")) {
		placeholders.push(
			maybePush("leader_name", optionalPayload.leaderName || null),
		);
	}

	if (availableColumns.has("leader_email")) {
		placeholders.push(
			maybePush("leader_email", optionalPayload.leaderEmail || null),
		);
	}

	if (availableColumns.has("leader_phone")) {
		placeholders.push(
			maybePush("leader_phone", optionalPayload.leaderPhone || null),
		);
	}

	if (availableColumns.has("leader_year")) {
		placeholders.push(
			maybePush("leader_year", optionalPayload.leaderYear || null),
		);
	}

	if (availableColumns.has("leader_roll_number")) {
		placeholders.push(
			maybePush(
				"leader_roll_number",
				optionalPayload.leaderRollNumber || null,
			),
		);
	}

	if (availableColumns.has("team_members")) {
		placeholders.push(
			maybePush(
				"team_members",
				JSON.stringify(optionalPayload.members || []),
				"::jsonb",
			),
		);
	}

	if (availableColumns.has("team_data")) {
		placeholders.push(
			maybePush("team_data", JSON.stringify(optionalPayload), "::jsonb"),
		);
	}

	if (availableColumns.has("registration_payload")) {
		placeholders.push(
			maybePush(
				"registration_payload",
				JSON.stringify(optionalPayload),
				"::jsonb",
			),
		);
	}

	return {
		optionalColumns,
		optionalValues,
	};
};

const buildOptionalUpdateAssignments = async (client, payload, startIndex) => {
	const optionalPayload = payload || {};
	const columnsResult = await client.query(
		`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'event_registrations'
		`,
	);

	const availableColumns = new Set(
		columnsResult.rows.map((row) => row.column_name),
	);
	const assignments = [];
	const values = [];
	let index = startIndex;

	const maybeAssign = (columnName, value, cast = "") => {
		if (!availableColumns.has(columnName)) return;
		index += 1;
		assignments.push(`${columnName} = $${index}${cast}`);
		values.push(value);
	};

	maybeAssign("team_name", optionalPayload.teamName || null);
	maybeAssign("leader_name", optionalPayload.leaderName || null);
	maybeAssign("leader_email", optionalPayload.leaderEmail || null);
	maybeAssign("leader_phone", optionalPayload.leaderPhone || null);
	maybeAssign("leader_year", optionalPayload.leaderYear || null);
	maybeAssign(
		"leader_roll_number",
		optionalPayload.leaderRollNumber || null,
	);
	maybeAssign(
		"team_members",
		JSON.stringify(optionalPayload.members || []),
		"::jsonb",
	);
	maybeAssign("team_data", JSON.stringify(optionalPayload), "::jsonb");
	maybeAssign(
		"registration_payload",
		JSON.stringify(optionalPayload),
		"::jsonb",
	);

	return { assignments, values };
};

module.exports = {
    mapDatabaseError,
    resolveTeamTables,
    pickRegistrationOptionalValues,
    buildOptionalUpdateAssignments
}