import { Link } from "react-router-dom";
import {
	CalendarPlus,
	Users,
	ClipboardCheck,
	Bell,
	ArrowUpRight,
	UserCheck,
	CalendarDays,
} from "lucide-react";


const TeacherDashboard = ({ teacher }) => {

	console.log("Teacher object:", teacher);
	console.log("Coordinated events:", teacher?.coordinatedEvents);
	
	const canCreateEvent =
		teacher?.permissions?.includes("CREATE_EVENT");


	const coordinatedEvents =
		teacher?.coordinatedEvents || [];


	return (
		<main className="flex-1 p-6 lg:p-8">

			<div className="flex flex-col gap-6">


				{/* Header */}

				<div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-5 shadow-sm">

					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

						<div>

							<h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
								Teacher Dashboard
							</h1>

							<p className="text-sm text-slate-500">
								Manage your teaching activities and event responsibilities.
							</p>

						</div>


						<div className="flex flex-wrap gap-3">


							<Link
								to="/teacher/events"
								className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:shadow-md"
							>

								<CalendarDays size={16}/>
								My Events

							</Link>



							{
								canCreateEvent &&

								<Link
									to="/teacher/add-event"
									className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
								>

									<CalendarPlus size={16}/>
									Create Event

								</Link>

							}


						</div>


					</div>

				</div>





				{/* Stats */}

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">


					<StatCard
						icon={<CalendarDays size={18}/>}
						title="Assigned Events"
						value={coordinatedEvents.length}
						description="Events you coordinate"
					/>


					<StatCard
						icon={<Bell size={18}/>}
						title="Upcoming"
						value="5"
						description="Upcoming events"
					/>


					<StatCard
						icon={<ClipboardCheck size={18}/>}
						title="Completed"
						value="7"
						description="Completed events"
					/>


					<StatCard
						icon={<UserCheck size={18}/>}
						title="Students"
						value="18"
						description="Student coordinators"
					/>


				</div>







				{/* Coordinator Section */}

				{
					coordinatedEvents.length > 0 &&

					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


						<div className="flex justify-between items-center">

							<h2 className="text-lg font-semibold">
								Coordinator Panel
							</h2>


							<span className="text-xs text-slate-400">
								Event Management
							</span>

						</div>



						<div className="mt-4 grid gap-3 md:grid-cols-2">


							<ActionCard
								icon={<Users size={16}/>}
								title="Manage Student Coordinators"
								link="/teacher/events"
							/>


							<ActionCard
								icon={<UserCheck size={16}/>}
								title="View Participants"
								link="/teacher/events"
							/>


						</div>


					</div>

				}






				{/* Create Event Permission */}

				{
					canCreateEvent &&


					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


						<h2 className="text-lg font-semibold">
							Coordinator Actions
						</h2>



						<div className="mt-4">


							<ActionCard
								icon={<CalendarPlus size={16}/>}
								title="Create New Event"
								link="/teacher/add-event"
							/>


						</div>


					</div>


				}







				{/* Activity */}

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">


					<h2 className="text-lg font-semibold">
						Recent Activity
					</h2>



					<ul className="mt-4 space-y-3 text-sm text-slate-600">


						<li className="rounded-lg bg-slate-50 px-3 py-2">
							Event registration updated
						</li>


						<li className="rounded-lg bg-slate-50 px-3 py-2">
							New notification received
						</li>


						<li className="rounded-lg bg-slate-50 px-3 py-2">
							Student coordinators assigned
						</li>


					</ul>


				</div>




			</div>


		</main>
	);
};






function StatCard({icon,title,value,description}){

	return (

	<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

		<div className="flex justify-between">

			<div className="rounded-xl bg-slate-100 p-2">
				{icon}
			</div>


			<span className="text-xs uppercase text-slate-400">
				{title}
			</span>

		</div>


		<p className="mt-4 text-2xl font-semibold">
			{value}
		</p>


		<p className="text-xs text-slate-500">
			{description}
		</p>


	</div>

	)

}






function ActionCard({icon,title,link}){


	return (

	<Link
	to={link}
	className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-white hover:shadow-sm"
	>

		<span className="flex items-center gap-2 text-sm font-medium">
			{icon}
			{title}
		</span>


		<ArrowUpRight size={16}/>


	</Link>

	)

}



export default TeacherDashboard;