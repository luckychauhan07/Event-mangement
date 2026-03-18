import { Users, GraduationCap, Building2, Calendar, School } from "lucide-react";

const AudienceStep = ({ eventData, setEventData }) => {
	const update = (field, value) => {
		setEventData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const toggle = (field, value) => {
		setEventData((prev) => {
			const arr = prev[field] || [];
			const updated = arr.includes(value)
				? arr.filter((v) => v !== value)
				: [...arr, value];

			return { ...prev, [field]: updated };
		});
	};

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	const Card = ({ active, onClick, children }) => (
		<div
			onClick={onClick}
			className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
			${
				active
					? "border-amber-500 bg-amber-50 shadow-sm"
					: "border-slate-200 hover:border-amber-300 hover:bg-slate-50"
			}
			`}
		>
			{children}
		</div>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
					<Users size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">Target Audience</h3>
					<p className="text-sm text-slate-500">Define your target audience with precision</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Audience Role */}
				<div className="space-y-3">
					<h3 className="font-medium text-slate-700 flex items-center gap-2">
						<Users size={16} className="text-amber-500" />
						Audience Role
					</h3>

					{["Students", "Faculty", "Staff", "External Guests"].map(
						(role) => (
							<Card
								key={role}
								active={eventData.audienceRoles?.includes(role)}
								onClick={() => toggle("audienceRoles", role)}
							>
								<div className="flex items-center justify-between">
									<span className="font-medium text-slate-700">{role}</span>

									{eventData.audienceRoles?.includes(
										role,
									) && (
										<span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
											✓
										</span>
									)}
								</div>
							</Card>
						),
					)}
				</div>

				{/* Course + Department */}
				<div className="space-y-5">
					<div>
						<h3 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
							<GraduationCap size={16} className="text-amber-500" />
							Course
						</h3>

						<select
							className={inputStyle}
							value={eventData.course || "all"}
							onChange={(e) => update("course", e.target.value)}
						>
							<option value="all">All Courses</option>
							<option value="btech">B.Tech</option>
							<option value="mtech">M.Tech</option>
							<option value="mba">MBA</option>
							<option value="bca">BCA</option>
						</select>
					</div>

					<div>
						<h3 className="font-medium text-slate-700 mb-2 flex items-center gap-2">
							<Building2 size={16} className="text-amber-500" />
							Department
						</h3>

						<select
							className={inputStyle}
							value={eventData.department || "all"}
							onChange={(e) =>
								update("department", e.target.value)
							}
						>
							<option value="all">All Departments</option>
							<option value="cse">CSE</option>
							<option value="ece">ECE</option>
							<option value="eee">EEE</option>
							<option value="me">Mechanical</option>
							<option value="ce">Civil</option>
						</select>
					</div>
				</div>

				{/* Student Year */}
				<div className="space-y-3">
					<h3 className="font-medium text-slate-700 flex items-center gap-2">
						<Calendar size={16} className="text-amber-500" />
						Student Year
					</h3>

					{[
						"1st Year",
						"2nd Year",
						"3rd Year",
						"4th Year",
						"5th Year",
						"Alumni",
					].map((year) => (
						<Card
							key={year}
							active={eventData.studentYears?.includes(year)}
							onClick={() => toggle("studentYears", year)}
						>
							<div className="flex justify-between">
								<span className="text-slate-700">{year}</span>

								{eventData.studentYears?.includes(year) && (
									<span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
										✓
									</span>
								)}
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* Inter College */}
			<div className="border-2 border-slate-200 rounded-xl p-5 bg-slate-50">
				<div className="flex items-center gap-2 mb-1">
					<School size={18} className="text-amber-500" />
					<h3 className="font-medium text-slate-800">
						Inter-College Participation
					</h3>
				</div>

				<p className="text-sm text-slate-500 mb-4">
					Allow participants from other colleges
				</p>

				<div className="flex gap-4">
					<Card
						active={eventData.interCollege === "no"}
						onClick={() => update("interCollege", "no")}
					>
						<span className="text-slate-700">No (Only this institution)</span>
					</Card>

					<Card
						active={eventData.interCollege === "yes"}
						onClick={() => update("interCollege", "yes")}
					>
						<span className="text-slate-700">Yes (Open to all)</span>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default AudienceStep;
