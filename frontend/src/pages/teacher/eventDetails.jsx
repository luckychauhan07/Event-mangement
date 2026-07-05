import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { getEventById } from "../../services/eventServices";
import EventSummary from "../../components/event/eventDetails/eventSummary";
import TeacherEventDetailsTabs from "@/components/teacher/eventDetails/TeacherEventDetailsTabs";
import EventDetailsOverview from "@/components/event/eventDetails/eventDetailsOverview";
import EventDetailsRegistration from "@/components/event/eventDetails/eventDetailsRegistration";
import EventDetailsCoordinators from "@/components/event/eventDetails/eventDetailsCoordinators";
import EventDetailsTeam from "@/components/event/eventDetails/eventDetailsTeam";
import TeacherStudentCoordinators from "@/components/teacher/eventDetails/TeacherStudentCoordinators";

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
			<div className="flex items-center justify-between">
				<Button
	variant="ghost"
	onClick={() => navigate("/teacher/events")}
>
	<ArrowLeft className="inline mr-2" />
	Back to My Events
</Button>
				<div className="flex items-center gap-2">
					<Badge tone="slate">{event.meta.status}</Badge>
					<Badge tone={phase.tone}>{phase.label}</Badge>
				</div>
			</div>

			{/* Hero / Summary */}
			<Card className="p-6 bg-gradient-to-br from-white to-blue-50">
				<EventSummary event={event} />

				{limit ? (
					<div className="mt-4">
						<Progress value={pct} />
						<p className="text-xs text-slate-500 mt-1">
							{filled} of {limit} filled
						</p>
					</div>
				) : null}
			</Card>
<TeacherEventDetailsTabs
	activeTab={tab}
	onTabChange={setTab}
/>
			{/* Overview */}
			{tab === "overview" && <EventDetailsOverview event={event} />}

			{/* Registration */}
			{tab === "registration" && (
				<EventDetailsRegistration event={event} />
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
