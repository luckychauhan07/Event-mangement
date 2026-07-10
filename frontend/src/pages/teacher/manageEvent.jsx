import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getEventById } from "@/services/eventServices";
import TeacherEventRegistrations from "@/components/teacher/manageEvent/TeacherEventRegistrations";
import TeacherEventTeams from "@/components/teacher/manageEvent/TeacherEventTeams";

export default function ManageEvent() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("registrations");

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const res = await getEventById(id);
				setEvent(res.event);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchEvent();
	}, [id]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="p-6">
				Event not found.
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 p-6 space-y-6">

			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
			>
				<ArrowLeft size={18} />
				Back
			</button>
            {/* Header */}
			<div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white shadow-lg">

	<h1 className="text-3xl font-bold">
		{event.basic.title}
	</h1>

	<p className="mt-2 text-indigo-100">
		Manage registrations, participants and results for this event.
	</p>

	<div className="mt-6 flex flex-wrap gap-3">

		<span className="rounded-full bg-white/20 px-4 py-2 text-sm">
			{event.basic.category}
		</span>

		<span className="rounded-full bg-white/20 px-4 py-2 text-sm capitalize">
			{event.schedule.mode}
		</span>

		<span className="rounded-full bg-white/20 px-4 py-2 text-sm capitalize">
			{event.meta.status}
		</span>

	</div>

</div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<p className="text-sm text-slate-500">
			Registrations
		</p>

		<h2 className="mt-2 text-3xl font-bold text-slate-800">
			{event.stats.totalRegistrations}
		</h2>
	</div>

	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<p className="text-sm text-slate-500">
			Teams
		</p>

		<h2 className="mt-2 text-3xl font-bold text-slate-800">
			{event.stats.totalTeams || 0}
		</h2>
	</div>

	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<p className="text-sm text-slate-500">
			Event Status
		</p>

		<h2 className="mt-2 text-xl font-bold capitalize text-indigo-700">
			{event.meta.status}
		</h2>
	</div>

	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
		<p className="text-sm text-slate-500">
			Registration
		</p>

		<h2 className="mt-2 text-xl font-bold text-emerald-700">
			{event.registration.config.required ? "Enabled" : "Disabled"}
		</h2>
	</div>

</div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

	<div className="flex border-b border-slate-200">

		<button
			onClick={() => setActiveTab("registrations")}
			className={`px-6 py-4 font-medium ${
				activeTab === "registrations"
					? "border-b-2 border-indigo-600 text-indigo-600"
					: "text-slate-500"
			}`}
		>
			Registrations
		</button>

		{event.team.enabled && (
			<button
				onClick={() => setActiveTab("teams")}
				className={`px-6 py-4 font-medium ${
					activeTab === "teams"
						? "border-b-2 border-indigo-600 text-indigo-600"
						: "text-slate-500"
				}`}
			>
				Teams
			</button>
		)}

		<button
			onClick={() => setActiveTab("announcements")}
			className={`px-6 py-4 font-medium ${
				activeTab === "announcements"
					? "border-b-2 border-indigo-600 text-indigo-600"
					: "text-slate-500"
			}`}
		>
			Announcements
		</button>

		<button
			onClick={() => setActiveTab("results")}
			className={`px-6 py-4 font-medium ${
				activeTab === "results"
					? "border-b-2 border-indigo-600 text-indigo-600"
					: "text-slate-500"
			}`}
		>
			Results
		</button>

	</div>

	<div className="p-6">

		{activeTab === "registrations" && (
	<TeacherEventRegistrations eventId={id} />
)}

{activeTab === "teams" && event.team.enabled && (
	<TeacherEventTeams eventId={id} />
)}
		{activeTab === "announcements" && <div>Announcements</div>}

		

	</div>

</div>

		</div>
	);
}