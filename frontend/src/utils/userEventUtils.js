export const getCurrentUserProfile = () => {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const storedUser = localStorage.getItem("user");
		return storedUser ? JSON.parse(storedUser) : null;
	} catch (error) {
		console.error("Failed to read user from localStorage:", error);
		return null;
	}
};

export const getEventStartDate = (event) =>
	new Date(event?.start_at || event?.startAt || event?.date || "");

export const getEventEndDate = (event) =>
	new Date(event?.end_at || event?.endAt || event?.date || "");

export const getRegistrationEndDate = (event) =>
	new Date(event?.registration_end || "");

export const getEventPhase = (event) => {
	const now = new Date();
	const startDate = getEventStartDate(event);
	const endDate = getEventEndDate(event);

	if (Number.isNaN(startDate.getTime())) return "Event timing unavailable";
	if (now < startDate) return "upcoming";
	if (!Number.isNaN(endDate.getTime()) && now <= endDate) return "ongoing";
	return "completed";
};

export const isRegisteredByUser = (event) =>
	Boolean(event?.user_registration_id) &&
	event?.user_registration_status !== "cancelled";

export const isApprovedRegistration = (event) =>
	event?.user_registration_status === "approved";

export const isPendingRegistration = (event) =>
	event?.user_registration_status === "pending";

export const isWithdrawalAllowed = (event) => {
	if (!isRegisteredByUser(event)) {
		return false;
	}

	const now = new Date();
	const eventStart = getEventStartDate(event);

	// Withdrawal is allowed if the event hasn't started yet
	return !Number.isNaN(eventStart.getTime()) && now < eventStart;
};

export const getRegistrationLabel = (event) => {
	switch (event?.user_registration_status) {
		case "pending":
			return "Pending Approval";
		case "approved":
			return "Confirmed";
		case "rejected":
			return "Rejected";
		case "cancelled":
			return "Withdrawn";
		case "waitlisted":
			return "Waitlisted";
	}
	return "Register";
};

export const formatDateTime = (value, options = {}) => {
	if (!value) return "Not specified";

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

	return parsedDate.toLocaleString([], {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		...options,
	});
};

export const formatDateOnly = (value) =>
	formatDateTime(value, {
		hour: undefined,
		minute: undefined,
	});

export const getCategoryKey = (value) => {
	const normalizedValue = String(value || "general").toLowerCase();

	if (normalizedValue.includes("tech")) return "tech";
	if (normalizedValue.includes("cultural")) return "cultural";
	if (normalizedValue.includes("food")) return "food";
	if (normalizedValue.includes("sport")) return "sports";
	if (normalizedValue.includes("workshop")) return "workshop";

	return "general";
};

export const getCategoryTone = (value) => {
	switch (getCategoryKey(value)) {
		case "tech":
			return "from-indigo-500 to-violet-600";
		case "cultural":
			return "from-pink-500 to-rose-500";
		case "food":
			return "from-sky-500 to-cyan-500";
		case "sports":
			return "from-emerald-500 to-teal-500";
		case "workshop":
			return "from-amber-400 to-orange-500";
		default:
			return "from-slate-500 to-slate-700";
	}
};

export const matchesEventSearch = (event, searchTerm) => {
	const haystack = [
		event?.title,
		event?.subtitle,
		event?.description,
		event?.category,
		event?.venue,
		event?.organizer_unit,
	]
		.join(" ")
		.toLowerCase();

	return haystack.includes(searchTerm.toLowerCase());
};

export const getUserRegistrations = (events) =>
	events
		.filter(
			(event) =>
				Boolean(event?.user_registration_id) &&
				event?.user_registration_status !== "cancelled",
		)
		.sort(
			(a, b) =>
				getEventStartDate(a).getTime() - getEventStartDate(b).getTime(),
		);

export const getNextUpcomingEvent = (events) =>
	events
		.filter((event) => {
			const phase = getEventPhase(event);
			return (
				(phase === "upcoming" || phase === "ongoing") &&
				event?.status !== "cancelled"
			);
		})
		.sort(
			(a, b) =>
				getEventStartDate(a).getTime() - getEventStartDate(b).getTime(),
		)[0] || null;
