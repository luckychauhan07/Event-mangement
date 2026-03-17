import { useEffect, useState, useRef } from "react";
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

	return (
		<div className="grid grid-cols-2 gap-6">
			{/* Organizer Unit */}
			<select
				className="border border-gray-300 rounded-md px-3 py-2 col-span-2
				hover:border-sky-400 focus:ring-2 focus:ring-sky-200"
				value={eventData.organizerUnit || ""}
				onChange={(e) => update("organizerUnit", e.target.value)}
			>
				<option value="">Select Organizer Department / Club</option>
				<option value="Tech Club">Tech Club</option>
				<option value="Cultural Club">Cultural Club</option>
				<option value="Sports Club">Sports Club</option>
				<option value="CSE Department">CSE Department</option>
				<option value="ECE Department">ECE Department</option>
				<option value="EEE Department">EEE Department</option>
				<option value="Mechanical Department">
					Mechanical Department
				</option>
				<option value="Civil Department">Civil Department</option>
			</select>

			{/* Coordinator Autocomplete */}
			<div className="col-span-2 relative" ref={dropdownRef}>
				<label className="text-sm font-medium text-gray-700">
					Primary Coordinator
				</label>

				<input
					type="text"
					placeholder="Search coordinator name or email"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setShowDropdown(true);
					}}
					onFocus={() => setShowDropdown(true)}
					className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2
					hover:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none"
				/>

				{/* Dropdown */}
				{showDropdown && (
					<div
						className="absolute z-20 mt-1 w-full bg-white border
						rounded-md shadow-lg max-h-60 overflow-y-auto"
					>
						{isLoadingTeachers ? (
							<div className="p-3 text-sm text-gray-500">
								Loading coordinators...
							</div>
						) : filteredTeachers.length === 0 ? (
							<div className="p-3 text-sm text-gray-500">
								No coordinators found
							</div>
						) : (
							filteredTeachers.map((teacher) => (
								<div
									key={teacher.email}
									onClick={() => selectTeacher(teacher)}
									className="p-3 cursor-pointer hover:bg-sky-50
									border-b last:border-none"
								>
									<div className="font-medium text-gray-800">
										{teacher.name}
									</div>
									<div className="text-xs text-gray-500">
										{teacher.email}
									</div>
								</div>
							))
						)}
					</div>
				)}
			</div>

			{/* Selected Coordinator Info */}
			<input
				placeholder="Coordinator Email"
				className="border p-2 rounded"
				value={eventData.coordinatorEmail || ""}
				readOnly
			/>

			<input
				placeholder="Coordinator Phone"
				className="border p-2 rounded"
				value={eventData.coordinatorPhone || ""}
				readOnly
			/>
		</div>
	);
};

export default OrganizersStep;
