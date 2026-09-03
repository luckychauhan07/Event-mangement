import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { getAllEvents } from "../../services/eventServices";
import {
	getRegistrationLabel,
	getCurrentUserProfile,
	getUserRegistrations,
} from "../../utils/userEventUtils";

const UserProfile = () => {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);
	const user = useMemo(() => getCurrentUserProfile(), []);

	useEffect(() => {
		const loadProfileStats = async () => {
			try {
				const data = await getAllEvents();
				setEvents(data?.events || []);
			} catch (error) {
				setEvents([]);
			} finally {
				setLoading(false);
			}
		};

		loadProfileStats();
	}, []);

	const registrations = useMemo(() => getUserRegistrations(events), [events]);

	const stats = useMemo(
		() => ({
			registered: registrations.length,
			approved: registrations.filter((event) => // Mapped to Confirmed
				getRegistrationLabel(event) === "Confirmed",
			).length,
			pending: registrations.filter((event) => // Mapped to Pending Approval
				getRegistrationLabel(event) === "Pending Approval",
			).length,
		}),
		[registrations],
	);

	const initials = (user?.name || "User")
	.split(" ")
	.map((part) => part[0])
	.join("")
	.slice(0, 2)
	.toUpperCase();

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
					User Profile
				</p>
				<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
					My Profile
				</h1>
				<p className="mt-2 text-sm leading-6 text-slate-600">
					Review your account details and participation summary in one
					place.
				</p>
			</section>

			<section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
					<div className="flex items-center gap-5">
						<div className="grid h-28 w-28 place-items-center rounded-full bg-linear-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white shadow-lg">
							{initials}
						</div>

						<div>
							<h2 className="text-2xl font-semibold text-slate-900">
								{user?.name || "User Name"}
							</h2>
							<p className="mt-1 text-sm text-slate-500">
								User Account
							</p>
							<span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
								User
							</span>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-3 lg:w-[420px]">
						<div className="rounded-2xl bg-slate-50 p-4 text-center">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Registered
							</p>
							<p className="mt-3 text-3xl font-bold text-slate-900">
								{loading ? "-" : stats.registered}
							</p>
						</div>
						<div className="rounded-2xl bg-emerald-50 p-4 text-center">
							<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
								Approved
							</p>
							<p className="mt-3 text-3xl font-bold text-emerald-800">
								{loading ? "-" : stats.approved}
							</p>
						</div>
						<div className="rounded-2xl bg-amber-50 p-4 text-center">
							<p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
								Pending
							</p>
							<p className="mt-3 text-3xl font-bold text-amber-800">
								{loading ? "-" : stats.pending}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="grid gap-4 md:grid-cols-2">
				<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-900">
						Account Information
					</h2>
					<div className="mt-5 space-y-4">
						<div className="rounded-2xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Full Name
							</p>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{user?.name || "Not available"}
							</p>
						</div>
						<div className="rounded-2xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Role
							</p>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{user?.role || "student"}
							</p>
						</div>
						<div className="rounded-2xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								User ID
							</p>
							<p className="mt-2 text-sm font-medium text-slate-800">
								{user?.id || "Not available"}
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-900">
						Contact Details
					</h2>
					<div className="mt-5 space-y-4">
						<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
							<Mail size={18} className="mt-0.5 text-blue-600" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Email
								</p>
								<p className="mt-2 text-sm font-medium text-slate-800">
									{user?.email || "Not available"}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
							<Phone size={18} className="mt-0.5 text-blue-600" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Phone
								</p>
								<p className="mt-2 text-sm font-medium text-slate-800">
									{user?.phone || "Not available"}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
							<UserRound size={18} className="mt-0.5 text-blue-600" />
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Status
								</p>
								<p className="mt-2 text-sm font-medium text-slate-800">
									{user?.status || "Active"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default UserProfile;
