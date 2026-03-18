const ToggleCard = ({ active, onClick, children, icon: Icon }) => (
	<div
		onClick={onClick}
		className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
			${active ? "border-yellow-500 bg-yellow-50 shadow-sm" : "border-slate-200 hover:border-yellow-300 hover:bg-slate-50"}
			`}
	>
		{children}
	</div>
);
export default ToggleCard;
