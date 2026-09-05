import { useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { getEventResults } from "../../services/eventServices";

const EventResultsPanel = ({ eventId, title = "Event Results" }) => {
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadResults = async () => {
			try {
				const response = await getEventResults(eventId);
				setResults(response?.results || []);
			} catch (requestError) {
				setError(
					requestError.response?.data?.message ||
						"Unable to load event results.",
				);
			} finally {
				setLoading(false);
			}
		};

		loadResults();
	}, [eventId]);

	return (
		<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<div className="flex items-center gap-3">
				<Award className="text-amber-600" size={21} />
				<div>
					<h2 className="text-xl font-semibold text-slate-900">{title}</h2>
					<p className="mt-1 text-sm text-slate-500">
						Declared results and winner details.
					</p>
				</div>
			</div>

			{loading ? (
				<div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
					<Loader2 size={16} className="animate-spin" /> Loading results...
				</div>
			) : error ? (
				<p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>
			) : results.length === 0 ? (
				<p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
					Results have not been declared yet.
				</p>
			) : (
				<div className="mt-6 grid gap-3 md:grid-cols-2">
					{results.map((result) => (
						<div key={result.result_id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
							<div className="flex items-center justify-between gap-3">
								<span className="font-semibold text-slate-900">
									Position {result.position}
								</span>
								<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
									{result.rank_label || "Awarded"}
								</span>
							</div>
							<p className="mt-3 font-medium text-slate-700">
								{result.team_name || result.full_name || "Participant"}
							</p>
							{result.score !== null && result.score !== undefined && (
								<p className="mt-1 text-sm text-slate-500">Score: {result.score}</p>
							)}
							{result.special_award && (
								<p className="mt-1 text-sm text-amber-700">{result.special_award}</p>
							)}
							{result.remarks && <p className="mt-2 text-sm text-slate-500">{result.remarks}</p>}
						</div>
					))}
				</div>
			)}
		</section>
	);
};

export default EventResultsPanel;
