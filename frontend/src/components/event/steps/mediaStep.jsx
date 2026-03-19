import { Image, Video, FileText, Lock } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";

const MediaStep = forwardRef(({ eventData, setEventData }, ref) => {
	const update = (field, value) =>
		setEventData({ ...eventData, [field]: value });

	const isValidHttpUrl = (value) => {
		if (!value) return false;

		try {
			const parsedUrl = new URL(String(value).trim());
			return (
				parsedUrl.protocol === "http:" ||
				parsedUrl.protocol === "https:"
			);
		} catch {
			return false;
		}
	};

	const getFileExtension = (fileName) => {
		const extension = String(fileName || "")
			.split(".")
			.pop();
		return extension ? extension.toLowerCase() : "";
	};

	const validateFile = ({
		file,
		allowedExtensions,
		allowedMimeTypes,
		maxSizeMb,
		fieldLabel,
	}) => {
		if (!file) return true;

		const extension = getFileExtension(file.name);
		const hasValidExtension = allowedExtensions.includes(extension);
		const hasValidMimeType = allowedMimeTypes.includes(file.type);

		if (!hasValidExtension && !hasValidMimeType) {
			return `${fieldLabel} has an unsupported file format`;
		}

		const maxSizeBytes = maxSizeMb * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			return `${fieldLabel} must be smaller than ${maxSizeMb}MB`;
		}

		return true;
	};

	useImperativeHandle(ref, () => ({
		validate() {
			if (eventData.promoVideo && !isValidHttpUrl(eventData.promoVideo)) {
				return "Promo video link must be a valid URL (http/https)";
			}

			const posterValidation = validateFile({
				file: eventData.eventPoster,
				allowedExtensions: ["jpg", "jpeg", "png", "webp"],
				allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
				maxSizeMb: 5,
				fieldLabel: "Event poster",
			});
			if (posterValidation !== true) {
				return posterValidation;
			}

			const termsValidation = validateFile({
				file: eventData.termsAndConditions,
				allowedExtensions: ["pdf", "doc", "docx", "txt"],
				allowedMimeTypes: [
					"application/pdf",
					"application/msword",
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"text/plain",
				],
				maxSizeMb: 10,
				fieldLabel: "Terms and conditions file",
			});
			if (termsValidation !== true) {
				return termsValidation;
			}

			return true;
		},
	}));

	const inputStyle =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none bg-white";

	const fileInputClass =
		"w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:border-blue-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer";

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3 pb-4 border-b border-slate-100">
				<div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
					<Image size={20} />
				</div>
				<div>
					<h3 className="text-lg font-semibold text-slate-900">
						Media & Documents
					</h3>
					<p className="text-sm text-slate-500">
						Upload event posters, videos, and documents
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div>
					<label
						htmlFor="eventPoster"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Event Poster
					</label>
					<div className="relative">
						<Image
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="file"
							id="eventPoster"
							accept="image/*"
							onChange={(e) =>
								update(
									"eventPoster",
									e.target.files?.[0] || null,
								)
							}
							className={`${fileInputClass} pl-10`}
						/>
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Accepted formats: JPG, PNG, WebP
					</p>
				</div>

				<div>
					<label
						htmlFor="promoVideo"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Promo Video Link
					</label>
					<div className="relative">
						<Video
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="url"
							id="promoVideo"
							placeholder="Enter promo video link"
							value={eventData.promoVideo ?? ""}
							onChange={(e) =>
								update("promoVideo", e.target.value)
							}
							className={`${inputStyle} pl-10`}
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="termsAndConditions"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Terms and Conditions
					</label>
					<div className="relative">
						<FileText
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="file"
							id="termsAndConditions"
							accept=".pdf,.doc,.docx,.txt"
							onChange={(e) =>
								update(
									"termsAndConditions",
									e.target.files?.[0] || null,
								)
							}
							className={`${fileInputClass} pl-10`}
						/>
					</div>
					<p className="text-xs text-slate-400 mt-1">
						Accepted formats: PDF, DOC, DOCX, TXT
					</p>
				</div>

				<div>
					<label
						htmlFor="privacyLevel"
						className="block text-sm font-medium text-slate-700 mb-1.5"
					>
						Privacy Level
					</label>
					<div className="relative">
						<Lock
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<select
							id="privacyLevel"
							value={eventData.privacyLevel ?? ""}
							onChange={(e) =>
								update("privacyLevel", e.target.value)
							}
							className={`${inputStyle} pl-10`}
						>
							<option value="" disabled>
								Select privacy level
							</option>
							<option value="Public">Public</option>
							<option value="Campus-only">Campus-only</option>
							<option value="Department-only">
								Department-only
							</option>
							<option value="Private">Private</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
});

export default MediaStep;
