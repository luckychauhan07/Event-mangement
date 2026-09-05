import { useEffect, useState } from "react";
import { getEventResults } from "@/services/eventServices";
import TeacherDeclareResults from "@/components/teacher/manageEvent/TeacherDeclareResults";
const TeacherEventResults = ({ event }) => {
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const eventEnd = new Date(event.schedule?.endAt || "").getTime();
	const eventCompleted =
		event.meta?.status === "completed" ||
		(Number.isFinite(eventEnd) && eventEnd <= Date.now());

	useEffect(() => {
		const fetchResults = async () => {
			try {
				const res = await getEventResults(event.id);
				setResults(res.results || []);
			} catch (error) {
				console.error("Error fetching results:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [event.id]);
	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-slate-800">
							Event Results
						</h2>

						<p className="mt-2 text-slate-600">
							Declare winners and publish results after the event
							is completed.
						</p>
					</div>

					<button
						disabled={!eventCompleted}
						onClick={() => setShowForm(!showForm)}
						className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{showForm ? "Close" : "Declare Results"}
					</button>
				</div>
				{!eventCompleted && (
					<p className="mt-3 text-sm text-amber-700">
						Results can be declared after the event end time.
					</p>
				)}
			</div>

			<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<p className="text-sm text-slate-500">Result Status</p>

					<p className="mt-2 text-lg font-semibold text-amber-600">
						{results.length ? "Declared" : "Not Declared"}
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<p className="text-sm text-slate-500">Event Type</p>

					<p className="mt-2 font-medium">
						{event.team.enabled ? "Team Event" : "Individual Event"}
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<p className="text-sm text-slate-500">Participants</p>

					<p className="mt-2 font-medium">
						{event.stats.totalRegistrations}
					</p>
				</div>
			</div>
			{showForm && <TeacherDeclareResults event={event} />}

			{loading ? (
				<div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
					<p className="text-slate-500">Loading results...</p>
				</div>
			) : results.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
					<h3 className="text-lg font-semibold text-slate-700">
						No results declared
					</h3>

					<p className="mt-2 text-slate-500">
						Declare winners once the event has concluded.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{results.map((result) => (
						<div
							key={result.result_id}
							className="rounded-xl border border-slate-200 bg-white p-5"
						>
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold">
									Position {result.position}
								</h3>

								<span className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">
									{result.rank_label}
								</span>
							</div>

							<p className="mt-3 font-medium text-slate-700">
								{result.team_name || result.full_name}
							</p>

							{result.score && (
								<p className="mt-1 text-sm text-slate-500">
									Score: {result.score}
									{result.max_score
										? ` / ${result.max_score}`
										: ""}
								</p>
							)}

							{result.special_award && (
								<p className="mt-1 text-sm text-amber-700">
									🏆 {result.special_award}
								</p>
							)}

							{result.remarks && (
								<p className="mt-2 text-sm text-slate-500">
									{result.remarks}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default TeacherEventResults;
