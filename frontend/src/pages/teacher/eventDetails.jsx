import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { getEventById } from "../../services/eventServices";
import EventSummary from "../../components/event/eventDetails/eventSummary";
import TeacherEventDetailsTabs from "@/components/teacher/eventDetails/TeacherEventDetailsTabs";
import EventDetailsRegistration from "@/components/event/eventDetails/eventDetailsRegistration";
import EventDetailsTeam from "@/components/event/eventDetails/eventDetailsTeam";
import TeacherStudentCoordinators from "@/components/teacher/eventDetails/TeacherStudentCoordinators";
import TeacherEventDetailsOverview from "@/components/teacher/eventDetails/TeacherEventDetailsOverview";
import TeacherEventDetailsRegistration from "@/components/teacher/eventDetails/TeacherEventDetailsRegistration";

// Lightweight UI primitives (no shadcn dependency)
const Card = ({ children, className = "" }) => (
	<div
		className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`}
	>
		{children}
	</div>
);
const Button = ({ children, variant = "primary", ...props }) => {
	const base = "px-4 py-2 rounded-xl text-sm font-semibold transition";
	const styles = {
		primary: "bg-blue-600 text-white hover:bg-blue-700",
		ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
		danger: "bg-red-600 text-white hover:bg-red-700",
	};
	return (
		<button className={`${base} ${styles[variant]}`} {...props}>
			{children}
		</button>
	);
};

const Badge = ({ children, tone = "slate" }) => {
	const map = {
		green: "bg-green-100 text-green-700",
		blue: "bg-blue-100 text-blue-700",
		amber: "bg-amber-100 text-amber-700",
		red: "bg-red-100 text-red-700",
		slate: "bg-slate-100 text-slate-700",
	};
	return (
		<span
			className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[tone]}`}
		>
			{children}
		</span>
	);
};
const Progress = ({ value }) => (
	<div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
		<div
			className="h-full rounded-full bg-indigo-600 transition-all duration-500"
			style={{ width: `${value}%` }}
		/>
	</div>
);

export default function EventDetails() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState("overview");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await getEventById(id);
				setEvent(res.event);
				console.log(res.event);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="animate-spin" />
			</div>
		);
	}

	if (!event) return <div className="p-6">Event not found</div>;

	const phase = (() => {
		const now = new Date();
		const s = new Date(event.schedule.startAt);
		const e = new Date(event.schedule.endAt);
		if (now < s) return { label: "Upcoming", tone: "blue" };
		if (now > e) return { label: "Completed", tone: "slate" };
		return { label: "Ongoing", tone: "green" };
	})();

	const limit = event.registration.config.limit || 0;
	const filled = event.stats.totalRegistrations || 0;
	const pct = limit ? Math.round((filled / limit) * 100) : 0;

	return (
		<div className="min-h-screen bg-slate-50 p-6 space-y-6">
			{/* Header */}
			{/* Header */}
<div className="flex items-center justify-between">

	<Button
		variant="ghost"
		onClick={() => navigate("/teacher/events")}
		className="flex items-center gap-2"
	>
		<ArrowLeft size={18} />
		Back to My Events
	</Button>

	<div className="flex gap-2">
		<Badge tone="slate">{event.meta.status}</Badge>
		<Badge tone={phase.tone}>{phase.label}</Badge>
	</div>

</div>

{/* Hero */}
<Card className="overflow-hidden">

	<div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 px-8 py-7 text-white">

		<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

			<div>

				<p className="text-sm uppercase tracking-wider text-indigo-100">
					{event.basic.category}
				</p>

				<h1 className="mt-2 text-4xl font-bold">
					{event.basic.title}
				</h1>

				{event.basic.subtitle && (
					<p className="mt-2 text-indigo-100">
						{event.basic.subtitle}
					</p>
				)}

			</div>

			<div className="grid grid-cols-2 gap-4">

				<div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

					<p className="text-3xl font-bold">
						{event.stats.totalRegistrations}
					</p>

					<p className="text-sm text-indigo-100">
						Registrations
					</p>

				</div>

				<div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

					<p className="text-lg font-semibold">
						{new Date(
							event.schedule.startAt
						).toLocaleDateString()}
					</p>

					<p className="text-sm text-indigo-100">
						Event Date
					</p>

				</div>

			</div>

		</div>

	</div>

	<div className="grid gap-5 border-t border-slate-200 bg-white p-6 md:grid-cols-3">

		<div>

			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
				Venue
			</p>

			<p className="mt-1 font-medium text-slate-700">
				{event.schedule.venue || "Online"}
			</p>

		</div>

		<div>

			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
				Event Type
			</p>

			<p className="mt-1 font-medium text-slate-700 capitalize">
				{event.basic.eventType}
			</p>

		</div>

		<div>

			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
				Participation
			</p>

			<p className="mt-1 font-medium text-slate-700 capitalize">
				{event.registration.config.participationType || "Individual"}
			</p>

		</div>

	</div>

</Card>
<TeacherEventDetailsTabs
	activeTab={tab}
	onTabChange={setTab}
/>
			{/* Overview */}
			{tab === "overview" && (
	<TeacherEventDetailsOverview event={event} />
)}

			{/* Registration */}
			{tab === "registration" && (
    <TeacherEventDetailsRegistration event={event} />
)}

			{/* Team */}
{tab === "team" && (
	<TeacherStudentCoordinators event={event} />
)}
			{/* Coordinators & Form Fields */}
			{tab === "people" && <EventDetailsCoordinators event={event} />}
		</div>
	);
}
