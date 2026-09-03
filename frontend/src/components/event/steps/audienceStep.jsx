import { Users } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";

const AudienceStep = forwardRef(({ eventData, setEventData }, ref) => {
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

	const toggleAll = (field, options) => {
		setEventData((prev) => {
			const current = prev[field] || [];
			const values = options.map((o) => o.value || o);

			const allSelected = values.every((v) => current.includes(v));

			return {
				...prev,
				[field]: allSelected ? [] : values,
			};
		});
	};

	const getToggleLabel = (field, options) => {
		const current = eventData[field] || [];
		const values = options.map((o) => o.value || o);

		const allSelected = values.every((v) => current.includes(v));

		return allSelected ? "Deselect All" : "Select All";
	};

	useImperativeHandle(ref, () => ({
		validate() {
			const roles = eventData.audienceRoles || [];
			const years = eventData.studentYears || [];
			const departments = eventData.departments || [];
			const courses = eventData.courses || [];

			if (roles.length === 0) {
				toast.error("Select at least one audience role");
				return false;
			}

			if (roles.includes("Students")) {
				if (courses.length === 0) {
					toast.error("Select at least one course");
					return false;
				}

				if (departments.length === 0) {
					toast.error("Select at least one department");
					return false;
				}

				if (years.length === 0) {
					toast.error("Select at least one student year");
					return false;
				}
			}

			return true;
		},
	}));

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

	const audienceOptions = ["Students", "Faculty", "Staff", "External Guests"];

	const courseOptions = [
		{ label: "B.Tech", value: "btech" },
		{ label: "M.Tech", value: "mtech" },
		{ label: "MBA", value: "mba" },
		{ label: "BCA", value: "bca" },
	];

	const departmentOptions = [
		{ label: "CSE", value: "cse" },
		{ label: "ECE", value: "ece" },
		{ label: "EEE", value: "eee" },
		{ label: "Mechanical", value: "me" },
		{ label: "Civil", value: "ce" },
	];

	const yearOptions = [
		"1st Year",
		"2nd Year",
		"3rd Year",
		"4th Year",
		"5th Year",
		"Alumni",
	];

	const hasSelectedAudienceRoles = (eventData.audienceRoles || []).length > 0;

	const hasSelectedStudentsAudience =
		eventData.audienceRoles?.includes("Students");

	const hasSelectedCourse = (eventData.courses || []).length > 0;

	const hasSelectedDepartment = (eventData.departments || []).length > 0;

	const showCourseStep = hasSelectedAudienceRoles;

	const showDepartmentStep = showCourseStep && hasSelectedCourse;

	const showYearStep =
		showDepartmentStep &&
		hasSelectedDepartment &&
		hasSelectedStudentsAudience;

	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
					<Users size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Target Audience
					</h3>
					<p className="text-sm text-slate-500">
						Define your target audience with precision
					</p>
				</div>
			</div>

			{/* AUDIENCE ROLES */}
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<h3 className="font-medium text-slate-700">
						Audience Roles
					</h3>

					<button
						onClick={() =>
							toggleAll("audienceRoles", audienceOptions)
						}
						className="text-sm text-amber-600"
					>
						{getToggleLabel("audienceRoles", audienceOptions)}
					</button>
				</div>

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					{audienceOptions.map((role) => {
						const active = eventData.audienceRoles?.includes(role);

						return (
							<Card
								key={role}
								active={active}
								onClick={() => toggle("audienceRoles", role)}
							>
								<div className="flex justify-between">
									<span>{role}</span>
									{active && <span>✓</span>}
								</div>
							</Card>
						);
					})}
				</div>
			</div>

			{/* STEP 3 - COURSE */}
			{showCourseStep && (
				<div className="space-y-3">
					<div className="flex justify-between">
						<h4 className="font-medium">Courses</h4>

						<button
							onClick={() => toggleAll("courses", courseOptions)}
							className="text-sm text-amber-600"
						>
							{getToggleLabel("courses", courseOptions)}
						</button>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{courseOptions.map((c) => {
							const active = eventData.courses?.includes(c.value);

							return (
								<Card
									key={c.value}
									active={active}
									onClick={() => toggle("courses", c.value)}
								>
									{c.label}
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* STEP 4 - DEPARTMENT */}
			{showDepartmentStep && (
				<div className="space-y-3">
					<div className="flex justify-between">
						<h4 className="font-medium">Departments</h4>

						<button
							onClick={() =>
								toggleAll("departments", departmentOptions)
							}
							className="text-sm text-amber-600"
						>
							{getToggleLabel("departments", departmentOptions)}
						</button>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{departmentOptions.map((d) => {
							const active = eventData.departments?.includes(
								d.value,
							);

							return (
								<Card
									key={d.value}
									active={active}
									onClick={() =>
										toggle("departments", d.value)
									}
								>
									{d.label}
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* STEP 5 - YEAR */}
			{showYearStep && (
				<div className="space-y-3">
					<div className="flex justify-between">
						<h4 className="font-medium">Student Year</h4>

						<button
							onClick={() =>
								toggleAll("studentYears", yearOptions)
							}
							className="text-sm text-amber-600"
						>
							{getToggleLabel("studentYears", yearOptions)}
						</button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						{yearOptions.map((year) => {
							const active =
								eventData.studentYears?.includes(year);

							return (
								<Card
									key={year}
									active={active}
									onClick={() => toggle("studentYears", year)}
								>
									<div className="flex justify-between">
										<span>{year}</span>
										{active && <span>✓</span>}
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
});

export default AudienceStep;
