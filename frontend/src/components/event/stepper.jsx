const labels = [
	"Basic",
	"Organizers",
	"Schedule",
	"Registration",
	"Resources",
	"Media",
	"Audience",
	"Form",
	"Results",
];

const Stepper = ({ step }) => {
	return (
		<div className="flex justify-between">
			{labels.map((label, i) => {
				const active = i <= step;

				return (
					<div key={i} className="flex flex-col items-center">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center
       ${active ? "bg-sky-600 text-white" : "bg-gray-200"}`}
						>
							{i + 1}
						</div>

						<span className="text-xs mt-1">{label}</span>
					</div>
				);
			})}
		</div>
	);
};

export default Stepper;
