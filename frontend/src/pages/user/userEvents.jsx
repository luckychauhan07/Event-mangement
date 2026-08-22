import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    CalendarDays,
    Clock3,
    Plus,
    Info,
    MapPin,
    Search,
    Sparkles,
    Users,
    LogOut,
    X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { getAllEvents } from "../../services/eventServices";
import {
	formatDateTime,
	getCategoryKey,
	getCategoryTone,
	getEventPhase,
	getRegistrationLabel,
	isRegisteredByUser,
	isWithdrawalAllowed,
	matchesEventSearch,
} from "../../utils/userEventUtils";

const filterTabs = [
	{ label: "All Events", value: "all" },
	{ label: "Tech", value: "tech" },
	{ label: "Cultural", value: "cultural" },
	{ label: "Food", value: "food" },
	{ label: "Sports", value: "sports" },
	{ label: "Workshops", value: "workshop" },
];

const UserEvents = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	// Default to showing upcoming events only
	const [timeFilter, setTimeFilter] = useState("upcoming");
	const [registeringEventId, setRegisteringEventId] = useState(null);
	const [teamModalEvent, setTeamModalEvent] = useState(null);
	const [teamForm, setTeamForm] = useState({
		teamName: "",
		leaderName: "",
		leaderEmail: "",
		leaderPhone: "",
		leaderYear: "",
		leaderRollNumber: "",
		memberName: "",
		memberEmail: "",
		memberRollNumber: "",
		members: [],
	});
	const [teamFormError, setTeamFormError] = useState("");

	const loadEvents = async () => {
		setLoading(true);
		setError("");

		try {
			const data = await getAllEvents();
			setEvents(data?.events || []);
		} catch (err) {
			setEvents([]);
			setError(
				err?.response?.data?.message ||
					"Unable to fetch user events right now.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvents();
	}, []);

	const visibleEvents = useMemo(
		() => events.filter((event) => event.status !== "cancelled"),
		[events],
	);

	const filteredEvents = useMemo(() => {
		return visibleEvents
			.filter((event) => matchesEventSearch(event, searchTerm))
			.filter((event) => {
				if (categoryFilter === "all") return true;
				return getCategoryKey(event.category) === categoryFilter;
			})
			.filter((event) => {
				if (timeFilter === "all") return true;
				if (timeFilter === "upcoming") {
					// Treat "upcoming" as events starting in the future OR currently ongoing
					const phase = getEventPhase(event);
					return phase === "upcoming" || phase === "ongoing";
				}
				if (timeFilter === "past") {
    return (
        getEventPhase(event) === "completed" &&
        event.user_registration_status === "approved"
    );
}
				return true;
			})
			.sort(
				(a, b) =>
					new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
			);
	}, [visibleEvents, searchTerm, categoryFilter, timeFilter]);

	const availableEvents = useMemo(
		() =>
			filteredEvents.filter((event) => {
				const phase = getEventPhase(event);
				return phase === "upcoming" || phase === "ongoing";
			}),
		[filteredEvents],
	);

	const completedEvents = useMemo(
    () =>
        filteredEvents.filter(
            (event) =>
                getEventPhase(event) === "completed" &&
                event.user_registration_status === "approved",
        ),
    [filteredEvents],
);

	const stats = useMemo(
		() => ({
			total: visibleEvents.length, // Total published events
			upcoming: visibleEvents.filter( // Events in upcoming phase
				(event) => getEventPhase(event) === "upcoming",
			).length,
			registered: visibleEvents.filter((event) =>
				isRegisteredByUser(event),
			).length,
		}),
		[visibleEvents],
	);

	const handleRegister = async (eventId) => {
		try {
			setRegisteringEventId(eventId);
			const response = await api.post(
				`/api/user/events/${eventId}/register`,
			);
			toast.success(response?.data?.message || "Registration successful");
			await loadEvents();
		} catch (err) {
			toast.error(
				err?.response?.data?.message || "Registration failed",
			);
		} finally {
			setRegisteringEventId(null);
		}
	};

	const handleWithdraw = async (eventId) => {
		// Show confirmation dialog
		const confirmed = window.confirm(
			"Are you sure you want to withdraw from this event? This action cannot be undone.",
		);

		if (!confirmed) {
			return;
		}

		try {
			setRegisteringEventId(eventId);
			const response = await api.post(
				`/api/user/events/${eventId}/withdraw`,
			);
			toast.success(response?.data?.message || "Withdrawn successfully");
			await loadEvents();
		} catch (err) {
			toast.error(
				err?.response?.data?.message || "Withdrawal failed",
			);
		} finally {
			setRegisteringEventId(null);
		}
	};

	const resetTeamForm = (event) => {
		setTeamForm({
			teamName: "",
			leaderName: "",
			leaderEmail: "",
			leaderPhone: "",
			leaderYear: "",
			leaderRollNumber: "",
			memberName: "",
			memberEmail: "",
			memberRollNumber: "",
			members: [],
		});
		setTeamFormError("");
		setTeamModalEvent(event);
	};

	const updateTeamForm = (field, value) => {
		setTeamForm((current) => ({
			...current,
			[field]: value,
		}));
	};

	const addTeamMember = () => {
		const memberName = teamForm.memberName.trim();
		const memberEmail = teamForm.memberEmail.trim().toLowerCase();
		const memberRollNumber = teamForm.memberRollNumber.trim().toLowerCase();
		const maxTeamSize = Number(teamModalEvent?.max_team_size) || 1;
		const totalCountIfAdded = 1 + teamForm.members.length + 1;
		const leaderEmail = teamForm.leaderEmail.trim().toLowerCase();

		if (!memberName || !memberEmail || !memberRollNumber) {
			setTeamFormError("Fill all member details before adding.");
			return;
		}

		if (leaderEmail && memberEmail === leaderEmail) {
			setTeamFormError("Team leader cannot be added as a team member.");
			return;
		}

		if (totalCountIfAdded > maxTeamSize) {
			setTeamFormError(`You can add up to ${maxTeamSize} total team members.`);
			return;
		}

		const isDuplicate = teamForm.members.some(
			(member) =>
				member.email?.toLowerCase?.() === memberEmail ||
				member.rollNumber?.toLowerCase?.() === memberRollNumber,
		);

		if (isDuplicate) {
			setTeamFormError("This team member is already added.");
			return;
		}

		setTeamForm((current) => ({
			...current,
			members: [
				...current.members,
				{
					name: memberName,
					email: memberEmail,
					rollNumber: memberRollNumber,
				},
			],
			memberName: "",
			memberEmail: "",
			memberRollNumber: "",
		}));
		setTeamFormError("");
	};

	const removeTeamMember = (rollNumber) => {
		setTeamForm((current) => ({
			...current,
			members: current.members.filter(
				(member) => member.rollNumber !== rollNumber,
			),
		}));
	};

	const submitTeamRegistration = async () => {
		if (!teamModalEvent) return;

		const minTeamSize = Number(teamModalEvent.min_team_size) || 1;
		const maxTeamSize = Number(teamModalEvent.max_team_size) || minTeamSize;
		const totalCount = 1 + teamForm.members.length;
		const requiredAdditionalMembers = Math.max(0, minTeamSize - 1);

		if (
			!teamForm.teamName.trim() ||
			!teamForm.leaderName.trim() ||
			!teamForm.leaderEmail.trim()
		) {
			setTeamFormError("Team name and leader details are required.");
			return;
		}

		if (totalCount < minTeamSize) {
			setTeamFormError(
				`Add at least ${requiredAdditionalMembers} team member(s) (excluding leader).`,
			);
			return;
		}

		if (totalCount > maxTeamSize) {
			setTeamFormError(
				`A maximum of ${maxTeamSize} total team members is allowed.`,
			);
			return;
		}

		try {
			setRegisteringEventId(teamModalEvent.id);
			const response = await api.post(
				`/api/user/events/${teamModalEvent.id}/register`,
				{
					teamRegistration: {
						teamName: teamForm.teamName.trim(),
						members: teamForm.members.map((member) => ({
							email: member.email,
						})),
					},
				},
			);
			toast.success(
				response?.data?.message || "Team registration submitted successfully",
			);
			setTeamModalEvent(null);
			await loadEvents();
		} catch (err) {
			const errorMessage =
				err?.response?.data?.message || "Team registration failed";
			const errorDetails = err?.response?.data?.errors?.members;

			let displayError = errorMessage;
			if (Array.isArray(errorDetails) && errorDetails.length > 0) {
				// If specific member errors are returned, format them.
				const memberErrors = errorDetails
					.map((e) => `${e.email}: ${e.reason}`)
					.join("\n");
				displayError = `${errorMessage}\n${memberErrors}`;
				// Also display in the form
				setTeamFormError(memberErrors);
			} else {
				setTeamFormError(errorMessage);
			}
			toast.error(displayError);
		} finally {
			setRegisteringEventId(null);
		}
	};

	// Helper to render registration status pill on event cards
	const renderStatusPill = (event) => {
		const registrationStatus = event.user_registration_status;
		if (!registrationStatus || registrationStatus === "cancelled") return null;

		const statusLabel = getRegistrationLabel(event);
		let pillClass = "border-slate-200 bg-slate-100 text-slate-600";
		let icon = <Clock3 size={12} />; // Default icon

		if (registrationStatus === "pending") {
			pillClass = "border-amber-200 bg-amber-50 text-amber-700";
			icon = <Clock3 size={12} />;
		} else if (registrationStatus === "approved") {
			pillClass = "border-emerald-200 bg-emerald-50 text-emerald-700";
			icon = <CheckCircle2 size={12} />;
		}

		return (
			<span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${pillClass}`}>
				{icon}
				{statusLabel}
			</span>
		);
	};

	const renderEventCard = (event) => {
		const phase = getEventPhase(event);
		const isRegistered = isRegisteredByUser(event);
		const isRegistering = registeringEventId === event.id;

		const now = new Date();
		const regStart = event.registration_start ? new Date(event.registration_start) : null;
		const regEnd = event.registration_end ? new Date(event.registration_end) : null;

		let regState = { canRegister: false, message: "Register" };
		if (isRegistered) {
			regState = { canRegister: false, message: getRegistrationLabel(event) };
		} else if (phase === 'completed') {
			regState = { canRegister: false, message: "Event Completed" };
		} else if (phase === 'ongoing') {
			regState = { canRegister: false, message: "Registration Closed" };
		} else if (!event.allow_registration) {
			regState = { canRegister: false, message: "Registration Closed" };
		} else if (regStart && now < regStart) {
			regState = { canRegister: false, message: "Registration Not Started" };
		} else if (regEnd && now > regEnd) {
			regState = { canRegister: false, message: "Registration Closed" };
		} else if (phase === 'upcoming') {
			regState = { canRegister: true, message: "Register" };
		}

		const categoryTone = getCategoryTone(event.category);
		const isTeamEvent = event.participation_type === "team";
		const registrationType =
			event.registration_type === "approval-based"
				? "Approval Required"
				: "Auto-Approved";

		return (
			<div
				key={event.id}
				className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			>
				<div className={`h-2 bg-gradient-to-r ${categoryTone}`} />

				<div className="space-y-5 p-6">
					<div className="flex flex-col gap-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex flex-wrap items-center gap-2">
								<span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
									{event.category || "General"}
								</span>
								<span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
									{registrationType}
								</span>
								{isRegistered && renderStatusPill(event)}
							</div>
							<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
								{phase === "completed" ? "Completed" : phase === "ongoing" ? "Ongoing" : "Upcoming"}
							</span>
						</div>

						<div>
							<h2 className="text-xl font-semibold tracking-tight text-slate-900">
								{event.title}
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{event.description || "No description available."}
							</p>
						</div>

						<span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
							{phase === "completed" ? "Completed" : phase === "ongoing" ? "Ongoing" : "Upcoming"}
						</span>
					</div>

					<div className="grid gap-3 md:grid-cols-3">
						<div className="rounded-2xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<CalendarDays size={15} />
								<p className="text-[11px] font-semibold uppercase tracking-wide">
									Date
								</p>
							</div>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{formatDateTime(event.start_at)}
							</p>
						</div>

						<div className="rounded-2xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<MapPin size={15} />
								<p className="text-[11px] font-semibold uppercase tracking-wide">
									Venue
								</p>
							</div>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{event.venue || "Not specified"}
							</p>
						</div>

						<div className="rounded-2xl bg-slate-50 p-4">
							<div className="flex items-center gap-2 text-slate-400">
								<Users size={15} />
								<p className="text-[11px] font-semibold uppercase tracking-wide">
									Participation
								</p>
							</div>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{event.participation_type || "Individual"}
							</p>
						</div>
					</div>

					<div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-600">
						<div className="flex items-start gap-2">
							<Info size={16} className="mt-0.5 text-blue-600" />
							<p>
								Open full details to check team participation,
								coordinator information, registration rules, and the
								complete event schedule before joining.
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-3">
						<Link
							to={`/user/events/${event.id}`}
							className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
						>
							Full Details
							<ArrowRight size={15} />
						</Link>

						{isRegistered && isWithdrawalAllowed(event) ? ( // Show withdraw button only if registered and withdrawal allowed
							// Removed withdrawal button from Events page as per request
							<span className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed">
								{renderStatusPill(event)}
							</span>
						) : (
							<button
								type="button"
								onClick={() =>
									isTeamEvent && regState.canRegister
										? resetTeamForm(event)
										: handleRegister(event.id) // This is the primary action button
								}
								disabled={!regState.canRegister || isRegistering}
								className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
									regState.canRegister
										? "bg-blue-600 text-white hover:bg-blue-700" // Blue/indigo theme for active register button
										: "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
								}`}
							>
								{isRegistering
									? "Registering..."
									: isTeamEvent && regState.canRegister
										? "Register Team"
										: regState.message}
							</button>
						)}
					</div>
				</div>
			</div>
		);
	};

	// Ensure renderStatusPill returns just the span, not wrapped in another element if used directly
	// The current implementation of renderStatusPill is fine for direct use.

	return (
		<div className="space-y-6">
			<section className="rounded-[2rem] border border-blue-200 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 px-6 py-8 text-white shadow-lg">
				<div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
							<Sparkles size={14} />
							Browse Events
						</div>
						<h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
							Discover events built for students
						</h1>
						<p className="mt-3 text-sm leading-6 text-blue-50">
							Explore upcoming opportunities, review event details,
							and register directly from the user module.
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
						<div className="rounded-2xl bg-white/95 p-4 text-slate-900">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Available Events
							</p>
							<p className="mt-3 text-3xl font-bold">{stats.total}</p>
						</div>
						<div className="rounded-2xl bg-white/95 p-4 text-slate-900">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Upcoming
							</p>
							<p className="mt-3 text-3xl font-bold">{stats.upcoming}</p>
						</div>
						<div className="rounded-2xl bg-white/95 p-4 text-slate-900">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Registered
							</p>
							<p className="mt-3 text-3xl font-bold">
								{stats.registered}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
						<Search size={16} className="text-slate-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search by title, description, category, or venue"
							className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{filterTabs.map((tab) => (
							<button
								key={tab.value}
								type="button"
								onClick={() => setCategoryFilter(tab.value)}
								className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
									categoryFilter === tab.value
										? "bg-blue-600 text-white"
										: "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
								}`}
							>
								{tab.label}
							</button>
						))}

						<select
							value={timeFilter}
							onChange={(event) => setTimeFilter(event.target.value)}
							className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
						>
							<option value="all">All Statuses</option>
							<option value="upcoming">Upcoming Only</option>
							<option value="past">Completed By You</option>
						</select>
					</div>
				</div>
			</section>

			<div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
				{loading ? (
					<p className="text-sm font-medium text-slate-500">
						Loading events...
					</p>
				) : error ? (
					<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
						{error}
					</div>
				) : availableEvents.length === 0 && completedEvents.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
						<h2 className="text-lg font-semibold text-slate-800">
							No events found
						</h2>
						<p className="mt-2 text-sm text-slate-500">
							Try changing the search or category filters.
						</p>
					</div>
				) : (
					<div className="space-y-10">
						{timeFilter !== "past" ? (
							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-xl font-semibold text-slate-900">
											Available Events
										</h2>
										<p className="text-sm text-slate-500">
											Upcoming and ongoing events open for students
										</p>
									</div>
									<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
										{availableEvents.length} event
										{availableEvents.length === 1 ? "" : "s"}
									</span>
								</div>

								{availableEvents.length === 0 ? (
									<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
										No available events match the current filters.
									</div>
								) : (
									<div className="grid gap-5 xl:grid-cols-2">
										{availableEvents.map(renderEventCard)}
									</div>
								)}
							</section>
						) : null}

						{timeFilter !== "upcoming" ? (
							<section className="space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-xl font-semibold text-slate-900">
											Completed Events By You
										</h2>
										<p className="text-sm text-slate-500">
											Previously completed events with approved registration
										</p>
									</div>
									<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
										{completedEvents.length} event
										{completedEvents.length === 1 ? "" : "s"}
									</span>
								</div>

								{completedEvents.length === 0 ? (
									<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
										You do not have any completed events yet.
									</div>
								) : (
									<div className="grid gap-5 xl:grid-cols-2">
										{completedEvents.map(renderEventCard)}
									</div>
								)}
							</section>
						) : null}
					</div>
				)}
			</div>

			{teamModalEvent ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
					<div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
									Team Registration
								</p>
								<h2 className="mt-2 text-2xl font-semibold text-slate-900">
									{teamModalEvent.title}
								</h2>
								<p className="mt-2 text-sm text-slate-600">
									Add the team name, leader details, and member list
									before submitting the team registration.
								</p>
							</div>

							<button
								type="button"
								onClick={() => setTeamModalEvent(null)}
								className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Event
								</p>
								<p className="mt-2 text-sm font-medium text-slate-800">
									{teamModalEvent.title}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Team Size
								</p>
								<p className="mt-2 text-sm font-medium text-slate-800">
									{teamModalEvent.min_team_size || 1} to{" "}
									{teamModalEvent.max_team_size || "N"} members
								</p>
							</div>
						</div>

						<div className="mt-6 space-y-6">
							<div>
								<label className="text-sm font-semibold text-slate-700">
									Team Name
								</label>
								<input
									type="text"
									value={teamForm.teamName}
									onChange={(event) =>
										updateTeamForm("teamName", event.target.value)
									}
									placeholder="Enter your team name"
									className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
								/>
							</div>

							<div>
								<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
									Team Leader
								</h3>
								<div className="mt-3 grid gap-3 md:grid-cols-2">
									<input
										type="text"
										value={teamForm.leaderName}
										onChange={(event) =>
											updateTeamForm("leaderName", event.target.value)
										}
										placeholder="Leader name"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="email"
										value={teamForm.leaderEmail}
										onChange={(event) =>
											updateTeamForm("leaderEmail", event.target.value)
										}
										placeholder="Leader email"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="text"
										value={teamForm.leaderPhone}
										onChange={(event) =>
											updateTeamForm("leaderPhone", event.target.value)
										}
										placeholder="Leader phone"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="text"
										value={teamForm.leaderYear}
										onChange={(event) =>
											updateTeamForm("leaderYear", event.target.value)
										}
										placeholder="Leader year"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="text"
										value={teamForm.leaderRollNumber}
										onChange={(event) =>
											updateTeamForm(
												"leaderRollNumber",
												event.target.value,
											)
										}
										placeholder="Leader roll number"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 md:col-span-2"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between gap-3">
									<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
										Team Members
									</h3>
									<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
										{1 + teamForm.members.length} member
										{1 + teamForm.members.length === 1 ? "" : "s"}
									</span>
								</div>

								<div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
									<input
										type="text"
										value={teamForm.memberName}
										onChange={(event) =>
											updateTeamForm("memberName", event.target.value)
										}
										placeholder="Member name"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="email"
										value={teamForm.memberEmail}
										onChange={(event) =>
											updateTeamForm("memberEmail", event.target.value)
										}
										placeholder="Member email"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<input
										type="text"
										value={teamForm.memberRollNumber}
										onChange={(event) =>
											updateTeamForm(
												"memberRollNumber",
												event.target.value,
											)
										}
										placeholder="Roll number"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300"
									/>
									<button
										type="button"
										onClick={addTeamMember}
										className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
									>
										<Plus size={16} />
										Add
									</button>
								</div>

								<div className="mt-4 space-y-3">
									{teamForm.members.length === 0 ? (
										<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
											No additional members added yet.
										</div>
									) : (
										teamForm.members.map((member) => (
											<div
												key={member.rollNumber}
												className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
											>
												<div>
													<p className="text-sm font-semibold text-slate-800">
														{member.name}
													</p>
													<p className="text-xs text-slate-500">
														{member.email} · {member.rollNumber}
													</p>
												</div>
												<button
													type="button"
													onClick={() =>
														removeTeamMember(member.rollNumber)
													}
													className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
												>
													Remove
												</button>
											</div>
										))
									)}
								</div>
							</div>
						</div>

						{teamFormError ? (
							<div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
								<pre className="whitespace-pre-wrap font-sans">
									{teamFormError}
								</pre>
							</div>
						) : null}

						<div className="mt-6 flex flex-wrap justify-end gap-3">
							<button
								type="button"
								onClick={() => setTeamModalEvent(null)}
								className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={submitTeamRegistration}
								disabled={registeringEventId === teamModalEvent.id}
								className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
							>
								{registeringEventId === teamModalEvent.id ? (
									"Submitting..."
								) : (
									<>
										<Check size={16} />
										Submit Team
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default UserEvents;
			