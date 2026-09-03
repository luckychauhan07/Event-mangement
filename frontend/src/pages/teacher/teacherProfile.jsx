import { useEffect, useState } from "react";
import {
	Bell,
	CheckCircle2,
	Mail,
	MapPin,
	Phone,
	Save,
	ShieldCheck,
	User2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getTeacherProfile,
	updateTeacherProfile,
} from "../../services/eventServices";

const emptyProfile = {
	full_name: "",
	email: "",
	phone: "",
	department: "",
	bio: "",
	avatar_url: "",
	email_alerts: true,
	event_reminders: true,
	team_updates: true,
};

const TeacherProfile = () => {
	const [profile, setProfile] = useState(emptyProfile);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		document.title = "My Profile - Teacher Panel";

		const loadProfile = async () => {
			try {
				const response = await getTeacherProfile();
				setProfile({ ...emptyProfile, ...(response.data || {}) });
			} catch (requestError) {
				setError(
					requestError?.response?.data?.message ||
						"Unable to load your profile.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, []);

	const updateField = (field, value) => {
		setProfile((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (!profile.full_name.trim() || saving) return;

		try {
			setSaving(true);
			const response = await updateTeacherProfile(profile);
			toast.success(response.message || "Profile updated successfully");
		} catch (requestError) {
			toast.error(
				requestError?.response?.data?.message ||
					"Failed to update your profile.",
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-500 shadow-sm">
					Loading profile...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
				{error}
			</div>
		);
	}

	const avatar =
		profile.avatar_url ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(
			profile.full_name || "Teacher",
		)}&background=0f172a&color=fff&size=256`;

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
				<div className="h-2 bg-linear-to-r from-indigo-600 via-blue-600 to-sky-500" />
				<div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
					<img
						src={avatar}
						alt={profile.full_name || "Teacher profile"}
						className="h-24 w-24 rounded-3xl border border-slate-200 object-cover shadow-sm"
					/>
					<div>
						<div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
							<ShieldCheck size={14} /> Teacher Account
						</div>
						<h1 className="text-3xl font-bold tracking-tight text-slate-900">
							{profile.full_name || "Teacher Profile"}
						</h1>
						<p className="mt-2 text-sm text-slate-500">
							Manage your contact details and teacher notification
							preferences.
						</p>
					</div>
				</div>
			</section>

			<form onSubmit={handleSubmit} className="space-y-6">
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="mb-6 flex items-center gap-3">
						<div className="rounded-xl bg-blue-50 p-2 text-blue-600">
							<User2 size={20} />
						</div>
						<div>
							<h2 className="font-semibold text-slate-900">
								Personal Information
							</h2>
							<p className="text-sm text-slate-500">
								Keep your teacher identity up to date.
							</p>
						</div>
					</div>

					<div className="grid gap-5 md:grid-cols-2">
						<label className="text-sm font-medium text-slate-700">
							Full name <span className="text-rose-500">*</span>
							<input
								value={profile.full_name}
								onChange={(eventChange) =>
									updateField(
										"full_name",
										eventChange.target.value,
									)
								}
								className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
							/>
						</label>
						<label className="text-sm font-medium text-slate-700">
							Email address
							<div className="relative mt-2">
								<Mail
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={17}
								/>
								<input
									value={profile.email}
									readOnly
									className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-slate-500"
								/>
							</div>
						</label>
						<label className="text-sm font-medium text-slate-700">
							Phone number
							<div className="relative mt-2">
								<Phone
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={17}
								/>
								<input
									value={profile.phone}
									onChange={(eventChange) =>
										updateField(
											"phone",
											eventChange.target.value,
										)
									}
									className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-10 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
								/>
							</div>
						</label>
						<label className="text-sm font-medium text-slate-700">
							Department
							<div className="relative mt-2">
								<MapPin
									className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
									size={17}
								/>
								<input
									value={profile.department}
									onChange={(eventChange) =>
										updateField(
											"department",
											eventChange.target.value,
										)
									}
									className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-10 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
								/>
							</div>
						</label>
						<label className="text-sm font-medium text-slate-700 md:col-span-2">
							Profile photo URL
							<input
								value={profile.avatar_url}
								onChange={(eventChange) =>
									updateField(
										"avatar_url",
										eventChange.target.value,
									)
								}
								placeholder="https://..."
								className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
							/>
						</label>
						<label className="text-sm font-medium text-slate-700 md:col-span-2">
							Bio
							<textarea
								value={profile.bio}
								onChange={(eventChange) =>
									updateField("bio", eventChange.target.value)
								}
								rows={4}
								className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
							/>
						</label>
					</div>
				</section>

				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="mb-5 flex items-center gap-3">
						<div className="rounded-xl bg-amber-50 p-2 text-amber-600">
							<Bell size={20} />
						</div>
						<div>
							<h2 className="font-semibold text-slate-900">
								Notifications
							</h2>
							<p className="text-sm text-slate-500">
								Choose which updates you receive.
							</p>
						</div>
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						{[
							["email_alerts", "Email alerts"],
							["event_reminders", "Event reminders"],
							["team_updates", "Team updates"],
						].map(([field, label]) => (
							<label
								key={field}
								className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50"
							>
								<input
									type="checkbox"
									checked={Boolean(profile[field])}
									onChange={(eventChange) =>
										updateField(
											field,
											eventChange.target.checked,
										)
									}
									className="h-4 w-4 accent-blue-600"
								/>
								<span className="text-sm font-medium text-slate-700">
									{label}
								</span>
							</label>
						))}
					</div>
				</section>

				<div className="flex justify-end">
					<button
						type="submit"
						disabled={saving || !profile.full_name.trim()}
						className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{saving ? (
							<CheckCircle2 size={17} />
						) : (
							<Save size={17} />
						)}
						{saving ? "Saving..." : "Save Profile"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default TeacherProfile;
