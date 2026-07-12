import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight, UserCheck, CalendarCheck2 } from "lucide-react";

const Notifications = () => {
	const navigate = useNavigate();

	useEffect(() => {
		document.title = "Notifications - Admin Panel";
	}, []);

	return (
		<div className="min-h-screen bg-slate-50 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				{/* HEADER */}
				<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />

					<div className="p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
						<div className="max-w-2xl">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide mb-4">
								<Bell className="w-3.5 h-3.5" />
								Admin Notifications
							</div>

							<h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
								Notifications
							</h1>

							<p className="text-sm text-slate-600 leading-relaxed mt-4 max-w-xl">
								Track important updates, approvals, and system
								messages from one place.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<button
								onClick={() =>
									navigate("/admin/teacher-approvals")
								}
								className="group flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100 px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
										<UserCheck className="h-6 w-6" />
									</div>

									<div className="text-left">
										<p className="text-base font-semibold text-slate-900">
											Teacher Approvals
										</p>
										<p className="text-sm text-slate-600">
											Review pending teacher requests
										</p>
									</div>
								</div>

								<ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1" />
							</button>

							<button
								onClick={() =>
									navigate("/admin/event-approvals")
								}
								className="group flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
										<CalendarCheck2 className="h-6 w-6" />
									</div>

									<div className="text-left">
										<p className="text-base font-semibold text-slate-900">
											Event Approvals
										</p>
										<p className="text-sm text-slate-600">
											Approve or reject event requests
										</p>
									</div>
								</div>

								<ArrowRight className="h-5 w-5 text-slate-500 transition-transform group-hover:translate-x-1" />
							</button>
						</div>
					</div>
				</div>

				{/* NOTIFICATION LIST */}
				<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="px-7 py-5 border-b border-slate-200 bg-slate-50/70">
						<h2 className="text-xl font-bold text-slate-900">
							Recent Notifications
						</h2>
						<p className="text-sm text-slate-500 mt-1">
							Your latest alerts and updates will appear here.
						</p>
					</div>

					<div className="p-10 flex flex-col items-center justify-center text-center">
						<div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
							<Bell className="w-7 h-7 text-slate-400" />
						</div>

						<h3 className="text-lg font-bold text-slate-900">
							No notifications yet
						</h3>
						<p className="text-sm text-slate-500 mt-2 max-w-md">
							When there are approvals, event updates, or system
							alerts, they’ll show up here.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Notifications;
