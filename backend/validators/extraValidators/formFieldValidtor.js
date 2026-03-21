const { z } = require("zod");
const formFieldSchema = z.object({
	id: z.string().min(1),

	label: z.string().min(1, "Label is required"),

	type: z.enum([
		"text",
		"textarea",
		"number",
		"email",
		"tel",
		"url",
		"date",
		"select",
		"checkbox",
		"file",
	]),

	required: z.boolean().default(false),

	options: z.array(z.string()).optional(),

	placeholder: z.string().optional(),
});

module.exports = { formFieldSchema };
