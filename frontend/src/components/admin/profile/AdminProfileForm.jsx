import { useEffect, useMemo, useState } from "react";
import {
	Upload,
	BriefcaseBusiness,
	Phone,
	AtSign,
	MapPin,
	CheckCircle2,
	AlertTriangle,
	User2,
	PhoneCall,
	Mail,
	PenTool,
	ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminProfileForm = ({
	mode = "edit",
	initialData = {},
	onSubmit,
	loading = false,
}) => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		full_name: "",
		avatar_url: "",
		designation: "",
		office_phone: "",
		alternate_email: "",
		office_location: "",
		signature_image_url: "",
		institution_id: "",
		phone: "",
		employee_id: "",
		email: "",
	});
	useEffect(() => {
		setFormData({
			full_name: initialData.full_name || "",
			avatar_url: initialData.avatar_url || "",
			designation: initialData.designation || "",
			office_phone: initialData.office_phone || "",
			alternate_email: initialData.alternate_email || "",
			office_location: initialData.office_location || "",
			signature_image_url: initialData.signature_image_url || "",
			institution_id: initialData.institution_id || "",
			phone: initialData.phone || "",
			employee_id: initialData.employee_id || "",
			email: initialData.email || "",
		});
	}, [initialData]);

	const requiredFields = [
		{ key: "full_name", label: "Full Name" },
		{ key: "avatar_url", label: "Profile Photo" },
		{ key: "designation", label: "Designation" },
		{ key: "office_phone", label: "Office Phone" },
		{ key: "signature_image_url", label: "Signature Image" },
	];

	const completionConfig = useMemo(() => {
		const completedFields = requiredFields.filter((field) => {
			const value = formData[field.key];
			return (
				value !== null &&
				value !== undefined &&
				String(value).trim() !== ""
			);
		}).length;

		const totalFields = requiredFields.length;
		const percent = Math.round((completedFields / totalFields) * 100);

		const missingFields = requiredFields
			.filter((field) => {
				const value = formData[field.key];
				return (
					value === null ||
					value === undefined ||
					String(value).trim() === ""
				);
			})
			.map((field) => field.label);

		return {
			completedFields,
			totalFields,
			percent,
			missingFields,
		};
	}, [formData]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (completionConfig.missingFields.length > 0) {
			toast.error("Please complete all required fields.");
			return;
		}

		try {
			await onSubmit?.(formData);
		} catch (error) {
			console.error(error);
		}
	};

	const inputBase =
		"w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400";

	const isComplete = completionConfig.percent === 100;

	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
				<div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

				<div className="p-5 sm:p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide mb-3">
							<ShieldCheck className="w-3.5 h-3.5" />
							{mode === "complete"
								? "Admin Profile Setup"
								: "Edit Admin Profile"}
						</div>

						<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
							{mode === "complete"
								? "Complete Your Profile"
								: "Edit Profile"}
						</h1>

						<p className="text-sm text-slate-500 mt-3 max-w-2xl leading-relaxed">
							{mode === "complete"
								? "Add the remaining professional and personal details to complete your admin identity."
								: "Update your admin profile information from one place."}
						</p>
					</div>

					<div className="w-full lg:w-[300px] rounded-2xl border border-slate-200 bg-slate-50 p-5">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold text-slate-700">
								Profile Completion
							</p>
							<p className="text-sm font-bold text-slate-900">
								{completionConfig.percent}%
							</p>
						</div>

						<div className="mt-3 w-full h-3 rounded-full bg-slate-200 overflow-hidden">
							<div
								className={`h-3 rounded-full transition-all duration-500 ${
									isComplete
										? "bg-emerald-500"
										: "bg-blue-500"
								}`}
								style={{
									width: `${completionConfig.percent}%`,
								}}
							/>
						</div>

						<p className="text-xs text-slate-500 mt-3">
							{completionConfig.completedFields}/
							{completionConfig.totalFields} required fields
							completed
						</p>
					</div>
				</div>
			</div>

			{/* ALERT */}
			{completionConfig.missingFields.length > 0 && (
				<div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 shadow-sm">
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5 text-amber-600" />
						</div>

						<div>
							<p className="text-sm font-bold text-slate-900">
								Missing Required Fields
							</p>
							<p className="text-sm text-slate-600 mt-1">
								Complete the remaining fields before saving your
								profile.
							</p>

							<div className="flex flex-wrap gap-2 mt-4">
								{completionConfig.missingFields.map((field) => (
									<span
										key={field}
										className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-amber-200 text-xs font-semibold text-amber-700"
									>
										{field}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* TOP GRID */}
				<div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
					{/* LEFT */}
					<div className="space-y-6">
						{/* BASIC */}
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
							<div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
								<h2 className="text-lg font-bold text-slate-900">
									Basic Identity
								</h2>
								<p className="text-sm text-slate-500 mt-1">
									Your visible admin account information.
								</p>
							</div>

							<div className="p-6 space-y-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Full Name{" "}
										<span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<User2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="full_name"
											value={formData.full_name}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="Enter your full name"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-2">
											Email Address
										</label>
										<div className="relative">
											<Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
											<input
												type="text"
												name="email"
												value={formData.email}
												readOnly
												className={`${inputBase} pl-11 bg-slate-50 text-slate-500 cursor-not-allowed`}
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-2">
											Phone Number
										</label>
										<div className="relative">
											<PhoneCall className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
											<input
												type="text"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												className={`${inputBase} pl-11`}
												placeholder="Enter your phone number"
											/>
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Profile Photo URL{" "}
										<span className="text-rose-500">*</span>
									</label>
									<div className="flex flex-col sm:flex-row gap-4 items-start">
										<input
											type="text"
											name="avatar_url"
											value={formData.avatar_url}
											onChange={handleChange}
											className={inputBase}
											placeholder="Paste profile image URL"
										/>

										<div className="w-24 h-24 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
											{formData.avatar_url ? (
												<img
													src={formData.avatar_url}
													alt="Preview"
													className="w-full h-full object-cover"
												/>
											) : (
												<Upload className="w-5 h-5 text-slate-400" />
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* EMPLOYEE */}
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
							<div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
								<h2 className="text-lg font-bold text-slate-900">
									Employee & Signature
								</h2>
								<p className="text-sm text-slate-500 mt-1">
									Identity verification details for admin
									records.
								</p>
							</div>

							<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Employee ID
									</label>
									<div className="relative">
										<MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="employee_id"
											value={formData.employee_id}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="Enter employee ID"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Signature Image URL{" "}
										<span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<PenTool className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="signature_image_url"
											value={formData.signature_image_url}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="Paste signature image URL"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* RIGHT */}
					<div className="space-y-6">
						<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full">
							<div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
								<h2 className="text-lg font-bold text-slate-900">
									Professional Details
								</h2>
								<p className="text-sm text-slate-500 mt-1">
									Your administrative and office-level
									details.
								</p>
							</div>

							<div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Designation{" "}
										<span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<BriefcaseBusiness className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="designation"
											value={formData.designation}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="e.g. Platform Administrator"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Office Phone{" "}
										<span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="office_phone"
											value={formData.office_phone}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="Enter office contact number"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Alternate Email
									</label>
									<div className="relative">
										<AtSign className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="email"
											name="alternate_email"
											value={formData.alternate_email}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="Enter alternate email"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-2">
										Office Location
									</label>
									<div className="relative">
										<MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
										<input
											type="text"
											name="office_location"
											value={formData.office_location}
											onChange={handleChange}
											className={`${inputBase} pl-11`}
											placeholder="e.g. Admin Block, Room 204"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* BOTTOM ACTION BAR */}
				<div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-5 sm:px-6 py-5">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
						<div>
							<h3 className="text-base font-bold text-slate-900">
								Ready to save?
							</h3>
							<p className="text-sm text-slate-500 mt-1">
								Review all changes above, then save your updated
								admin profile.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-3 sm:min-w-[320px]">
							<button
								type="button"
								onClick={() => navigate("/admin/profile")}
								className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold transition-all duration-200"
							>
								Cancel
							</button>

							<button
								type="submit"
								disabled={loading}
								className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all duration-200"
							>
								<CheckCircle2 className="w-4 h-4" />
								{loading
									? "Saving..."
									: mode === "complete"
										? "Complete Profile"
										: "Save Changes"}
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default AdminProfileForm;
