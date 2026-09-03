import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
	Users,
	Search,
	Filter,
	RefreshCw,
	X,
	Mail,
	Phone,
	UsersRound,
	ChevronRight,
	UserRound,
	ClipboardList,
	AlertCircle,
	CheckCircle2,
	Clock3,
	XCircle,
	Download,
} from "lucide-react";

import { getEventParticipants } from "@/services/eventServices";
// Change the import above if your api file is located somewhere else.

const EventParticipants = ({ eventId: eventIdProp }) => {
	const { id: routeEventId } = useParams();
	const eventId = eventIdProp || routeEventId;
	const [data, setData] = useState(null);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const [selectedParticipant, setSelectedParticipant] = useState(null);

	const loadParticipants = async () => {
		try {
			setLoading(true);
			setError("");
			console.log("Loading participants for event ID:", eventId); // Debugging log
			const result = await getEventParticipants(eventId);
			console.log("Fetched participants data:", result); // Debugging log

			if (!result?.success) {
				throw new Error("Unable to load participant information.");
			}

			setData(result);
		} catch (err) {
			console.error("Failed to load participants:", err);

			setError(
				err?.response?.data?.message ||
					err?.message ||
					"Failed to load participants.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (eventId) {
			loadParticipants();
		}
	}, [eventId]);

	const participants = data?.participants || [];
	const formFields = data?.formFields || [];

	const filteredParticipants = useMemo(() => {
		const query = search.trim().toLowerCase();

		return participants.filter((participant) => {
			const user = participant.user || {};

			const matchesSearch =
				!query ||
				user.name?.toLowerCase().includes(query) ||
				user.email?.toLowerCase().includes(query) ||
				user.phone?.toLowerCase().includes(query) ||
				participant.team?.name?.toLowerCase().includes(query) ||
				String(participant.registrationId).includes(query);

			const matchesStatus =
				statusFilter === "all" || participant.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [participants, search, statusFilter]);

	const statistics = useMemo(() => {
		return {
			total: participants.length,

			approved: participants.filter((p) => p.status === "approved")
				.length,

			pending: participants.filter((p) => p.status === "pending").length,

			waitlisted: participants.filter((p) => p.status === "waitlisted")
				.length,

			rejected: participants.filter((p) => p.status === "rejected")
				.length,

			cancelled: participants.filter((p) => p.status === "cancelled")
				.length,
		};
	}, [participants]);

	const formatResponseValue = (response) => {
		if (
			!response ||
			response.value === null ||
			response.value === undefined ||
			response.value === ""
		) {
			return "—";
		}

		const value = response.value;

		/*
		 * Checkbox / select values can be stored as JSON.
		 */
		if (response.type === "checkbox" || response.type === "select") {
			try {
				const parsed =
					typeof value === "string" ? JSON.parse(value) : value;

				if (Array.isArray(parsed)) {
					return parsed.join(", ");
				}

				if (typeof parsed === "object" && parsed !== null) {
					return JSON.stringify(parsed);
				}

				return String(parsed);
			} catch {
				return String(value);
			}
		}

		return typeof value === "object"
			? JSON.stringify(value)
			: String(value);
	};

	const getResponseValue = (participant, fieldId) => {
		const response = (participant.responses || []).find(
			(item) => String(item.fieldId) === String(fieldId),
		);

		return formatResponseValue(response);
	};

	const formatDate = (date) => {
		if (!date) return "—";

		try {
			return new Intl.DateTimeFormat("en-IN", {
				dateStyle: "medium",
				timeStyle: "short",
			}).format(new Date(date));
		} catch {
			return date;
		}
	};

	const getStatusConfig = (status) => {
		const configs = {
			approved: {
				label: "Approved",
				className: "bg-emerald-50 text-emerald-700 border-emerald-200",
				icon: CheckCircle2,
			},

			pending: {
				label: "Pending",
				className: "bg-amber-50 text-amber-700 border-amber-200",
				icon: Clock3,
			},

			waitlisted: {
				label: "Waitlisted",
				className: "bg-blue-50 text-blue-700 border-blue-200",
				icon: Clock3,
			},

			rejected: {
				label: "Rejected",
				className: "bg-red-50 text-red-700 border-red-200",
				icon: XCircle,
			},

			cancelled: {
				label: "Cancelled",
				className: "bg-slate-100 text-slate-600 border-slate-200",
				icon: XCircle,
			},
		};

		return configs[status] || configs.pending;
	};

	if (loading) {
		return (
			<div className="min-h-[500px] flex items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-slate-500">
					<RefreshCw size={28} className="animate-spin" />

					<p className="text-sm">Loading participants...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[500px] flex items-center justify-center px-4">
				<div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
						<AlertCircle size={24} className="text-red-600" />
					</div>

					<h2 className="text-lg font-semibold text-slate-900">
						Unable to load participants
					</h2>

					<p className="mt-2 text-sm text-slate-600">{error}</p>

					<button
						onClick={loadParticipants}
						className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
					>
						<RefreshCw size={16} />
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			{/* HEADER */}

			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
						<Users size={22} />
					</div>

					<div>
						<h1 className="text-2xl font-bold text-slate-900">
							Participants
						</h1>

						<p className="text-sm text-slate-500">
							{data?.event?.title}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={loadParticipants}
						className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
					>
						<RefreshCw size={16} />
						Refresh
					</button>

					<button
						onClick={() => exportParticipants(data)}
						className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
					>
						<Download size={16} />
						Export
					</button>
				</div>
			</div>

			{/* STATISTICS */}

			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
				<StatCard
					label="Total"
					value={statistics.total}
					icon={<Users size={18} />}
				/>

				<StatCard
					label="Approved"
					value={statistics.approved}
					icon={<CheckCircle2 size={18} />}
				/>

				<StatCard
					label="Pending"
					value={statistics.pending}
					icon={<Clock3 size={18} />}
				/>

				<StatCard
					label="Waitlisted"
					value={statistics.waitlisted}
					icon={<Clock3 size={18} />}
				/>

				<StatCard
					label="Rejected"
					value={statistics.rejected}
					icon={<XCircle size={18} />}
				/>

				<StatCard
					label="Cancelled"
					value={statistics.cancelled}
					icon={<XCircle size={18} />}
				/>
			</div>

			{/* FILTERS */}

			<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
					<div className="relative flex-1">
						<Search
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>

						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search name, email, phone, team or registration ID..."
							className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
						/>
					</div>

					<div className="relative">
						<Filter
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>

						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-slate-400"
						>
							<option value="all">All statuses</option>

							<option value="approved">Approved</option>

							<option value="pending">Pending</option>

							<option value="waitlisted">Waitlisted</option>

							<option value="rejected">Rejected</option>

							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				</div>

				<div className="mt-3 text-xs text-slate-500">
					Showing{" "}
					<strong className="text-slate-700">
						{filteredParticipants.length}
					</strong>{" "}
					of{" "}
					<strong className="text-slate-700">
						{participants.length}
					</strong>{" "}
					participants
				</div>
			</div>

			{/* TABLE */}

			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				{filteredParticipants.length === 0 ? (
					<div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
							<Users size={25} className="text-slate-400" />
						</div>

						<h3 className="text-base font-semibold text-slate-900">
							No participants found
						</h3>

						<p className="mt-1 max-w-sm text-sm text-slate-500">
							No participants match your current search or filter.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-max w-full border-collapse">
							<thead>
								<tr className="border-b border-slate-200 bg-slate-50">
									<th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
										Participant
									</th>

									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
										Contact
									</th>

									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
										Status
									</th>

									<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
										Team
									</th>

									{formFields.map((field) => (
										<th
											key={field.fieldId}
											className="max-w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
										>
											{field.label}
										</th>
									))}

									<th className="sticky right-0 z-20 bg-slate-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
										Details
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-slate-100">
								{filteredParticipants.map((participant) => (
									<tr
										key={participant.registrationId}
										className="group hover:bg-slate-50"
									>
										{/* PARTICIPANT */}

										<td className="sticky left-0 z-10 bg-white px-4 py-4 group-hover:bg-slate-50">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
													{participant.user?.name
														?.charAt(0)
														?.toUpperCase() || "?"}
												</div>

												<div className="min-w-0">
													<div className="truncate font-medium text-slate-900">
														{participant.user?.name}
													</div>

													<div className="text-xs text-slate-400">
														#
														{
															participant.registrationId
														}
													</div>
												</div>
											</div>
										</td>

										{/* CONTACT */}

										<td className="px-4 py-4">
											<div className="space-y-1">
												<div className="flex items-center gap-1.5 text-sm text-slate-700">
													<Mail
														size={13}
														className="text-slate-400"
													/>

													{participant.user?.email}
												</div>

												{participant.user?.phone && (
													<div className="flex items-center gap-1.5 text-xs text-slate-500">
														<Phone
															size={12}
															className="text-slate-400"
														/>

														{participant.user.phone}
													</div>
												)}
											</div>
										</td>

										{/* STATUS */}

										<td className="px-4 py-4">
											<StatusBadge
												status={participant.status}
												getStatusConfig={
													getStatusConfig
												}
											/>
										</td>

										{/* TEAM */}

										<td className="px-4 py-4">
											{participant.team ? (
												<div>
													<div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
														<UsersRound
															size={14}
															className="text-slate-400"
														/>

														{participant.team.name}
													</div>

													<div className="mt-0.5 text-xs text-slate-400">
														{
															participant.team
																.members?.length
														}{" "}
														member
														{participant.team
															.members?.length !==
														1
															? "s"
															: ""}
													</div>
												</div>
											) : (
												<span className="text-sm text-slate-400">
													Individual
												</span>
											)}
										</td>

										{/* DYNAMIC FORM FIELDS */}

										{formFields.map((field) => (
											<td
												key={field.fieldId}
												className="max-w-[220px] px-4 py-4"
											>
												<div
													className="truncate text-sm text-slate-700"
													title={getResponseValue(
														participant,
														field.fieldId,
													)}
												>
													{getResponseValue(
														participant,
														field.fieldId,
													)}
												</div>
											</td>
										))}

										{/* DETAILS */}

										<td className="sticky right-0 z-10 bg-white px-4 py-4 text-right group-hover:bg-slate-50">
											<button
												onClick={() =>
													setSelectedParticipant(
														participant,
													)
												}
												className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
											>
												View
												<ChevronRight size={14} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* DETAILS MODAL */}

			{selectedParticipant && (
				<ParticipantDetailsModal
					participant={selectedParticipant}
					formFields={formFields}
					onClose={() => setSelectedParticipant(null)}
					formatDate={formatDate}
					formatResponseValue={formatResponseValue}
					getStatusConfig={getStatusConfig}
				/>
			)}
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

const StatCard = ({ label, value, icon }) => {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="text-xs font-medium text-slate-500">
					{label}
				</div>

				<div className="text-slate-400">{icon}</div>
			</div>

			<div className="mt-2 text-2xl font-bold text-slate-900">
				{value}
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ status, getStatusConfig }) => {
	const config = getStatusConfig(status);
	const Icon = config.icon;

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
		>
			<Icon size={13} />
			{config.label}
		</span>
	);
};

/* -------------------------------------------------------------------------- */
/* DETAILS MODAL                                                              */
/* -------------------------------------------------------------------------- */

const ParticipantDetailsModal = ({
	participant,
	formFields,
	onClose,
	formatDate,
	formatResponseValue,
	getStatusConfig,
}) => {
	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
				{/* HEADER */}

				<div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
							{participant.user?.name?.charAt(0)?.toUpperCase() ||
								"?"}
						</div>

						<div>
							<h2 className="text-xl font-bold text-slate-900">
								{participant.user?.name}
							</h2>

							<p className="text-sm text-slate-500">
								Registration #{participant.registrationId}
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
					>
						<X size={20} />
					</button>
				</div>

				{/* BODY */}

				<div className="overflow-y-auto px-6 py-6">
					<div className="space-y-6">
						{/* BASIC INFO */}

						<section>
							<div className="mb-3 flex items-center gap-2">
								<UserRound
									size={17}
									className="text-slate-500"
								/>

								<h3 className="font-semibold text-slate-900">
									Participant Information
								</h3>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<DetailItem
									label="Full Name"
									value={participant.user?.name}
								/>

								<DetailItem
									label="Role"
									value={participant.user?.role}
								/>

								<DetailItem
									label="Email"
									value={participant.user?.email}
								/>

								<DetailItem
									label="Phone"
									value={participant.user?.phone || "—"}
								/>
							</div>
						</section>

						{/* REGISTRATION */}

						<section>
							<div className="mb-3 flex items-center gap-2">
								<ClipboardList
									size={17}
									className="text-slate-500"
								/>

								<h3 className="font-semibold text-slate-900">
									Registration
								</h3>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<DetailItem
									label="Registration ID"
									value={`#${participant.registrationId}`}
								/>

								<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
									<div className="mb-1 text-xs font-medium text-slate-500">
										Status
									</div>

									<StatusBadge
										status={participant.status}
										getStatusConfig={getStatusConfig}
									/>
								</div>

								<DetailItem
									label="Submitted"
									value={formatDate(participant.submittedAt)}
								/>

								<DetailItem
									label="Approved"
									value={formatDate(participant.approvedAt)}
								/>
							</div>
						</section>

						{/* TEAM */}

						{participant.team && (
							<section>
								<div className="mb-3 flex items-center gap-2">
									<UsersRound
										size={17}
										className="text-slate-500"
									/>

									<h3 className="font-semibold text-slate-900">
										Team
									</h3>
								</div>

								<div className="rounded-xl border border-slate-200">
									<div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
										<div className="font-medium text-slate-900">
											{participant.team.name}
										</div>

										<div className="text-xs text-slate-500">
											{participant.team.members?.length}{" "}
											members
										</div>
									</div>

									<div className="divide-y divide-slate-100">
										{participant.team.members?.map(
											(member) => (
												<div
													key={member.userId}
													className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
												>
													<div>
														<div className="text-sm font-medium text-slate-800">
															{member.name}
														</div>

														<div className="text-xs text-slate-500">
															{member.email}
														</div>
													</div>

													{member.phone && (
														<div className="text-xs text-slate-500">
															{member.phone}
														</div>
													)}
												</div>
											),
										)}
									</div>
								</div>
							</section>
						)}

						{/* DYNAMIC RESPONSES */}

						<section>
							<div className="mb-3 flex items-center gap-2">
								<ClipboardList
									size={17}
									className="text-slate-500"
								/>

								<h3 className="font-semibold text-slate-900">
									Registration Responses
								</h3>
							</div>

							{formFields.length === 0 ? (
								<div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
									<p className="text-sm text-slate-500">
										This event has no custom registration
										fields.
									</p>
								</div>
							) : (
								<div className="grid gap-3 sm:grid-cols-2">
									{formFields.map((field) => {
										const response = (
											participant.responses || []
										).find(
											(item) =>
												String(item.fieldId) ===
												String(field.fieldId),
										);

										return (
											<div
												key={field.fieldId}
												className="rounded-xl border border-slate-200 bg-slate-50 p-4"
											>
												<div className="mb-1 flex items-center gap-1">
													<span className="text-xs font-medium text-slate-500">
														{field.label}
													</span>

													{field.required && (
														<span className="text-red-500">
															*
														</span>
													)}
												</div>

												<div className="break-words text-sm font-medium text-slate-800">
													{formatResponseValue(
														response,
													)}
												</div>
											</div>
										);
									})}
								</div>
							)}
						</section>

						{/* IDS */}

						<div className="flex flex-col gap-1 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
							<span>User ID: {participant.user?.userId}</span>

							<span>
								Registration ID: {participant.registrationId}
							</span>
						</div>
					</div>
				</div>

				{/* FOOTER */}

				<div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
					<button
						onClick={onClose}
						className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/* DETAIL ITEM                                                                */
/* -------------------------------------------------------------------------- */

const DetailItem = ({ label, value }) => {
	return (
		<div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
			<div className="mb-1 text-xs font-medium text-slate-500">
				{label}
			</div>

			<div className="break-words text-sm font-medium text-slate-800">
				{value || "—"}
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/* CSV EXPORT                                                                 */
/* -------------------------------------------------------------------------- */

const exportParticipants = (data) => {
	if (!data?.participants?.length) {
		return;
	}

	const fields = data.formFields || [];
	const participants = data.participants || [];

	const headers = [
		"Registration ID",
		"Name",
		"Email",
		"Phone",
		"Role",
		"Status",
		"Team",
		...fields.map((field) => field.label),
	];

	const rows = participants.map((participant) => {
		const responseMap = {};

		(participant.responses || []).forEach((response) => {
			responseMap[response.fieldId] = formatExportValue(response);
		});

		return [
			participant.registrationId,
			participant.user?.name || "",
			participant.user?.email || "",
			participant.user?.phone || "",
			participant.user?.role || "",
			participant.status || "",
			participant.team?.name || "",
			...fields.map((field) => responseMap[field.fieldId] || ""),
		];
	});

	const csv = [headers, ...rows]
		.map((row) =>
			row
				.map((value) => `"${String(value).replace(/"/g, '""')}"`)
				.join(","),
		)
		.join("\n");

	const blob = new Blob([csv], {
		type: "text/csv;charset=utf-8;",
	});

	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");

	link.href = url;

	link.download = `${data.event?.title || "participants"}-participants.csv`;

	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link);

	URL.revokeObjectURL(url);
};

const formatExportValue = (response) => {
	if (!response?.value) {
		return "";
	}

	if (response.type === "checkbox" || response.type === "select") {
		try {
			const parsed =
				typeof response.value === "string"
					? JSON.parse(response.value)
					: response.value;

			if (Array.isArray(parsed)) {
				return parsed.join(", ");
			}

			return typeof parsed === "object" && parsed !== null
				? JSON.stringify(parsed)
				: String(parsed);
		} catch {
			return String(response.value);
		}
	}

	return typeof response.value === "object"
		? JSON.stringify(response.value)
		: String(response.value);
};

export default EventParticipants;
