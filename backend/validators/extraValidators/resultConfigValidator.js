const { z } = require("zod");
const resultConfigSchema = z
	.object({
		enabled: z.boolean(),

		type: z
			.enum(["simple", "position", "score", "round", "participation"])
			.optional(),

		positions: z.string().optional(),

		judgesCount: z.string().optional(),

		criteria: z.array(z.string()).optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.enabled) return;

		// type required if enabled
		if (!data.type) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Result type required",
				path: ["type"],
			});
		}

		// =========================
		// POSITION TYPE
		// =========================
		if (
			data.type === "simple" ||
			data.type === "position" ||
			data.type === "round"
		) {
			if (!data.positions || data.positions <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Positions required",
					path: ["positions"],
				});
			}
		}

		// =========================
		// SCORE TYPE
		// =========================
		if (data.type === "score") {
			if (!data.positions || data.positions <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Positions required",
					path: ["positions"],
				});
			}

			if (!data.judgesCount || data.judgesCount <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Judges count required",
					path: ["judgesCount"],
				});
			}

			if (!data.criteria || data.criteria.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Scoring criteria required",
					path: ["criteria"],
				});
			}
		}

		// =========================
		// PARTICIPATION TYPE
		// =========================
		if (data.type === "participation") {
			// should NOT have extra fields
			if (data.positions || data.judgesCount || data.criteria) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "No extra fields allowed for participation type",
					path: ["type"],
				});
			}
		}
	});

module.exports = { resultConfigSchema };
