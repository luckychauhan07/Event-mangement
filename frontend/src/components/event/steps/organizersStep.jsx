import { useEffect, useState, useRef } from "react";
import { Users, Mail, Phone, Building } from "lucide-react";
import { getAllTeachers } from "../../../services/eventServices";

const OrganizersStep = ({ eventData, setEventData }) => {
	const [teachers, setTeachers] = useState([]);
	const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
	const [search, setSearch] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);

	const dropdownRef = useRef();

	const update = (field, value) => {
		setEventData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	useEffect(() => {
		const fetchTeachers = async () => {
			setIsLoadingTeachers(true);

			try {
				const data = await getAllTeachers();
				setTeachers(data?.teachers || []);
			} catch (err) {
				console.error(err);
				setTeachers([]);
			} finally {
				setIsLoadingTeachers(false);
			}
		};

		fetchTeachers();
	}, []);

	/* close dropdown when clicking outside */
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredTeachers = teachers.filter((teacher) => {
		if (!search.trim()) return true;

		const value = search.toLowerCase();

		return (
			teacher.name?.toLowerCase().includes(value) ||
			teacher.email?.toLowerCase().includes(value)
		);
	});

	const selectTeacher = (teacher) => {
		setSearch(teacher.name);

		setEventData((prev) => ({
			...prev,
			primaryCoordinator: teacher.name,
			coordinatorEmail: teacher.email,
			coordinatorPhone: teacher.phone,
			coordinatorId: teacher.id,
		}));

		setShowDropdown(false);
	};

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
					<Users size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">Organizer Details</h3>
					<p className="text-sm text-slate-500">Select the organizing department and coordinator</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{/* Organizer Unit */}
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-slate-700 mb-1.5">
						Organizing Department / Club <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
						<select
							className={`${inputStyle} pl-10`}
							value={eventData.organizerUnit || ""}
							onChange={(e) => update("organizerUnit", e.target.value)}
						>
							<option value="">Select Organizer</option>
							<option value="Tech Club">Tech Club</option>
							<option value="Cultural Club">Cultural Club</option>
							<option value="Sports Club">Sports Club</option>
							<option value="CSE Department">CSE Department</option>
							<option value="ECE Department">ECE Department</option>
							<option value="EEE Department">EEE Department</option>
							<option value="Mechanical Department">Mechanical Department</option>
							<option value="Civil Department">Civil Department</option>
						</select>
					</div>
				</div>

			{/* Coordinator Autocomplete */}
			<div className="md:col-span-2 relative" ref={dropdownRef}>
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					Primary Coordinator <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input
						type="text"
						placeholder="Search coordinator name or email"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setShowDropdown(true);
						}}
						onFocus={() => setShowDropdown(true)}
						className={`${inputStyle} pl-10`}
					/>
				</div>

				{/* Dropdown */}
				{showDropdown && (
					<div className="absolute z-20 mt-1 w-full bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
						{isLoadingTeachers ? (
							<div className="p-4 text-sm text-slate-500 text-center">
								<div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
								Loading coordinators...
							</div>
						) : filteredTeachers.length === 0 ? (
							<div className="p-4 text-sm text-slate-500 text-center">
								No coordinators found
							</div>
						) : (
							filteredTeachers.map((teacher) => (
								<div
									key={teacher.email}
									onClick={() => selectTeacher(teacher)}
									className="p-3 cursor-pointer hover:bg-blue-50 border-b border-slate-100 last:border-none transition-colors"
								>
									<div className="font-medium text-slate-800">
										{teacher.name}
									</div>
									<div className="text-xs text-slate-500">
										{teacher.email}
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>

			{/* Selected Coordinator Info */}
			<div>
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					Coordinator Email
				</label>
				<div className="relative">
					<Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input
						placeholder="coordinator@college.edu"
						className={`${inputStyle} pl-10 bg-slate-50`}
						value={eventData.coordinatorEmail || ""}
						readOnly
					/>
				</div>
			</div>

			<div>
				<label className="block text-sm font-medium text-slate-700 mb-1.5">
					Coordinator Phone
				</label>
				<div className="relative">
					<Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
					<input
						placeholder="+91 98765 43210"
						className={`${inputStyle} pl-10 bg-slate-50`}
						value={eventData.coordinatorPhone || ""}
						readOnly
					/>
				</div>
			</div>
		</div>
		</div>
	);
};

export default OrganizersStep;
