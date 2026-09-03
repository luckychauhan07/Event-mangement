import { Check } from "lucide-react";

const labels = [
	"Basic",
	"Organizers",
	"Schedule",
	"Registration",
	"Resources",
	"Audience",
	"Form",
	"Results",
];

const Stepper = ({ step }) => {
	return (
		<div className="flex justify-between overflow-x-auto pb-2">
			{labels.map((label, i) => {
				const isActive = i === step;
				const isCompleted = i < step;
				const isUpcoming = i > step;

				return (
					<div
						key={i}
						className="flex flex-col items-center min-w-[60px] md:min-w-[80px]"
					>
						<div
							className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
								isActive
									? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110"
									: isCompleted
										? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
										: "bg-slate-200 text-slate-500"
							}`}
						>
							{isCompleted ? <Check size={16} /> : i + 1}
						</div>

						<span
							className={`text-xs mt-1.5 font-medium transition-colors ${
								isActive
									? "text-blue-600"
									: isCompleted
										? "text-emerald-600"
										: "text-slate-400"
							}`}
						>
							{label}
						</span>

						{/* Connector Line */}
						{i < labels.length - 1 && (
							<div
								className={`hidden md:block absolute h-0.5 w-12 lg:w-16 left-1/2 translate-x-5 top-5 transition-colors ${
									isCompleted
										? "bg-emerald-500"
										: "bg-slate-200"
								}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default Stepper;
