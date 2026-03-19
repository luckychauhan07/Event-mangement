import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
	FileText,
	Type,
	Hash,
	Mail,
	List,
	Circle,
	Plus,
	Trash2,
	Eye,
	Phone,
	Link,
	Calendar,
	CheckSquare,
	Upload,
	User,
	FileCheck,
	LayoutTemplate,
} from "lucide-react";

const FIELD_TYPES = [
	{ label: "Text", value: "text", icon: Type },
	{ label: "Long Text", value: "textarea", icon: FileText },
	{ label: "Number", value: "number", icon: Hash },
	{ label: "Email", value: "email", icon: Mail },
	{ label: "Phone", value: "tel", icon: Phone },
	{ label: "URL", value: "url", icon: Link },
	{ label: "Date", value: "date", icon: Calendar },
	{ label: "Dropdown", value: "select", icon: List },
	{ label: "Checkbox Group", value: "checkbox", icon: CheckSquare },
	{ label: "File Upload", value: "file", icon: Upload },
];

// Pre-built templates from prototype
const TEMPLATES = {
	hackathon: [
		{ label: "College/University", type: "text", required: true },
		{ label: "Team Name", type: "text", required: true },
		{ label: "GitHub Profile", type: "url", required: false },
		{ label: "Project Idea (Brief)", type: "textarea", required: true },
	],
	workshop: [
		{
			label: "Current Skill Level",
			type: "select",
			required: true,
			options: ["Beginner", "Intermediate", "Advanced"],
		},
		{
			label: "Why do you want to attend?",
			type: "textarea",
			required: true,
		},
		{
			label: "Dietary Preferences",
			type: "select",
			required: false,
			options: ["Veg", "Non-veg", "Vegan"],
		},
	],
	cultural: [
		{
			label: "Performance Category",
			type: "select",
			required: true,
			options: ["Solo", "Group", "Duo"],
		},
		{
			label: "Performance Duration (mins)",
			type: "number",
			required: true,
		},
		{ label: "Special Requirements", type: "textarea", required: false },
	],
};

// Mandatory system fields that are always included
const SYSTEM_FIELDS = [
	{ label: "Full Name", required: true },
	{ label: "Email", required: true },
	{ label: "Phone Number", required: true },
];

const FormBuilderStep = forwardRef(({ eventData, setEventData }, ref) => {
	const [fields, setFields] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState("");

	/* sync with parent */
	useEffect(() => {
		setEventData((prev) => ({
			...prev,
			registrationSchema: fields,
		}));
	}, [fields]);

	/* add field */
	const addField = (type) => {
		const needsOptions = type === "select" || type === "checkbox";
		const newField = {
			id: `field_${Date.now()}`,
			label: "Custom Field",
			type,
			required: false,
			options: needsOptions ? ["Option 1"] : [],
			placeholder: "",
		};

		setFields((prev) => [...prev, newField]);
	};

	/* update field property */
	const updateField = (id, prop, value) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== id) return f;

				const updated = { ...f, [prop]: value };

				// Handle type changes
				if (prop === "type") {
					const needsOptions =
						value === "select" || value === "checkbox";
					const hadOptions =
						f.type === "select" || f.type === "checkbox";

					if (needsOptions && !hadOptions) {
						// Switching to a type that needs options
						updated.options = ["Option 1"];
					} else if (!needsOptions && hadOptions) {
						// Switching from a type that had options
						updated.options = [];
					}
				}

				return updated;
			}),
		);
	};

	/* delete field */
	const deleteField = (id) => {
		setFields((prev) => prev.filter((f) => f.id !== id));
	};

	/* add option to select field */
	const addOption = (id) => {
		setFields((prev) =>
			prev.map((f) =>
				f.id === id
					? { ...f, options: [...(f.options || []), "New Option"] }
					: f,
			),
		);
	};

	/* update option value */
	const updateOption = (fieldId, optionIndex, value) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== fieldId) return f;
				const newOptions = [...(f.options || [])];
				newOptions[optionIndex] = value;
				return { ...f, options: newOptions };
			}),
		);
	};

	/* remove option */
	const removeOption = (fieldId, optionIndex) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== fieldId) return f;
				const newOptions = (f.options || []).filter(
					(_, i) => i !== optionIndex,
				);
				return { ...f, options: newOptions };
			}),
		);
	};

	/* apply template */
	const applyTemplate = (templateName) => {
		if (!templateName || !TEMPLATES[templateName]) {
			setSelectedTemplate("");
			return;
		}

		const templateFields = TEMPLATES[templateName].map((field, index) => ({
			...field,
			id: `field_${Date.now()}_${index}`,
			options: field.options || [],
			placeholder: "",
		}));

		setFields(templateFields);
		setSelectedTemplate(templateName);
	};

	/* clear all fields */
	const clearAllFields = () => {
		setFields([]);
		setSelectedTemplate("");
	};
	useImperativeHandle(ref, () => ({
		validate() {
			if (eventData.allowRegistration !== "yes") {
				return true;
			}

			const normalizedLabels = [];

			for (let index = 0; index < fields.length; index += 1) {
				const field = fields[index];
				const label = String(field.label || "").trim();

				if (!label) {
					return `Custom field ${index + 1} must have a label`;
				}

				normalizedLabels.push(label.toLowerCase());

				const requiresOptions =
					field.type === "select" || field.type === "checkbox";
				if (!requiresOptions) {
					continue;
				}

				const options = (field.options || []).map((option) =>
					String(option || "").trim(),
				);
				if (options.length === 0) {
					return `${label} must include at least one option`;
				}

				if (options.some((option) => !option)) {
					return `${label} contains an empty option`;
				}

				const uniqueOptions = new Set(
					options.map((option) => option.toLowerCase()),
				);
				if (uniqueOptions.size !== options.length) {
					return `${label} contains duplicate options`;
				}
			}

			const uniqueLabels = new Set(normalizedLabels);
			if (uniqueLabels.size !== normalizedLabels.length) {
				return "Custom field labels must be unique";
			}

			return true;
		},
	}));
	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	const smallInputStyle =
		"w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
					<FileText size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						{eventData.allowRegistration
							? "Registration Form Builder"
							: "No registration Form Needed"}
					</h3>
					<p className="text-sm text-slate-500">
						{eventData.allowRegistration
							? "Create a custom registration form by adding fields or using a template"
							: "Since registration is not required, you can skip form creation"}
					</p>
				</div>
			</div>
			{eventData.allowRegistration && (
				<>
					{/* Mandatory System Fields */}
					<div className="border-2 border-slate-200 rounded-xl p-5 bg-slate-50">
						<div className="flex items-center gap-2 mb-4">
							<User size={18} className="text-slate-500" />
							<h4 className="font-medium text-slate-700">
								Mandatory System Fields
							</h4>
						</div>
						<p className="text-xs text-slate-500 mb-3">
							These fields are always included and cannot be
							removed
						</p>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{SYSTEM_FIELDS.map((field) => (
								<div
									key={field.label}
									className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3"
								>
									<input
										type="checkbox"
										checked={field.required}
										disabled
										className="w-4 h-4 rounded border-slate-300 text-cyan-600 cursor-not-allowed"
									/>
									<div className="flex items-center gap-2">
										<FileCheck
											size={16}
											className="text-green-500"
										/>
										<span className="text-sm text-slate-700">
											{field.label}
										</span>
										{field.required && (
											<span className="text-red-500 text-xs">
												*
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Controls: Add Field & Templates */}
					<div className="flex flex-wrap items-center gap-3">
						<button
							onClick={() => addField("text")}
							className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-medium
					hover:bg-cyan-700 transition-all duration-200 shadow-sm"
						>
							<Plus size={16} />
							Add Field
						</button>

						<div className="flex items-center gap-2">
							<LayoutTemplate
								size={18}
								className="text-slate-400"
							/>
							<select
								value={selectedTemplate}
								onChange={(e) => applyTemplate(e.target.value)}
								className="border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white hover:border-cyan-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none min-w-[200px]"
							>
								<option value="">Use Template</option>
								<option value="hackathon">Hackathon</option>
								<option value="workshop">Workshop</option>
								<option value="cultural">Cultural Event</option>
							</select>
						</div>

						{fields.length > 0 && (
							<button
								onClick={clearAllFields}
								className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-medium
						hover:bg-red-50 hover:border-red-300 transition-all duration-200"
							>
								<Trash2 size={16} />
								Clear All
							</button>
						)}
					</div>

					{/* Field Type Quick Add Buttons */}
					<div className="flex flex-wrap gap-2">
						{FIELD_TYPES.map((type) => {
							const IconComponent = type.icon;
							return (
								<button
									key={type.value}
									onClick={() => addField(type.value)}
									className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600
							hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-200"
								>
									<IconComponent size={14} />
									{type.label}
								</button>
							);
						})}
					</div>

					{/* Custom Fields List */}
					<div className="space-y-4">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="border-2 border-slate-200 rounded-xl p-4 bg-white"
							>
								{/* Field Header */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-3">
										<span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-medium">
											{index + 1}
										</span>
										<span className="text-xs font-semibold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg uppercase tracking-wide">
											{field.type}
										</span>
									</div>

									<button
										onClick={() => deleteField(field.id)}
										className="flex items-center gap-1.5 text-red-500 text-xs hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all duration-200"
									>
										<Trash2 size={14} />
										Remove
									</button>
								</div>

								{/* Field Configuration Grid */}
								<div className="grid grid-cols-1 md:grid-cols-12 gap-3">
									{/* Label */}
									<div className="md:col-span-4">
										<input
											type="text"
											placeholder="Field Label"
											value={field.label}
											onChange={(e) =>
												updateField(
													field.id,
													"label",
													e.target.value,
												)
											}
											className={smallInputStyle}
										/>
									</div>

									{/* Type */}
									<div className="md:col-span-3">
										<select
											value={field.type}
											onChange={(e) =>
												updateField(
													field.id,
													"type",
													e.target.value,
												)
											}
											className={smallInputStyle}
										>
											{FIELD_TYPES.map((t) => (
												<option
													key={t.value}
													value={t.value}
												>
													{t.label}
												</option>
											))}
										</select>
									</div>

									{/* Options (for select and checkbox types) */}
									{(field.type === "select" ||
										field.type === "checkbox") && (
										<div className="md:col-span-12 mt-2">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-slate-600">
													Options
												</span>
												<button
													onClick={() =>
														addOption(field.id)
													}
													className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
												>
													<Plus size={12} />
													Add Option
												</button>
											</div>
											<div className="space-y-2">
												{(field.options || []).map(
													(opt, optIndex) => (
														<div
															key={optIndex}
															className="flex items-center gap-2"
														>
															<span className="text-xs text-slate-400 w-6">
																{optIndex + 1}.
															</span>
															<input
																type="text"
																placeholder={`Option ${optIndex + 1}`}
																value={opt}
																onChange={(e) =>
																	updateOption(
																		field.id,
																		optIndex,
																		e.target
																			.value,
																	)
																}
																className={`${smallInputStyle} flex-1`}
															/>
															{(
																field.options ||
																[]
															).length > 1 && (
																<button
																	onClick={() =>
																		removeOption(
																			field.id,
																			optIndex,
																		)
																	}
																	className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
																>
																	<Trash2
																		size={
																			14
																		}
																	/>
																</button>
															)}
														</div>
													),
												)}
											</div>
										</div>
									)}

									{/* Required */}
									<div className="md:col-span-2 flex items-center">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={field.required}
												onChange={(e) =>
													updateField(
														field.id,
														"required",
														e.target.checked,
													)
												}
												className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
											/>
											<span className="text-xs text-slate-600">
												Required
											</span>
										</label>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Empty State */}
					{fields.length === 0 && (
						<div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
							<FileText
								size={40}
								className="mx-auto text-slate-300 mb-3"
							/>
							<p className="text-slate-500 text-sm mb-2">
								No custom fields added yet
							</p>
							<p className="text-slate-400 text-xs">
								Click "Add Field" or select a template to get
								started
							</p>
						</div>
					)}

					{/* Form Preview */}
					<div className="border-2 border-slate-200 rounded-xl p-5 bg-slate-50">
						<div className="flex items-center gap-2 mb-4">
							<Eye size={18} className="text-cyan-500" />
							<h4 className="font-medium text-slate-800">
								Registration Form Preview
							</h4>
						</div>

						<div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
							{/* System Fields in Preview */}
							{SYSTEM_FIELDS.map((field) => (
								<div key={field.label}>
									<label className="block text-sm font-medium text-slate-700 mb-1.5">
										{field.label}{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										className={`${inputStyle} bg-slate-50`}
										disabled
										placeholder={`Enter ${field.label.toLowerCase()}`}
									/>
								</div>
							))}

							{/* Custom Fields in Preview */}
							{fields.map((field) => {
								const requiredMark = field.required ? (
									<span className="text-red-500 ml-1">*</span>
								) : null;

								switch (field.type) {
									case "text":
									case "email":
									case "number":
									case "tel":
									case "url":
									case "date":
										return (
											<div key={field.id}>
												<label className="block text-sm font-medium text-slate-700 mb-1.5">
													{field.label}
													{requiredMark}
												</label>
												<input
													type={field.type}
													placeholder={
														field.placeholder ||
														`Enter ${field.label.toLowerCase()}`
													}
													className={inputStyle}
													disabled
												/>
											</div>
										);

									case "textarea":
										return (
											<div key={field.id}>
												<label className="block text-sm font-medium text-slate-700 mb-1.5">
													{field.label}
													{requiredMark}
												</label>
												<textarea
													placeholder={
														field.placeholder ||
														`Enter ${field.label.toLowerCase()}`
													}
													className={`${inputStyle} resize-none`}
													rows={3}
													disabled
												/>
											</div>
										);

									case "select":
										return (
											<div key={field.id}>
												<label className="block text-sm font-medium text-slate-700 mb-1.5">
													{field.label}
													{requiredMark}
												</label>
												<select
													className={inputStyle}
													disabled
												>
													<option value="">
														-- Select --
													</option>
													{(field.options || []).map(
														(opt, i) => (
															<option key={i}>
																{opt}
															</option>
														),
													)}
												</select>
											</div>
										);

									case "checkbox":
										return (
											<div key={field.id}>
												<label className="block text-sm font-medium text-slate-700 mb-2">
													{field.label}
													{requiredMark}
												</label>
												<div className="space-y-2 pl-1">
													{(
														field.options || [
															"Agree",
														]
													).map((opt, i) => (
														<label
															key={i}
															className="flex items-center gap-2 cursor-pointer"
														>
															<input
																type="checkbox"
																className="w-4 h-4 rounded border-slate-300 text-cyan-600"
																disabled
															/>
															<span className="text-sm text-slate-600">
																{opt}
															</span>
														</label>
													))}
												</div>
											</div>
										);

									case "file":
										return (
											<div key={field.id}>
												<label className="block text-sm font-medium text-slate-700 mb-1.5">
													{field.label}
													{requiredMark}
												</label>
												<input
													type="file"
													className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100`}
													disabled
												/>
											</div>
										);

									default:
										return null;
								}
							})}

							{fields.length === 0 && (
								<p className="text-sm text-slate-400 text-center py-4">
									Custom fields will appear here
								</p>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
});

export default FormBuilderStep;
