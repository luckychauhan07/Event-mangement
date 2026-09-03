import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { getUserEventById } from "../../services/eventServices";
import api from "../../services/api";
import { formatDateTime, isRegisteredByUser } from "../../utils/userEventUtils";

const UserEventRegistration = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState(null);
	const [formData, setFormData] = useState({});
	const [teamName, setTeamName] = useState("");
	const [memberEmails, setMemberEmails] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadEvent = async () => {
			try {
				const response = await getUserEventById(id);
				setEvent(response?.event || null);
				if (!response?.event) setError("Event not found.");
			} catch (requestError) {
				setError(
					requestError?.response?.data?.message ||
						"Unable to load this event.",
				);
			} finally {
				setLoading(false);
			}
		};
		loadEvent();
	}, [id]);

	if (loading) {
		return (
			<div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
				Loading registration form...
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
				{error || "Event not found."}
			</div>
		);
	}

	const registration = event.registration?.config || {};
	const fields = event.formFields || [];
	const isTeamEvent = event.team?.enabled;
	const registered = isRegisteredByUser(event);
	const registrationRequired =
		registration.required === true ||
		["true", "yes", "1"].includes(
			String(registration.required).toLowerCase(),
		);
	const eventStart = event.schedule?.startAt
		? new Date(event.schedule.startAt)
		: null;
	const registrationStart = registration.start
		? new Date(registration.start)
		: null;
	const registrationEnd = registration.end
		? new Date(registration.end)
		: null;
	const now = new Date();
	const registrationWindowMessage = !registrationRequired
		? "This event does not require registration."
		: !eventStart || Number.isNaN(eventStart.getTime())
			? "The event schedule is unavailable."
			: now >= eventStart
				? "Registration is closed because the event has started."
				: registrationStart && now < registrationStart
					? "Registration has not started yet."
					: registrationEnd && now > registrationEnd
						? "Registration has closed."
						: "";
	const registrationOpen = registrationWindowMessage === "";

	const updateField = (field, value) => {
		setFormData((current) => ({ ...current, [field.id]: value }));
	};

	const handleSubmit = async (submitEvent) => {
		submitEvent.preventDefault();
		if (!registrationOpen || registered || submitting) return;

		const missingField = fields.find((field) => {
			const value = formData[field.id];
			return (
				field.required &&
				(field.type === "checkbox"
					? value !== true
					: !String(value || "").trim())
			);
		});
		if (missingField) {
			toast.error(`${missingField.label} is required`);
			return;
		}

		const emails = memberEmails
			.split(/[,\n]/)
			.map((email) => email.trim())
			.filter(Boolean);
		const minimumMembers = Number(event.team?.min || 1);
		const maximumMembers = Number(event.team?.max || minimumMembers);
		if (isTeamEvent) {
			if (!teamName.trim()) return toast.error("Team name is required");
			if (emails.length + 1 < minimumMembers)
				return toast.error(
					`Add at least ${minimumMembers - 1} team member(s)`,
				);
			if (emails.length + 1 > maximumMembers)
				return toast.error(
					`You can add at most ${maximumMembers - 1} team member(s)`,
				);
		}

		try {
			setSubmitting(true);
			await api.post(`/api/user/events/${id}/register`, {
				formData,
				...(isTeamEvent
					? {
							teamRegistration: {
								teamName: teamName.trim(),
								members: emails.map((email) => ({ email })),
							},
						}
					: {}),
			});
			toast.success("Registration submitted successfully");
			navigate(`/user/events/${id}`);
		} catch (requestError) {
			toast.error(
				requestError?.response?.data?.message || "Registration failed",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<Link
				to={`/user/events/${id}`}
				className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
			>
				<ArrowLeft size={16} /> Back to event details
			</Link>

			<section className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl md:p-8">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
					Event registration
				</p>
				<h1 className="mt-2 text-3xl font-bold">
					{event.basic?.title}
				</h1>
				<p className="mt-2 text-sm text-slate-300">
					Complete the required information before submitting your
					registration.
				</p>
				<div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
					<span>{formatDateTime(event.schedule?.startAt)}</span>
					<span>
						{registration.type === "approval-based"
							? "Approval required"
							: "Auto approved"}
					</span>
				</div>
			</section>

			{registered ? (
				<section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
					<div className="flex items-center gap-3">
						<CheckCircle2 size={20} />
						<p className="font-semibold">
							You are already registered for this event.
						</p>
					</div>
				</section>
			) : !registrationOpen ? (
				<section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
					<p className="font-semibold">{registrationWindowMessage}</p>
					<p className="mt-1 text-sm">
						Check the registration window on the event details page.
					</p>
				</section>
			) : (
				<form
					onSubmit={handleSubmit}
					className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
				>
					{isTeamEvent ? (
						<div className="space-y-4 rounded-2xl bg-slate-50 p-4">
							<div className="flex items-center gap-2">
								<Users size={17} className="text-blue-600" />
								<h2 className="font-semibold text-slate-900">
									Team details
								</h2>
							</div>
							<input
								value={teamName}
								onChange={(eventChange) =>
									setTeamName(eventChange.target.value)
								}
								placeholder="Team name"
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
							/>
							<textarea
								value={memberEmails}
								onChange={(eventChange) =>
									setMemberEmails(eventChange.target.value)
								}
								rows={3}
								placeholder="Team member emails, separated by commas or new lines"
								className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
							/>
						</div>
					) : null}

					{fields.length === 0 ? (
						<p className="text-sm text-slate-500">
							No additional information is required.
						</p>
					) : (
						fields.map((field) => {
							const value = formData[field.id] ?? "";
							const inputClass =
								"mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
							return (
								<div key={field.id}>
									<label
										htmlFor={`field-${field.id}`}
										className="text-sm font-semibold text-slate-800"
									>
										{field.label}
										{field.required ? " *" : ""}
									</label>
									{field.type === "textarea" ? (
										<textarea
											id={`field-${field.id}`}
											value={value}
											onChange={(eventChange) =>
												updateField(
													field,
													eventChange.target.value,
												)
											}
											rows={4}
											className={inputClass}
										/>
									) : field.type === "select" ? (
										<select
											id={`field-${field.id}`}
											value={value}
											onChange={(eventChange) =>
												updateField(
													field,
													eventChange.target.value,
												)
											}
											className={inputClass}
										>
											<option value="">
												Select an option
											</option>
											{(field.options || []).map(
												(option) => (
													<option
														key={option}
														value={option}
													>
														{option}
													</option>
												),
											)}
										</select>
									) : field.type === "checkbox" ? (
										<input
											id={`field-${field.id}`}
											type="checkbox"
											checked={value === true}
											onChange={(eventChange) =>
												updateField(
													field,
													eventChange.target.checked,
												)
											}
											className="mt-3 h-4 w-4 accent-blue-600"
										/>
									) : (
										<input
											id={`field-${field.id}`}
											type={
												[
													"text",
													"email",
													"number",
													"tel",
													"url",
													"date",
												].includes(field.type)
													? field.type
													: "text"
											}
											value={value}
											onChange={(eventChange) =>
												updateField(
													field,
													eventChange.target.value,
												)
											}
											className={inputClass}
										/>
									)}
								</div>
							);
						})
					)}

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
					>
						{submitting
							? "Submitting registration..."
							: "Submit registration"}
					</button>
				</form>
			)}
		</div>
	);
};

export default UserEventRegistration;
