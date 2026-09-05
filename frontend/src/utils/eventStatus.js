export const isEventExpired = (event) => {
	if (!event?.end_at && !event?.endAt) return false;

	const endValue = event.end_at || event.endAt;
	const endTime = new Date(endValue).getTime();
	if (Number.isNaN(endTime)) return false;

	return endTime < Date.now();
};

export const getEventTimelinePhase = (event) => {
	if (event?.status === "cancelled") return "cancelled";
	if (event?.status === "rejected") return "rejected";
	if (event?.status === "pending") {
		return "approval-required";
	}

	const now = new Date();
	const startDate = new Date(event?.start_at || event?.startAt || "");
	const endDate = new Date(event?.end_at || event?.endAt || "");

	if (Number.isNaN(startDate.getTime())) return "unknown";
	if (now < startDate) return "upcoming";
	if (!Number.isNaN(endDate.getTime()) && now <= endDate) return "ongoing";
	if (!Number.isNaN(endDate.getTime()) && now > endDate) return "past";
};

export const getEventStatusMeta = (event) => {
	const phase = getEventTimelinePhase(event);

	switch (phase) {
		case "cancelled":
			return {
				label: "Cancelled",
				badgeClass: "bg-red-100 text-red-700 border border-red-200",
				borderClass: "border-red-200/80",
				dotClass: "bg-red-500",
			};
		case "rejected":
			return {
				label: "Rejected",
				badgeClass: "bg-rose-100 text-rose-700 border border-rose-200",
				borderClass: "border-rose-200/80",
				dotClass: "bg-rose-500",
			};
		case "approval-required":
			return {
				label: "Approval Required",
				badgeClass:
					"bg-amber-100 text-amber-700 border border-amber-200",
				borderClass: "border-amber-200/80",
				dotClass: "bg-amber-500",
			};
		case "upcoming":
			return {
				label: "Upcoming",
				badgeClass:
					"bg-emerald-100 text-emerald-700 border border-emerald-200",
				borderClass: "border-emerald-200/80",
				dotClass: "bg-emerald-500",
			};
		case "ongoing":
			return {
				label: "Ongoing",
				badgeClass: "bg-blue-100 text-blue-700 border border-blue-200",
				borderClass: "border-blue-200/70",
				dotClass: "bg-blue-500",
			};
		case "past":
			return {
				label: "Past",
				badgeClass:
					"bg-slate-100 text-slate-700 border border-slate-200",
				borderClass: "border-slate-200",
				dotClass: "bg-slate-500",
			};
		default:
			return {
				label: "Unknown",
				badgeClass:
					"bg-slate-100 text-slate-700 border border-slate-200",
				borderClass: "border-slate-200",
				dotClass: "bg-slate-500",
			};
	}
};
