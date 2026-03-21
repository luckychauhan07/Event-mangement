const { z } = require("zod");
const { formFieldSchema } = require("./formFieldValidtor.js");
const registrationSchema = z
	.array(formFieldSchema)
	.superRefine((fields, ctx) => {
		const labels = new Set();

		fields.forEach((field, index) => {
			// ✅ Unique label check
			if (labels.has(field.label)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Field labels must be unique",
					path: [index, "label"],
				});
			}
			labels.add(field.label);

			// ✅ Options required for select/checkbox
			if (
				(field.type === "select" || field.type === "checkbox") &&
				(!field.options || field.options.length === 0)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Options required for select/checkbox",
					path: [index, "options"],
				});
			}

			// ❌ Options should NOT exist for other types
			if (
				!["select", "checkbox"].includes(field.type) &&
				field.options.length > 0
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Options only allowed for select/checkbox",
					path: [index, "options"],
				});
			}
		});
	});

module.exports = { registrationSchema };
