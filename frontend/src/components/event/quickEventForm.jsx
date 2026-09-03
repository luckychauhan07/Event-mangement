import {
	createEvent,
	getAllTeachers,
	patchEvent,
} from "../../services/eventServices";
import toast from "react-hot-toast";
import {
	Calendar,
	MapPin,
	Link as LinkIcon,
	Tag,
	FileText,
	DollarSign,
	Users,
	Building2,
	ChevronDown,
	Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
const QuickEventForm = ({
	eventData,
	setEventData,
	setAdvancedMode,
	isEditing = false,
}) => {
	const [currentUser] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem("user"));
		} catch {
			return null;
		}
	});
	const currentUserRole = currentUser?.role || "";
	const organizerUnits = [
		{ id: "cs", name: "Computer Science Department" },
		{ id: "ee", name: "Electrical Engineering Department" },
		{ id: "me", name: "Mechanical Engineering Department" },
		{ id: "ce", name: "Civil Engineering Department" },
		{ id: "chem", name: "Chemistry Department" },
		{ id: "phy", name: "Physics Department" },
		{ id: "math", name: "Mathematics Department" },
		{ id: "bio", name: "Biology Department" },
		{ id: "admin", name: "Administration" },
		{ id: "cultural", name: "Cultural Committee" },
		{ id: "sports", name: "Sports Committee" },
	];

	const [teachers, setTeachers] = useState([]);
	const [loadingTeachers, setLoadingTeachers] = useState(false);
	const [creating, setCreating] = useState(false);
	const nowDateTime = getDateTimeLocalValue(new Date());
	const endDateMin =
		eventData.startAt && eventData.startAt > nowDateTime
			? eventData.startAt
			: nowDateTime;

	useEffect(() => {
		const loadTeachers = async () => {
			setLoadingTeachers(true);
			try {
				const data = await getAllTeachers();
				setTeachers(data?.teachers || []);
			} catch (error) {
				console.error(error);
				setTeachers([]);
			} finally {
				setLoadingTeachers(false);
			}
		};

		if (currentUserRole === "admin") {
			loadTeachers();
		}
	}, [currentUserRole]);

	useEffect(() => {
		if (currentUserRole !== "teacher") return;

		const teacherFromList = teachers.find(
			(t) =>
				String(t.user_id) === String(currentUser?.id) ||
				t.email === currentUser?.email,
		);

		const coordinatorId = String(
			teacherFromList?.user_id ?? currentUser?.id ?? "",
		);
		const coordinatorName =
			teacherFromList?.name || currentUser?.name || "";
		const coordinatorEmail =
			teacherFromList?.email || currentUser?.email || "";
		const coordinatorPhone =
			teacherFromList?.phone || currentUser?.phone || "";

		if (!coordinatorId || !coordinatorName || !coordinatorEmail) return;

		setEventData((prev) => {
			if (
				String(prev.primaryCoordinatorId) === coordinatorId &&
				prev.primaryCoordinator === coordinatorName &&
				prev.primaryCoordinatorEmail === coordinatorEmail &&
				(prev.primaryCoordinatorPhone || "") === coordinatorPhone
			) {
				return prev;
			}

			return {
				...prev,
				coordinator: coordinatorId,
				primaryCoordinator: coordinatorName,
				primaryCoordinatorEmail: coordinatorEmail,
				primaryCoordinatorPhone: coordinatorPhone,
				primaryCoordinatorId: coordinatorId,
			};
		});
	}, [
		currentUser?.email,
		currentUser?.id,
		currentUser?.name,
		currentUser?.phone,
		currentUserRole,
		setEventData,
		teachers,
	]);

	const handleChange = (field, value) => {
		if (field === "startAt") {
			setEventData({
				...eventData,
				startAt: value,
				endAt:
					eventData.endAt &&
					new Date(eventData.endAt) < new Date(value)
						? ""
						: eventData.endAt,
			});
			return;
		}

		if (field === "coordinator") {
			if (currentUserRole === "teacher") {
				setEventData({
					...eventData,
					coordinator: String(currentUser?.id || ""),
					primaryCoordinator: currentUser?.name,
					primaryCoordinatorEmail: currentUser?.email,
					primaryCoordinatorPhone: currentUser?.phone || "",
					primaryCoordinatorId: String(currentUser?.id || ""),
				});
				return;
			}

			const teacher = teachers.find(
				(t) => String(t.user_id) === String(value),
			);

			if (!teacher) return;

			setEventData({
				...eventData,
				coordinator: String(teacher.user_id),
				primaryCoordinator: teacher.name,
				primaryCoordinatorEmail: teacher.email,
				primaryCoordinatorPhone: teacher.phone || "",
				primaryCoordinatorId: String(teacher.user_id),
			});
			return;
		}

		setEventData({
			...eventData,
			[field]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (creating) return;

		if (!eventData.title) return toast.error("Event title required");
		if (!eventData.description)
			return toast.error("Event description required");
		if (!eventData.category) return toast.error("Select category");
		if (!eventData.eventType) return toast.error("Select event type");
		if (!eventData.eventMode) return toast.error("Select event mode");
		if (!eventData.startAt || !eventData.endAt)
			return toast.error("Select start/end date");

		if (new Date(eventData.startAt) >= new Date(eventData.endAt)) {
			return toast.error("End date must be after start date");
		}

		if (eventData.eventType === "paid" && !eventData.entryFee) {
			return toast.error("Entry fee required");
		}

		try {
			setCreating(true);
			if (isEditing) {
				await patchEvent(eventData.id, eventData);
				toast.success("Event updated successfully 🎉");
			} else {
				await createEvent(eventData);
				toast.success("Event created successfully 🎉");
			}
			setTimeout(() => {
				window.location.href =
					currentUserRole === "teacher"
						? "/teacher/events"
						: "/admin/events";
			}, 1000);
		} catch (err) {
			toast.error(
				err?.response?.data?.message ||
					(isEditing
						? "Failed to update event"
						: "Failed to create event"),
			);
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="max-w-7xl mx-auto">
			<div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
				{/* HEADER */}
				<div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-white">
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
							<Calendar size={24} />
						</div>

						<div>
							<h2 className="text-2xl font-bold">Create Event</h2>
							<p className="text-sm text-emerald-50 mt-1">
								Premium quick event builder
							</p>
						</div>
						<div className="ml-auto">
							<button
								type="button"
								onClick={() => window.history.back()}
								className="inline-flex items-center rounded-xl border border-white/40 bg-white/12 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
							>
								Go Back
							</button>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
					{/* BASIC */}
					<Section title="Basic Details">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<FloatingInput
								label="Event Title"
								placeholder="e.g. Hackathon 2026"
								icon={<Tag size={18} />}
								value={eventData.title || ""}
								onChange={(v) => handleChange("title", v)}
							/>

							<FloatingInput
								label="Subtitle"
								placeholder="e.g. AI Innovation Challenge"
								value={eventData.subtitle || ""}
								onChange={(v) => handleChange("subtitle", v)}
							/>

							<div className="md:col-span-2">
								<FloatingTextarea
									label="Description"
									placeholder="Describe your event"
									icon={<FileText size={18} />}
									value={eventData.description || ""}
									onChange={(v) =>
										handleChange("description", v)
									}
								/>
							</div>
						</div>
					</Section>

					{/* CONFIG */}
					<Section title="Configuration">
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
							<SelectField
								label="Category"
								value={eventData.category || ""}
								onChange={(v) => handleChange("category", v)}
								options={["Technical", "Cultural", "Sports"]}
							/>

							<SelectField
								label="Type"
								value={eventData.eventType || ""}
								onChange={(v) => handleChange("eventType", v)}
								options={[
									{
										value: "free",
										label: "Free",
									},
									{
										value: "paid",
										label: "Paid",
									},
								]}
							/>

							<SelectField
								label="Mode"
								value={eventData.eventMode || ""}
								onChange={(v) => handleChange("eventMode", v)}
								options={[
									{
										value: "offline",
										label: "Offline",
									},
									{
										value: "online",
										label: "Online",
									},
									{
										value: "hybrid",
										label: "Hybrid",
									},
								]}
							/>

							{eventData.eventType === "paid" && (
								<FloatingInput
									label="Entry Fee ₹"
									placeholder="e.g. 200"
									type="number"
									icon={<DollarSign size={18} />}
									value={eventData.entryFee || ""}
									onChange={(v) =>
										handleChange("entryFee", v)
									}
								/>
							)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
							{(eventData.eventMode === "offline" ||
								eventData.eventMode === "hybrid") && (
								<FloatingInput
									label="Venue"
									placeholder="e.g. Auditorium Hall A"
									icon={<MapPin size={18} />}
									value={eventData.venue || ""}
									onChange={(v) => handleChange("venue", v)}
								/>
							)}

							{(eventData.eventMode === "online" ||
								eventData.eventMode === "hybrid") && (
								<FloatingInput
									label="Meeting Link"
									placeholder="https://meet.google.com/..."
									icon={<LinkIcon size={18} />}
									value={eventData.onlineLink || ""}
									onChange={(v) =>
										handleChange("onlineLink", v)
									}
								/>
							)}
						</div>
					</Section>

					{/* PEOPLE */}
					<Section title="Organizers & Coordinators">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<SearchDropdown
								label="Organizer Unit"
								icon={<Building2 size={18} />}
								value={eventData.organizerUnit}
								onSelect={(val) =>
									handleChange("organizerUnit", val)
								}
								options={organizerUnits.map((item) => ({
									value: item.id,
									label: item.name,
								}))}
							/>

							{currentUserRole === "teacher" ? (
								<div className="rounded-2xl border border-slate-300 bg-white px-4 py-3">
									<p className="text-xs text-slate-500">
										Primary Coordinator
									</p>
									<p className="text-sm font-medium text-slate-900 truncate">
										{eventData.primaryCoordinator ||
											currentUser?.name ||
											"No coordinator"}
									</p>
									<p className="text-xs text-slate-500 mt-1 truncate">
										{eventData.primaryCoordinatorEmail ||
											currentUser?.email ||
											"No email"}
										{" • "}
										{eventData.primaryCoordinatorPhone ||
											currentUser?.phone ||
											"No phone"}
									</p>
									<p className="text-xs text-slate-500 mt-1">
										Auto-assigned to your teacher account
									</p>
								</div>
							) : (
								<SearchDropdown
									label="Primary Coordinator"
									icon={<Users size={18} />}
									value={eventData.coordinator}
									onSelect={(val) =>
										handleChange("coordinator", val)
									}
									loading={loadingTeachers}
									options={teachers.map((t) => ({
										value: t.user_id,
										label: t.name,
										meta: `${t.email} • ${t.phone || "No phone"}`,
									}))}
								/>
							)}
						</div>
					</Section>

					{/* DATE */}
					<Section title="Schedule">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<FloatingInput
								label="Start Date"
								type="datetime-local"
								icon={<Calendar size={18} />}
								value={eventData.startAt || ""}
								min={nowDateTime}
								onChange={(v) => handleChange("startAt", v)}
							/>

							<FloatingInput
								label="End Date"
								type="datetime-local"
								icon={<Calendar size={18} />}
								value={eventData.endAt || ""}
								min={endDateMin}
								onChange={(v) => handleChange("endAt", v)}
							/>
						</div>
					</Section>

					{/* FOOTER */}
					<div className="flex flex-col md:flex-row gap-4 justify-between">
						<button
							type="button"
							onClick={() => setAdvancedMode(true)}
							className="px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 font-medium"
						>
							Advanced Settings
						</button>

						<button
							type="submit"
							className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
							disabled={creating}
						>
							{creating
								? isEditing
									? "Updating..."
									: "Creating..."
								: isEditing
									? "update event"
									: "Create Event"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default QuickEventForm;

/* ---------- UI COMPONENTS ---------- */

const Section = ({ title, children }) => (
	<div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
		<h3 className="font-bold text-slate-800 mb-4">{title}</h3>
		{children}
	</div>
);

const inputBase =
	"w-full rounded-2xl border border-slate-300 bg-white px-4 pt-6 pb-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition";

const FloatingInput = ({
	label,
	value,
	onChange,
	type = "text",
	icon,
	min,
	placeholder,
}) => (
	<div className="relative">
		{icon && (
			<div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
				{icon}
			</div>
		)}

		<input
			type={type}
			value={value}
			min={min}
			placeholder={placeholder || " "}
			onChange={(e) => onChange(e.target.value)}
			className={`${inputBase} ${icon ? "pl-11" : ""} placeholder:text-slate-400 placeholder:text-xs`}
		/>

		<label
			className={`absolute top-2 text-xs text-slate-500 ${icon ? "left-11" : "left-4"}`}
		>
			{label}
		</label>
	</div>
);

const getDateTimeLocalValue = (date) => {
	const pad = (value) => String(value).padStart(2, "0");

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const FloatingTextarea = ({ label, value, onChange, icon, placeholder }) => (
	<div className="relative">
		{icon && (
			<div className="absolute left-4 top-5 text-slate-400 pointer-events-none z-10">
				{icon}
			</div>
		)}

		<textarea
			rows="3"
			value={value}
			placeholder={placeholder || " "}
			onChange={(e) => onChange(e.target.value)}
			className={`${inputBase} resize-none ${icon ? "pl-11" : ""} placeholder:text-slate-400 placeholder:text-xs`}
		/>

		<label
			className={`absolute top-2 text-xs text-slate-500 ${icon ? "left-11" : "left-4"}`}
		>
			{label}
		</label>
	</div>
);

const SelectField = ({ label, value, onChange, options }) => (
	<div className="relative">
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={`${inputBase} appearance-none`}
		>
			<option value="">Select {label}</option>

			{options.map((item) =>
				typeof item === "string" ? (
					<option key={item} value={item}>
						{item}
					</option>
				) : (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				),
			)}
		</select>

		<label className="absolute left-4 top-2 text-xs text-slate-500">
			{label}
		</label>

		<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
	</div>
);

const SearchDropdown = ({ label, options, value, onSelect, icon, loading }) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const ref = useRef();

	useEffect(() => {
		const handleOutside = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleOutside);

		return () => document.removeEventListener("mousedown", handleOutside);
	}, []);

	const filtered = options.filter((item) =>
		`${item.label} ${item.meta || ""}`
			.toLowerCase()
			.includes(search.toLowerCase()),
	);

	const selected = options.find(
		(item) => String(item.value) === String(value),
	);

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left hover:border-emerald-400 transition"
			>
				<div className="flex items-center gap-3">
					<div className="text-slate-400">{icon}</div>

					<div className="flex-1">
						<p className="text-xs text-slate-500">{label}</p>

						<p className="text-sm font-medium truncate">
							{selected ? selected.label : `Select ${label}`}
						</p>
					</div>

					<ChevronDown
						size={18}
						className={`transition ${open ? "rotate-180" : ""}`}
					/>
				</div>
			</button>

			{open && (
				<div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
					<div className="p-3 border-b">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

							<input
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={`Search ${label}`}
								className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-500"
							/>
						</div>
					</div>

					<div className="max-h-72 overflow-y-auto">
						{loading ? (
							<div className="p-4 text-sm text-slate-500">
								Loading...
							</div>
						) : filtered.length ? (
							filtered.map((item) => (
								<button
									type="button"
									key={item.value}
									onClick={() => {
										onSelect(item.value);
										setOpen(false);
									}}
									className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-slate-100"
								>
									<p className="text-sm font-medium">
										{item.label}
									</p>

									{item.meta && (
										<p className="text-xs text-slate-500 mt-0.5">
											{item.meta}
										</p>
									)}
								</button>
							))
						) : (
							<div className="p-4 text-sm text-slate-500">
								No results
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
