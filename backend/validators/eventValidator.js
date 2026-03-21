const { z } = require("zod");

const {
	registrationSchema,
} = require("./extraValidators/registrationSchemaValidator.js");
const {
	resultConfigSchema,
} = require("./extraValidators/resultConfigValidator.js");

const createEventSchema = z
	.object({
		// basic steps validations
		title: z.string().min(1),
		subtitle: z.string().optional(),
		description: z.string().optional(),
		category: z.string().min(1),
		eventType: z.enum(["free", "paid"]),
		tags: z.array(z.string()).optional(),
		entryFee: z.string().optional(),

		// organization details validations
		organizerUnit: z.string(),
		primaryCoordinator: z.string().min(1),
		primaryCoordinatorEmail: z.string().email(),
		primaryCoordinatorPhone: z.string().optional(),
		primaryCoordinatorId: z.string(),

		// schedule details validations
		startAt: z.string(),
		endAt: z.string(),
		eventMode: z.enum(["online", "offline", "hybrid"]),
		venue: z.string().optional(),
		rooms: z.string().optional(),
		onlineLink: z.string().optional(),
		reccurence: z.string().optional().default("no recurrence"),

		// registration details validations
		allowRegistration: z.boolean().default(false),
		registrationType: z
			.enum(["open", "approval-based", "invite-only"])
			.optional(),
		registrationStart: z.string().optional(),
		registrationEnd: z.string().optional(),
		participationType: z.enum(["individual", "team", "both"]).optional(),
		participantLimit: z.number().optional(),
		ageRestriction: z.string().optional().default("none"),
		minTeamSize: z.number().optional(),
		maxTeamSize: z.number().optional(),

		// resource details validations
		accommodation: z.boolean().optional(),
		accommodationDetails: z.string().optional(),
		equipmentRequired: z.boolean().optional(),
		equipmentName: z.string().optional(),
		catering: z.boolean().optional(),
		cateringDetails: z.string().optional(),

		//    media details validations
		eventPoster: z.file().optional(),
		promoVideo: z.string().optional(),
		termsAndConditions: z.file().optional(),
		privacyLevel: z.enum(["public", "private", "unlisted"]).optional(),

		// audience details validations
		interCollege: z.string().optional(),
		audienceRoles: z.array(z.string()).optional(),
		department: z.string().optional(),
		studentYears: z.array(z.string()).optional(),
		course: z.string().optional(),

		// form details validations
		registrationSchema: registrationSchema.optional(),

		// results and feedback validations
		resultConfig: resultConfigSchema.optional(),
	})
	.superRefine((data, ctx) => {
		// =========================
		// PAID EVENT
		// =========================
		if (
			data.eventType === "paid" &&
			(!data.entryFee || parseFloat(data.entryFee) <= 0)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Valid entry fee required for paid events",
				path: ["entryFee"],
			});
		}

		// =========================
		// EVENT MODE
		// =========================
		if (data.eventMode === "offline" && !data.venue) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Venue required for offline event",
				path: ["venue"],
			});
		}

		if (data.eventMode === "online" && !data.onlineLink) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Online link required",
				path: ["onlineLink"],
			});
		}

		if (data.eventMode === "hybrid") {
			if (!data.venue || !data.onlineLink) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Both venue and online link required",
					path: ["eventMode"],
				});
			}
		}

		// =========================
		// DATE VALIDATION
		// =========================
		if (new Date(data.startAt) >= new Date(data.endAt)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End date must be after start date",
				path: ["endAt"],
			});
		}

		// =========================
		// REGISTRATION LOGIC
		// =========================
		if (data.allowRegistration) {
			if (!data.registrationType) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Registration type required",
					path: ["registrationType"],
				});
			}

			if (!data.registrationStart || !data.registrationEnd) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Registration dates required",
					path: ["registrationStart"],
				});
			}

			if (
				data.registrationStart &&
				data.registrationEnd &&
				new Date(data.registrationStart) >=
					new Date(data.registrationEnd)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Registration end must be after start",
					path: ["registrationEnd"],
				});
			}

			if (!data.participationType) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Participation type required",
					path: ["participationType"],
				});
			}
		}

		// =========================
		// TEAM VALIDATION
		// =========================
		if (
			data.participationType === "team" ||
			data.participationType === "both"
		) {
			if (!data.minTeamSize || !data.maxTeamSize) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Team size required",
					path: ["minTeamSize"],
				});
			}

			if (
				data.minTeamSize &&
				data.maxTeamSize &&
				data.minTeamSize > data.maxTeamSize
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Min team size cannot exceed max",
					path: ["maxTeamSize"],
				});
			}
		}

		// =========================
		// RESOURCES VALIDATION
		// =========================
		if (data.accommodation && !data.accommodationDetails) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Accommodation details required",
				path: ["accommodationDetails"],
			});
		}

		if (data.equipmentRequired && !data.equipmentName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Equipment name required",
				path: ["equipmentName"],
			});
		}

		if (data.catering && !data.cateringDetails) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Catering details required",
				path: ["cateringDetails"],
			});
		}

		// =========================
		// PARTICIPANT LIMIT
		// =========================
		if (data.participantLimit && data.participantLimit <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Participant limit must be greater than 0",
				path: ["participantLimit"],
			});
		}

		// =========================
		// AGE RESTRICTION
		// =========================
		if (
			data.ageRestriction &&
			data.ageRestriction !== "none" &&
			Number(data.ageRestriction) <= 0
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Invalid age restriction",
				path: ["ageRestriction"],
			});
		}
	});

module.exports = { createEventSchema };
