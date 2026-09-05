import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
	ArrowLeft,
	BadgeCheck,
	CalendarDays,
	Clock3,
	LogOut,
	FileText,
	MapPin,
	ShieldCheck,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { getUserEventById } from "../../services/eventServices";
import api from "../../services/api"; // Assuming you have a configured axios instance
import EventResultsPanel from "../../components/event/eventResultsPanel";
import {
	formatDateTime,
	getCategoryTone,
	getEventPhase,
	getRegistrationLabel,
	isApprovedRegistration,
	isRegisteredByUser,
	isWithdrawalAllowed,
} from "../../utils/userEventUtils";

const UserEventDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [eventDetails, setEventDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [withdrawing, setWithdrawing] = useState(false);

	const loadEvent = async () => {
		setLoading(true);
		setError("");

		try {
			const detailsResponse = await getUserEventById(id);
			setEventDetails(detailsResponse?.event || null);
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					"Unable to fetch the selected event details.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadEvent();
	}, [id]);

	const basic = eventDetails?.basic || {};
	const schedule = eventDetails?.schedule || {};
	const registration = eventDetails?.registration?.config || {};
	const team = eventDetails?.team || {};
	const coordinators = eventDetails?.coordinators || [];
	const formFields = eventDetails?.formFields || [];
	const primaryCoordinator = coordinators[0] || null;
	const teamSummary = team.enabled
		? `${team.min || 1} to ${team.max || "N"} members`
		: "Individual only";
	const registrationWindow = registration.start
		? `${formatDateTime(registration.start)} to ${formatDateTime(
				registration.end,
			)}`
		: "Not specified";

	const registrationState = useMemo(() => {
		if (!eventDetails) {
			return { canRegister: false, message: "Loading..." };
		}

		if (isRegisteredByUser(eventDetails)) {
			return {
				canRegister: false,
				message: getRegistrationLabel(eventDetails),
			};
		}

		const now = new Date();
		const registrationStart = registration.start
			? new Date(registration.start)
			: null;
		const registrationEnd = registration.end
			? new Date(registration.end)
			: null;

		if (!registration.required) {
			return {
				canRegister: false,
				message: "Registration is not enabled for this event.",
			};
		}

		const eventPhase = getEventPhase(eventDetails);
		if (eventPhase === "ongoing" || eventPhase === "completed") {
			return {
				canRegister: false,
				message: "Registration is closed because the event is ongoing.",
			};
		}

		if (registrationStart && now < registrationStart) {
			return {
				canRegister: false,
				message: "Registration has not started yet.",
			};
		}

		if (registrationEnd && now > registrationEnd) {
			return { canRegister: false, message: "Registration Closed" };
		}

		return { canRegister: true, message: "Register for this event" };
	}, [eventDetails, registration]);

	const handleWithdraw = async () => {
		const confirmed = window.confirm(
			"Are you sure you want to withdraw from this event?",
		);
		if (!confirmed) return;

		try {
			setWithdrawing(true);
			const response = await api.post(`/api/user/events/${id}/withdraw`);
			toast.success(response?.data?.message || "Withdrawn successfully");
			await loadEvent();
		} catch (err) {
			toast.error(err?.response?.data?.message || "Withdrawal failed");
		} finally {
			setWithdrawing(false);
		}
	};

	if (loading) {
		return (
			<div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
				Loading event details...
			</div>
		);
	}

	if (error || !eventDetails) {
		return (
			<div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
				{error || "Event details are not available."}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
				<div
					className={`bg-linear-to-r ${getCategoryTone(
						basic.category,
					)} px-6 py-8 text-white`}
				>
					<Link
						to="/user/events"
						className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
					>
						<ArrowLeft size={15} />
						Back to Events
					</Link>

					<div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-3xl">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
								Event Details
							</p>
							<h1 className="mt-3 text-3xl font-semibold tracking-tight">
								{basic.title}
							</h1>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
								{basic.description ||
									"No description provided."}
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
								{basic.category || "General"}
							</span>
							<span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
								{schedule.mode || "Mode not specified"}
							</span>
						</div>
					</div>
				</div>

				<div className="grid gap-4 p-6 md:grid-cols-3">
					<div className="rounded-3xl bg-slate-50 p-5">
						<div className="flex items-center gap-2 text-slate-400">
							<CalendarDays size={16} />
							<p className="text-xs font-semibold uppercase tracking-wide">
								Start
							</p>
						</div>
						<p className="mt-3 text-sm font-medium text-slate-800">
							{formatDateTime(schedule.startAt)}
						</p>
					</div>

					<div className="rounded-3xl bg-slate-50 p-5">
						<div className="flex items-center gap-2 text-slate-400">
							<Clock3 size={16} />
							<p className="text-xs font-semibold uppercase tracking-wide">
								End
							</p>
						</div>
						<p className="mt-3 text-sm font-medium text-slate-800">
							{formatDateTime(schedule.endAt)}
						</p>
					</div>

					<div className="rounded-3xl bg-slate-50 p-5">
						<div className="flex items-center gap-2 text-slate-400">
							{schedule.mode === "online" ? (
								<FileText size={16} />
							) : (
								<MapPin size={16} />
							)}
							<p className="text-xs font-semibold uppercase tracking-wide">
								{schedule.mode === "online"
									? "Online Link"
									: "Venue"}
							</p>
						</div>
						{schedule.mode === "online" ? (
							<a
								href={schedule.onlineLink}
								target="_blank"
								rel="noreferrer"
								className="mt-3 block break-all text-sm font-medium text-blue-600 hover:underline"
							>
								{schedule.onlineLink || "Not available"}
							</a>
						) : (
							<p className="mt-3 text-sm font-medium text-slate-800">
								{schedule.venue || "Not specified"}
							</p>
						)}
					</div>
				</div>
			</section>

			<section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
				<div className="space-y-6">
					<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">
							What You Should Know
						</h2>
						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Team Requirement
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{teamSummary}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Coordinator
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{primaryCoordinator?.name || "Not assigned"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Start and End
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{formatDateTime(schedule.startAt)}
								</p>
								<p className="mt-1 text-sm text-slate-500">
									to {formatDateTime(schedule.endAt)}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Registration Window
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{registrationWindow}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">
							Event Overview
						</h2>
						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Subtitle
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{basic.subtitle || "Not specified"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Event Type
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{basic.eventType || "Not specified"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Entry Fee
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{basic.entryFee
										? `Rs. ${basic.entryFee}`
										: "Free"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Online Link
								</p>
								<p className="mt-2 break-all text-sm text-slate-700">
									{schedule.onlineLink || "Not available"}
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-slate-900">
							Registration Details
						</h2>
						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Registration Type
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{registration.type || "Not specified"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Registration Window
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{registration.start
										? `${formatDateTime(
												registration.start,
											)} to ${formatDateTime(registration.end)}`
										: "Not specified"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Participation Type
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{registration.participationType ||
										"Individual"}
								</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Participant Limit
								</p>
								<p className="mt-2 text-sm text-slate-700">
									{registration.limit || "Not specified"}
								</p>
							</div>
						</div>

						{formFields.length > 0 ? (
							<div className="mt-6 rounded-2xl border border-slate-200 p-4">
								<div className="flex items-center gap-2">
									<FileText
										size={16}
										className="text-slate-400"
									/>
									<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
										Registration Form Fields
									</h3>
								</div>
								<div className="mt-4 flex flex-wrap gap-2">
									{formFields.map((field) => (
										<span
											key={field.id}
											className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
										>
											{field.label}
										</span>
									))}
								</div>
							</div>
						) : null}
					</div>
				</div>

				<div className="space-y-6">
					<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							Join This Event
						</h2>

						<div className="mt-4 space-y-3 text-sm text-slate-600">
							<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
								<BadgeCheck
									size={18}
									className="mt-0.5 text-blue-600"
								/>
								<p>{getRegistrationLabel(eventDetails)}</p>
							</div>
							<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
								<Users
									size={18}
									className="mt-0.5 text-blue-600"
								/>
								<p>
									{team.enabled
										? `Teams enabled · ${team.min || 1} to ${
												team.max || "N"
											} members`
										: "Individual participation only"}
								</p>
							</div>
							<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
								<ShieldCheck
									size={18}
									className="mt-0.5 text-blue-600"
								/>
								<p>
									{registration.type === "approval-based"
										? "Registration requires teacher approval."
										: "Registration is auto approved for eligible students."}
								</p>
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-3">
							{!registration.required &&
							!isRegisteredByUser(
								eventDetails,
							) ? null : isWithdrawalAllowed(eventDetails) ? (
								<button
									type="button"
									onClick={handleWithdraw}
									disabled={withdrawing}
									className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{withdrawing ? (
										"Withdrawing..."
									) : (
										<>
											<LogOut size={16} />
											Withdraw Registration
										</>
									)}
								</button>
							) : (
								<button
									type="button"
									onClick={() =>
										navigate(`/user/events/${id}/register`)
									}
									disabled={!registrationState.canRegister}
									className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
										registrationState.canRegister
											? "bg-slate-900 text-white hover:bg-slate-800"
											: "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-500"
									}`}
								>
									{registrationState.message}
								</button>
							)}
						</div>
					</div>

					<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							Coordinator Details
						</h2>
						<div className="mt-4 space-y-4">
							{coordinators.length === 0 ? (
								<p className="text-sm text-slate-500">
									Coordinator information is not available
									yet.
								</p>
							) : (
								coordinators.map((coordinator) => (
									<div
										key={coordinator.userId}
										className="rounded-2xl bg-slate-50 p-4"
									>
										<p className="text-sm font-semibold text-slate-900">
											{coordinator.name}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{coordinator.email ||
												"Email not available"}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{coordinator.phone ||
												"Phone not available"}
										</p>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</section>

			{eventDetails.user_registration_status === "approved" && (
				<EventResultsPanel
					eventId={id}
					title="Results for participants"
				/>
			)}
		</div>
	);
};

export default UserEventDetails;
