import {
	Trophy,
	BarChart3,
	Award,
	CheckCircle,
	Users,
	Target,
} from "lucide-react";
import ToggleCard from "../ToggleCard";
import { forwardRef, useImperativeHandle } from "react";

const ResultStep = forwardRef(({ eventData, setEventData }, ref) => {
	const config = eventData.resultConfig || {};
	const isPositiveInteger = (value) => {
		if (value === "" || value === null || value === undefined) {
			return false;
		}

		const parsedValue = Number(value);
		return Number.isInteger(parsedValue) && parsedValue > 0;
	};

	const update = (field, value) => {
		setEventData((prev) => ({
			...prev,
			resultConfig: {
				...config,
				[field]: value,
			},
		}));
	};

	const toggle = (field) => {
		update(field, !config[field]);
	};
	useImperativeHandle(ref, () => ({
		validate() {
			if (!config.enabled) {
				return true;
			}

			if (!config.type) {
				return "Select a result type";
			}

			if (config.type !== "participation") {
				if (!isPositiveInteger(config.positions)) {
					return "Number of winners must be a whole number greater than 0";
				}
			}

			if (config.type === "score") {
				if (!isPositiveInteger(config.judgesCount)) {
					return "Number of judges must be a whole number greater than 0";
				}

				const criteria = (config.criteria || []).filter((criterion) =>
					String(criterion).trim(),
				);
				if (criteria.length === 0) {
					return "Add at least one evaluation criterion";
				}

				const uniqueCriteria = new Set(
					criteria.map((criterion) =>
						String(criterion).trim().toLowerCase(),
					),
				);
				if (uniqueCriteria.size !== criteria.length) {
					return "Evaluation criteria should not contain duplicates";
				}
			}

			return true;
		},
	}));
	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
					<Trophy size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Result Configuration
					</h3>
					<p className="text-sm text-slate-500">
						Define how results will be evaluated and stored
					</p>
				</div>
			</div>

			{/* Enable Results */}
			<ToggleCard
				active={config.enabled}
				onClick={() => toggle("enabled")}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<CheckCircle
							size={20}
							className={
								config.enabled
									? "text-yellow-500"
									: "text-slate-400"
							}
						/>
						<span className="font-medium text-slate-700">
							Enable Results
						</span>
					</div>
					<div
						className={`w-10 h-6 rounded-full transition-all duration-200 ${config.enabled ? "bg-yellow-500" : "bg-slate-300"}`}
					>
						<div
							className={`w-4 h-4 rounded-full bg-white shadow-sm mt-1 transition-all duration-200 ${config.enabled ? "ml-5" : "ml-1"}`}
						></div>
					</div>
				</div>
			</ToggleCard>

			{/* Result Type */}
			{config.enabled && (
				<div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
					<h3 className="font-medium text-slate-700 flex items-center gap-2">
						<Target size={16} className="text-yellow-500" />
						Result Type
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<ToggleCard
							active={config.type === "simple"}
							onClick={() => update("type", "simple")}
						>
							<div className="flex flex-col items-center text-center gap-2">
								<Trophy
									size={24}
									className={
										config.type === "simple"
											? "text-yellow-500"
											: "text-slate-400"
									}
								/>
								<span className="font-medium text-slate-700">
									Position Based
								</span>
								<span className="text-xs text-slate-500">
									1st, 2nd, 3rd...
								</span>
							</div>
						</ToggleCard>

						{/* <ToggleCard
							active={config.type === "score"}
							onClick={() => update("type", "score")}
						>
							<div className="flex flex-col items-center text-center gap-2">
								<BarChart3
									size={24}
									className={
										config.type === "score"
											? "text-yellow-500"
											: "text-slate-400"
									}
								/>
								<span className="font-medium text-slate-700">
									Score Based
								</span>
								<span className="text-xs text-slate-500">
									Points & criteria
								</span>
							</div>
						</ToggleCard> */}

						<ToggleCard
							active={config.type === "participation"}
							onClick={() => update("type", "participation")}
						>
							<div className="flex flex-col items-center text-center gap-2">
								<Award
									size={24}
									className={
										config.type === "participation"
											? "text-yellow-500"
											: "text-slate-400"
									}
								/>
								<span className="font-medium text-slate-700">
									Participation Only
								</span>
								<span className="text-xs text-slate-500">
									Certificates for all
								</span>
							</div>
						</ToggleCard>
					</div>
				</div>
			)}

			{/* Configuration */}
			{config.enabled && config.type !== "participation" && (
				<div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
					{/* Positions */}
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1.5">
							Number of Winners
						</label>

						<input
							type="number"
							min="1"
							step="1"
							className={inputStyle}
							placeholder="e.g. 3"
							value={config.positions || ""}
							onChange={(e) =>
								update("positions", e.target.value)
							}
						/>
						<p className="text-xs text-slate-400 mt-1">
							Number of winning positions to track
						</p>
					</div>

					{/* Score Based */}
					{config.type === "score" && (
						<>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1.5">
									Number of Judges
								</label>

								<input
									type="number"
									min="1"
									step="1"
									className={inputStyle}
									placeholder="e.g. 3"
									value={config.judgesCount || ""}
									onChange={(e) =>
										update("judgesCount", e.target.value)
									}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1.5">
									Evaluation Criteria
								</label>

								<input
									placeholder="e.g. Innovation, Presentation, Technical Skills"
									className={inputStyle}
									value={config.criteria?.join(", ") || ""}
									onChange={(e) =>
										update(
											"criteria",
											e.target.value
												.split(",")
												.map((s) => s.trim()),
										)
									}
								/>
								<p className="text-xs text-slate-400 mt-1">
									Separate criteria with commas
								</p>
							</div>
						</>
					)}

					{/* Common Options */}
					<div className="flex flex-wrap gap-6 pt-2">
						<label className="flex items-center gap-3 text-sm cursor-pointer">
							<input
								type="checkbox"
								checked={config.allowTie || false}
								onChange={() => toggle("allowTie")}
								className="w-4 h-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500"
							/>
							<span className="text-slate-700 font-medium">
								Allow Tie
							</span>
						</label>

						<label className="flex items-center gap-3 text-sm cursor-pointer">
							<input
								type="checkbox"
								checked={config.teamBased || false}
								onChange={() => toggle("teamBased")}
								className="w-4 h-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-500"
							/>
							<span className="text-slate-700 font-medium flex items-center gap-1.5">
								<Users size={14} />
								Team Based Results
							</span>
						</label>
					</div>
				</div>
			)}

			{/* Info Box */}
			{config.enabled && config.type === "participation" && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
					<Award
						size={20}
						className="text-yellow-500 flex-shrink-0 mt-0.5"
					/>
					<div>
						<p className="text-sm font-medium text-yellow-800">
							Participation Mode
						</p>
						<p className="text-xs text-yellow-600 mt-1">
							All participants will receive participation
							certificates. No winners or scores will be tracked.
						</p>
					</div>
				</div>
			)}
		</div>
	);
});

export default ResultStep;
