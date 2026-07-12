import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AddEvent from "./addEvent";
import { getEventById } from "@/services/eventServices";
import toast from "react-hot-toast";

const EditEvent = () => {
	const { id } = useParams();

	const [eventData, setEventData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchEvent();
	}, [id]);
	const formatDateTimeLocal = (date) => {
		if (!date) return "";
		return new Date(date).toISOString().slice(0, 16);
	};
	console.count("EditEvent");
	const transformEvent = (event) => ({
		id: event.id,

		title: event.basic?.title || "",
		subtitle: event.basic?.subtitle || "",
		description: event.basic?.description || "",
		category: event.basic?.category || "",
		eventType: event.basic?.eventType || "",
		entryFee: event.basic?.entryFee || "",
		tags: event.basic?.tags || [],
		organizerUnit: event.basic?.organizerUnit || "",

		eventMode: event.schedule?.mode || "",
		venue: event.schedule?.venue || "",
		onlineLink: event.schedule?.onlineLink || "",
		startAt: formatDateTimeLocal(event.schedule?.startAt),
		endAt: formatDateTimeLocal(event.schedule?.endAt),

		coordinator: event.coordinators?.[0]?.userId || "",

		registrationRequired: event.registration.config.required || false,
		registrationType: event.registration.config.type || "",
		registrationStart: formatDateTimeLocal(event.registration.config.start),
		registrationEnd: formatDateTimeLocal(event.registration.config.end),
		registrationLimit: event.registration.config.limit || "",
		registrationParticipationType:
			event.registration.config.participationType || "",
		// totalRegitrations: event.registration.stats.totalRegistrations || 0,
	});
	const fetchEvent = async () => {
		try {
			setLoading(true);
			setError("");
			const data = await getEventById(id);
			if (data?.event) {
				const transformedEvent = transformEvent(data.event);
				setEventData(transformedEvent);
			} else {
				setError(data.message || "Event not found.");
			}
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.message || "Failed to load event.");
			setError(err.response?.data?.message || "Failed to load event.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 md:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur-sm">
					<div className="mx-auto max-w-md text-center">
						<div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
						<p className="text-base font-medium text-slate-700">
							Loading event details
						</p>
						<p className="mt-1 text-sm text-slate-500">
							Preparing editor for this event...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-red-50/40 px-4 py-8 md:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
						!
					</div>
					<h2 className="text-lg font-semibold text-slate-900">
						Unable to load event
					</h2>
					<p className="mt-2 text-sm text-red-600">{error}</p>
				</div>
				<div className="mx-auto mt-6 max-w-2xl text-center">
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg hover:scale-[1.02] transition"
					>
						Go Back
					</button>
				</div>
			</div>
		);
	}
	if (!eventData) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-8 md:px-6 lg:px-8">
			<div className="rounded-3xl border border-slate-200/70 bg-white/60 p-2 shadow-sm backdrop-blur-sm">
				<AddEvent initialData={eventData} isEditing={true} />
			</div>
		</div>
	);
};

export default EditEvent;
