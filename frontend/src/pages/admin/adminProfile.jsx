import { useEffect, useMemo, useState } from "react";
import {
	User2,
	Mail,
	Phone,
	ShieldCheck,
	BadgeCheck,
	Building2,
	CalendarDays,
	KeyRound,
	Pencil,
	CircleCheckBig,
	MapPin,
	BriefcaseBusiness,
	AtSign,
	AlertTriangle,
	CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile } from "@/services/adminServices";
import toast from "react-hot-toast";

const AdminProfile = () => {
	const navigate = useNavigate();
	const [admin, setAdmin] = useState(null);

	useEffect(() => {
		const fetchAdminData = async () => {
			document.title = "My Profile - Admin Panel";
			try {
				const response = await getAdminProfile();
				console.log("Admin Profile Data:", response.data);
				setAdmin(response.data);
			} catch (error) {
				toast.error("Failed to load profile. Please try again.");
			}
		};

		fetchAdminData();
	}, []);

	const completionConfig = useMemo(() => {
		if (!admin) {
			return {
				percent: 0,
				missingFields: [],
				completedFields: 0,
				totalFields: 0,
			};
		}

		const requiredFields = [
			{
				key: "full_name",
				label: "Full Name",
				value: admin.full_name,
			},
			{
				key: "email",
				label: "Email Address",
				value: admin.email,
			},
			// {
			// 	key: "avatar_url",
			// 	label: "Profile Photo",
			// 	value: admin.avatar_url,
			// },
			{
				key: "designation",
				label: "Designation",
				value: admin.designation,
			},
			{
				key: "office_phone",
				label: "Office Phone",
				value: admin.office_phone,
			},
			{
				key: "institution_id",
				label: "Institution Link",
				value: admin.institution_id,
			},
		];

		const completedFields = requiredFields.filter(
			(field) =>
				field.value !== null &&
				field.value !== undefined &&
				String(field.value).trim() !== "",
		).length;

		const totalFields = requiredFields.length;
		const percent = Math.round((completedFields / totalFields) * 100);

		const missingFields = requiredFields
			.filter(
				(field) =>
					field.value === null ||
					field.value === undefined ||
					String(field.value).trim() === "",
			)
			.map((field) => field.label);

		return {
			percent,
			missingFields,
			completedFields,
			totalFields,
		};
	}, [admin]);

	if (!admin) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
				<div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-10 py-12 text-center animate-in fade-in zoom-in-95 duration-300">
					<div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
					<p className="text-sm font-medium text-slate-500">
						Loading profile...
					</p>
				</div>
			</div>
		);
	}

	const infoCards = [
		{
			label: "Full Name",
			value: admin.full_name || "Not added",
			icon: User2,
		},
		{
			label: "Email Address",
			value: admin.email || "Not added",
			icon: Mail,
		},
		{
			label: "Phone Number",
			value: admin.phone || "Not added",
			icon: Phone,
		},
		{
			label: "Joined On",
			value: admin.account_created_at
				? new Date(admin.account_created_at).toLocaleDateString(
						"en-IN",
						{
							day: "numeric",
							month: "short",
							year: "numeric",
						},
					)
				: "Not available",
			icon: CalendarDays,
		},
		{
			label: "Designation",
			value: admin.designation || "Not added",
			icon: BriefcaseBusiness,
		},
		{
			label: "Alternate Email",
			value: admin.alternate_email || "Not added",
			icon: AtSign,
		},
		{
			label: "Office Phone",
			value: admin.office_phone || "Not added",
			icon: Phone,
		},
		{
			label: "Office Location",
			value: admin.office_location || "Not added",
			icon: MapPin,
		},
	];

	const isComplete = completionConfig.percent === 100 ? true : false;

	return (
		<div className="min-h-screen bg-slate-50 p-4 sm:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* HEADER */}
				<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
					<div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

					<div className="p-5 sm:p-6 lg:p-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
						<div className="flex flex-col sm:flex-row sm:items-center gap-5 min-w-0">
							<div className="relative shrink-0 self-start sm:self-auto">
								<img
									src={
										admin.avatar_url ||
										`https://ui-avatars.com/api/?name=${encodeURIComponent(
											admin.full_name || "Admin",
										)}&background=0f172a&color=fff&size=256`
									}
									alt={admin.full_name}
									className="w-24 h-24 rounded-3xl object-cover border border-slate-200 shadow-sm"
								/>
								<div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-sm">
									<CircleCheckBig className="w-3.5 h-3.5 text-white" />
								</div>
							</div>

							<div className="min-w-0">
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide mb-3">
									<ShieldCheck className="w-3.5 h-3.5" />
									Administrator Account
								</div>

								<h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight break-words">
									{admin.full_name}
								</h1>

								<p className="text-sm text-slate-500 mt-3 max-w-2xl leading-relaxed">
									Manage your account details, professional
									information, and institution-linked identity
									from one place.
								</p>

								<div className="flex flex-wrap items-center gap-2 mt-4">
									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
										<CircleCheckBig className="w-3.5 h-3.5" />
										{admin.status || "Active"}
									</span>

									<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
										<BadgeCheck className="w-3.5 h-3.5" />
										{admin.role || "Admin"}
									</span>

									{!isComplete && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
											<AlertTriangle className="w-3.5 h-3.5" />
											Profile Incomplete
										</span>
									)}
								</div>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
							<button
								className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
								onClick={() =>
									navigate(
										!isComplete
											? "/admin/profile/completion"
											: "/admin/profile/edit",
									)
								}
							>
								<Pencil className="w-4 h-4" />
								{!isComplete
									? "Complete Profile"
									: "Edit Profile"}
							</button>

							<button
								className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-all duration-200 hover:shadow-sm active:scale-[0.98]"
								onClick={() =>
									navigate("/admin/profile/change-password")
								}
							>
								<KeyRound className="w-4 h-4" />
								Change Password
							</button>
						</div>
					</div>
				</div>

				{/* PROFILE COMPLETION */}
				{!isComplete && (
					<>
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
							<div className="px-5 sm:px-7 py-5 border-b border-slate-200 bg-slate-50/70">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div>
										<h2 className="text-xl font-bold text-slate-900">
											Profile Completion
										</h2>
										<p className="text-sm text-slate-500 mt-1">
											Complete your profile to unlock a
											cleaner admin setup.
										</p>
									</div>

									<div
										className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border w-fit ${
											isComplete
												? "bg-emerald-50 text-emerald-700 border-emerald-200"
												: "bg-amber-50 text-amber-700 border-amber-200"
										}`}
									>
										{isComplete ? (
											<CheckCircle2 className="w-3.5 h-3.5" />
										) : (
											<AlertTriangle className="w-3.5 h-3.5" />
										)}
										{completionConfig.percent}% Complete
									</div>
								</div>
							</div>

							<div className="p-5 sm:p-7 space-y-5">
								<div>
									<div className="flex items-center justify-between mb-2">
										<p className="text-sm font-semibold text-slate-700">
											Completion Progress
										</p>
										<p className="text-sm text-slate-500">
											{completionConfig.completedFields}/
											{completionConfig.totalFields}{" "}
											required fields
										</p>
									</div>

									<div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
										<div
											className={`h-3 rounded-full transition-all duration-700 ease-out ${
												isComplete
													? "bg-emerald-500"
													: completionConfig.percent >=
														  70
														? "bg-blue-500"
														: completionConfig.percent >=
															  40
															? "bg-amber-500"
															: "bg-rose-500"
											}`}
											style={{
												width: `${completionConfig.percent}%`,
											}}
										/>
									</div>
								</div>

								{completionConfig.missingFields.length > 0 ? (
									<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0">
												<AlertTriangle className="w-5 h-5 text-amber-600" />
											</div>

											<div className="min-w-0">
												<p className="text-sm font-bold text-slate-900">
													Missing Required Fields
												</p>
												<p className="text-sm text-slate-600 mt-1">
													Add these details to
													complete your profile.
												</p>

												<div className="flex flex-wrap gap-2 mt-4">
													{completionConfig.missingFields.map(
														(field) => (
															<span
																key={field}
																className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-amber-200 text-xs font-semibold text-amber-700"
															>
																{field}
															</span>
														),
													)}
												</div>

												<button
													onClick={() =>
														navigate(
															"/admin/profile/completion",
														)
													}
													className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
												>
													<Pencil className="w-4 h-4" />
													Complete Now
												</button>
											</div>
										</div>
									</div>
								) : (
									<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
										<div className="flex items-start gap-3">
											<div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0">
												<CheckCircle2 className="w-5 h-5 text-emerald-600" />
											</div>

											<div>
												<p className="text-sm font-bold text-slate-900">
													Profile Completed
												</p>
												<p className="text-sm text-emerald-700 mt-1">
													Your admin profile is fully
													configured and ready.
												</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</>
				)}

				{/* MAIN GRID */}
				<div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
					{/* ACCOUNT INFO */}
					<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
						<div className="px-5 sm:px-7 py-5 border-b border-slate-200 bg-slate-50/70">
							<h2 className="text-xl font-bold text-slate-900">
								Account Information
							</h2>
							<p className="text-sm text-slate-500 mt-1">
								Primary account and professional details linked
								to your admin profile.
							</p>
						</div>

						<div className="p-5 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-4">
							{infoCards.map((item) => {
								const Icon = item.icon;
								return (
									<div
										key={item.label}
										className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-white hover:shadow-sm transition-all duration-200 hover:-translate-y-[1px]"
									>
										<div className="flex items-start gap-4">
											<div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
												<Icon className="w-5 h-5 text-slate-500" />
											</div>

											<div className="min-w-0">
												<p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
													{item.label}
												</p>
												<p className="text-sm font-semibold text-slate-900 mt-2 break-words leading-relaxed">
													{item.value}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* SIDE PANEL */}
					<div className="space-y-6">
						{/* ACCESS */}
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
							<div className="px-5 sm:px-7 py-5 border-b border-slate-200 bg-slate-50/70">
								<h2 className="text-xl font-bold text-slate-900">
									Access & Security
								</h2>
								<p className="text-sm text-slate-500 mt-1">
									Role-level identity and access summary.
								</p>
							</div>

							<div className="p-5 sm:p-7 space-y-4">
								<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
									<p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">
										Account Status
									</p>
									<p className="text-lg font-bold text-emerald-800 mt-1">
										{admin.status || "Active"}
									</p>
									<p className="text-sm text-emerald-700 mt-2">
										You currently have administrative access
										to the platform.
									</p>
								</div>

								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
									<p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
										Admin Role
									</p>
									<p className="text-lg font-bold text-slate-900 mt-1">
										{admin.designation ||
											"Platform Administrator"}
									</p>
									<p className="text-sm text-slate-500 mt-2">
										Can manage institution events,
										approvals, users, and system operations.
									</p>
								</div>
							</div>
						</div>

						{/* INSTITUTION */}
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
							<div className="px-5 sm:px-7 py-5 border-b border-slate-200 bg-slate-50/70 flex items-start sm:items-center justify-between gap-4">
								<div>
									<h2 className="text-xl font-bold text-slate-900">
										Institution Context
									</h2>
									<p className="text-sm text-slate-500 mt-1">
										System-linked organization details.
									</p>
								</div>

								<button
									className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
									onClick={() =>
										navigate("/admin/settings/institution")
									}
								>
									Edit
								</button>
							</div>

							<div className="p-5 sm:p-7">
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-white hover:shadow-sm transition-all duration-200">
									<div className="flex items-start gap-4">
										<div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
											<Building2 className="w-5 h-5 text-slate-500" />
										</div>

										<div className="min-w-0">
											<p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
												Institution
											</p>
											<p className="text-lg font-bold text-slate-900 mt-2 break-words">
												{admin.institution_name ||
													"Not linked"}
											</p>
											<p className="text-sm text-slate-500 mt-2 leading-relaxed">
												{admin.city && admin.state
													? `${admin.city}, ${admin.state}`
													: "Institution details not fully configured"}
											</p>

											{admin.website && (
												<a
													href={admin.website}
													target="_blank"
													rel="noreferrer"
													className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
												>
													Visit website
												</a>
											)}
										</div>
									</div>
								</div>

								{admin.principal_name && (
									<div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
										<p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
											Principal
										</p>
										<p className="text-sm font-semibold text-slate-900 mt-2">
											{admin.principal_name}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminProfile;
