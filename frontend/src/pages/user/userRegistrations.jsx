import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    FileSearch,
    Filter,
    LogOut,
    MapPin,
    Search,
    ShieldCheck,
    Clock3,
    Users,
    Info,
    Lock,
    UserRound,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
    formatDateTime,
    getEventPhase,
    matchesEventSearch,
} from "../../utils/userEventUtils";
import { getMyEventRegistrations } from "../../services/userServices";

const UserRegistrations = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [withdrawingEventId, setWithdrawingEventId] = useState(null);

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getMyEventRegistrations();
            setEvents(data?.registrations || []);
        } catch (err) {
            setEvents([]);
            setError(
                err?.response?.data?.message ||
                    "Unable to fetch your registrations right now.",
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredRegistrations = useMemo(() => {
        return events.filter((event) => {
            if (!matchesEventSearch(event, searchTerm)) {
                return false;
            }

            if (
                statusFilter !== "all" &&
                event.registration_status !== statusFilter
            ) {
                return false;
            }

            if (timeFilter !== "all") {
                const phase = getEventPhase(event);

                if (phase !== timeFilter) {
                    return false;
                }
            }

            return true;
        });
    }, [events, searchTerm, statusFilter, timeFilter]);

    const summary = useMemo(
        () => ({
            total: events.length,

            confirmed: events.filter(
                (event) => event.registration_status === "approved",
            ).length,

            pending: events.filter(
                (event) => event.registration_status === "pending",
            ).length,
        }),
        [events],
    );

    
    const getWithdrawalDeadline = (event) => {
        return (
            event.withdrawal_deadline ||
            event.withdrawal_until ||
            event.withdrawal_end_at ||
            event.event_start_at ||
            null
        );
    };

    const isWithdrawalAllowed = (event) => {
        if (event.registration_status === "cancelled") {
            return false;
        }

        const deadline = getWithdrawalDeadline(event);

        if (!deadline) {
            return false;
        }

        return new Date() < new Date(deadline);
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            approved: {
                label: "Confirmed",
                pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
                icon: (
                    <ShieldCheck
                        size={15}
                        className="text-emerald-600"
                    />
                ),
                accent: "bg-emerald-500",
            },

            pending: {
                label: "Pending Approval",
                pill: "border-amber-200 bg-amber-50 text-amber-700",
                icon: (
                    <Clock3
                        size={15}
                        className="text-amber-600"
                    />
                ),
                accent: "bg-amber-500",
            },

            rejected: {
                label: "Rejected",
                pill: "border-rose-200 bg-rose-50 text-rose-700",
                icon: (
                    <AlertCircle
                        size={15}
                        className="text-rose-600"
                    />
                ),
                accent: "bg-rose-500",
            },

            cancelled: {
                label: "Withdrawn",
                pill: "border-slate-200 bg-slate-100 text-slate-600",
                icon: (
                    <LogOut
                        size={15}
                        className="text-slate-500"
                    />
                ),
                accent: "bg-slate-400",
            },

            waitlisted: {
                label: "Waitlisted",
                pill: "border-sky-200 bg-sky-50 text-sky-700",
                icon: (
                    <Users
                        size={15}
                        className="text-sky-600"
                    />
                ),
                accent: "bg-sky-500",
            },

            completed: {
                label: "Completed",
                pill: "border-indigo-200 bg-indigo-50 text-indigo-700",
                icon: (
                    <Info
                        size={15}
                        className="text-indigo-600"
                    />
                ),
                accent: "bg-indigo-500",
            },
        };

        return (
            statusMap[status] || {
                label: status,
                pill: "border-slate-200 bg-slate-100 text-slate-700",
                icon: (
                    <Info
                        size={15}
                        className="text-slate-500"
                    />
                ),
                accent: "bg-slate-400",
            }
        );
    };

    const handleWithdraw = async (event) => {
        const deadline = getWithdrawalDeadline(event);

        if (!deadline || new Date() >= new Date(deadline)) {
            toast.error(
                "Withdrawal is no longer available for this registration.",
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to withdraw your registration for "${event.event_title}"?\n\nThis action cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setWithdrawingEventId(event.event_id);

            const response = await api.post(
                `/api/user/events/${event.event_id}/withdraw`,
            );

            toast.success(
                response?.data?.message || "Registration withdrawn successfully",
            );

            setEvents((current) =>
                current.map((item) =>
                    item.registration_id === event.registration_id
                        ? {
                              ...item,
                              registration_status: "cancelled",
                          }
                        : item,
                ),
            );
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    "Withdrawal failed. Please try again.",
            );
        } finally {
            setWithdrawingEventId(null);
        }
    };

    const getDisplayStatus = (event) => {
        if (
            event.registration_status === "approved" &&
            getEventPhase(event) === "completed"
        ) {
            return "completed";
        }

        return event.registration_status;
    };

    return (
        <div className="space-y-6">

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden rounded-[2rem] border border-blue-200 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 p-6 text-white shadow-lg md:p-8">

                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

                    <div className="max-w-2xl">

                        <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">
                            My Registrations
                        </p>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                            Your Event Journey
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-blue-50">
                            Review the events you've joined, monitor approval
                            status, and manage your participation.
                        </p>

                    </div>

                    {/* Summary */}
                    <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">

                        {/* Total */}
                        <div className="rounded-2xl border border-white/40 bg-white/95 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total
                            </p>

                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                {summary.total}
                            </p>

                            <p className="text-xs text-slate-500">
                                Registrations
                            </p>
                        </div>

                        {/* Confirmed */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/95 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                                Confirmed
                            </p>

                            <p className="mt-3 text-3xl font-bold text-emerald-800">
                                {summary.confirmed}
                            </p>

                            <p className="text-xs text-emerald-600">
                                Approved
                            </p>
                        </div>

                        {/* Pending */}
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/95 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                                Pending Approval
                            </p>

                            <p className="mt-3 text-3xl font-bold text-amber-800">
                                {summary.pending}
                            </p>

                            <p className="text-xs text-amber-600">
                                Awaiting review
                            </p>
                        </div>

                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-800/50" />

                <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-blue-700/50" />

            </section>


            {/* ================= FILTER BAR ================= */}
            <section className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-sm">

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                    {/* Search */}
                    <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5 transition focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">

                        <Search
                            size={16}
                            className="shrink-0 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by event title or venue..."
                            className="w-full bg-transparent pl-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />

                    </div>


                    {/* Status */}
                    <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5">

                        <Filter
                            size={16}
                            className="shrink-0 text-slate-400"
                        />

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="w-full appearance-none bg-transparent pl-2 text-sm font-medium text-slate-700 outline-none"
                        >
                            <option value="all">
                                All statuses
                            </option>

                            <option value="approved">
                                Confirmed
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="rejected">
                                Rejected
                            </option>

                            <option value="cancelled">
                                Withdrawn
                            </option>

                            <option value="waitlisted">
                                Waitlisted
                            </option>

                            <option value="completed">
                                Completed
                            </option>
                        </select>

                    </div>


                    {/* Time */}
                    <div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5">

                        <CalendarDays
                            size={16}
                            className="shrink-0 text-slate-400"
                        />

                        <select
                            value={timeFilter}
                            onChange={(event) =>
                                setTimeFilter(event.target.value)
                            }
                            className="w-full appearance-none bg-transparent pl-2 text-sm font-medium text-slate-700 outline-none"
                        >
                            <option value="all">
                                All Time
                            </option>

                            <option value="upcoming">
                                Upcoming
                            </option>

                            <option value="ongoing">
                                Ongoing
                            </option>

                            <option value="completed">
                                Completed
                            </option>
                        </select>

                    </div>

                </div>
            </section>


            {/* ================= REGISTRATIONS ================= */}
            <section>

                {loading ? (

                    <div className="rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-sm">

                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                            <RefreshCw
                                size={18}
                                className="animate-spin text-blue-600"
                            />
                        </div>

                        <p className="text-sm font-medium text-slate-500">
                            Loading your registrations...
                        </p>

                    </div>

                ) : error ? (

                    <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 shadow-sm">
                        {error}
                    </div>

                ) : filteredRegistrations.length === 0 ? (

                    <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-12 text-center shadow-sm">

                        <FileSearch
                            className="mx-auto text-slate-400"
                            size={36}
                        />

                        <h2 className="mt-4 text-lg font-semibold text-slate-800">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            timeFilter !== "all"
                                ? "No registrations match your filters"
                                : "No registrations yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            timeFilter !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "You haven't joined any events yet. Explore upcoming events and find something that interests you."}
                        </p>

                        <Link
                            to="/user/events"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Browse Events
                            <ArrowRight size={16} />
                        </Link>

                    </div>

                ) : (

    
                    <div className="space-y-4">

                        {filteredRegistrations.map((event) => {

                            const displayStatus =
                                getDisplayStatus(event);

                            const statusInfo =
                                getStatusInfo(displayStatus);

                            const canWithdraw =
                                isWithdrawalAllowed(event);

                            const withdrawalDeadline =
                                getWithdrawalDeadline(event);

                            return (
                                <article
                                    key={event.registration_id}
                                    className={`group relative overflow-hidden rounded-[1.5rem] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${statusInfo.accent.replace(
                                        "bg-",
                                        "border-",
                                    )}/40`}
                                >

                                    {/* Colored left accent */}
                                    <div
                                        className={`absolute left-0 top-0 h-full w-1.5 ${statusInfo.accent}`}
                                    />


                                    <div className="grid grid-cols-1 gap-5 p-5 pl-7 lg:grid-cols-[minmax(0,1fr)_260px_150px] lg:items-center">

                                        {/* ================= EVENT INFO ================= */}
                                        <div className="min-w-0">

                                            {/* Status + phase + mode */}
                                            <div className="flex flex-wrap items-center gap-2">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${statusInfo.pill}`}
                                                >
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>

                                                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                                    {getEventPhase(event)}
                                                </span>
												<span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
    {event.event_mode || "N/A"}
</span>



                                            </div>


                                            {/* Title */}
                                            <Link
                                                to={`/user/events/${event.event_id}`}
                                                className="mt-3 block truncate text-xl font-semibold text-slate-900 transition-colors hover:text-blue-700"
                                            >
                                                {event.event_title}
                                            </Link>


                                            {/* Category */}
                                            {(event.category ||
                                                event.event_category) && (
                                                <span className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                                    {event.category ||
                                                        event.event_category}
                                                </span>
                                            )}


                                            {/* Event metadata */}
                                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">

                                                <div className="flex items-center gap-2">

                                                    <CalendarDays
                                                        size={16}
                                                        className="text-blue-600"
                                                    />

                                                    <span>
                                                        {formatDateTime(
                                                            event.event_start_at,
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="hidden h-4 w-px bg-slate-200 sm:block" />


                                                <div className="flex items-center gap-2">

                                                    <MapPin
                                                        size={16}
                                                        className="text-indigo-600"
                                                    />

                                                    <span>
                                                        {event.venue ||
                                                            "Online"}
                                                    </span>

                                                </div>


                                                <div className="hidden h-4 w-px bg-slate-200 sm:block" />


                                                <div className="flex items-center gap-2">

                                                    <UserRound
                                                        size={16}
                                                        className="text-violet-600"
                                                    />

                                                    <span className="capitalize">
                                                        {event.participation_type?.toLowerCase() === "team"
                                                            ? "Team Participation"
                                                            : event.participation_type?.toLowerCase() === "individual"
                                                                ? "Individual Participation"
                                                                : "Participation type unavailable"}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* Registered strip */}
                                            <div className="mt-4 flex items-center gap-2 px-3 py-2">

                                                <CalendarDays
                                                    size={14}
                                                    className="text-emerald-600"
                                                />

                                                <span className="text-xs font-semibold text-emerald-700">
                                                    Registered on{" "}
                                                    {event.submitted_at
                                                        ? new Date(
                                                              event.submitted_at,
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </span>

                                            </div>

                                        </div>


                                        {/* ================= WITHDRAWAL INFO ================= */}
                                        <div
                                            className={`rounded-2xl border p-4 ${
                                                event.registration_status ===
                                                "cancelled"
                                                    ? "border-slate-200 bg-slate-50"
                                                    : canWithdraw
                                                      ? "border-emerald-100 bg-emerald-50"
                                                      : "border-rose-100 bg-rose-50"
                                            }`}
                                        >

                                            {event.registration_status ===
                                            "cancelled" ? (

                                                <>
                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200">
                                                            <Lock
                                                                size={16}
                                                                className="text-slate-500"
                                                            />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                                                            Withdrawn
                                                        </span>

                                                    </div>

                                                    <p className="mt-3 text-xs text-slate-500">
                                                        You have already
                                                        withdrawn from this
                                                        event.
                                                    </p>
                                                </>

                                            ) : canWithdraw ? (

                                                <>
                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                                                            <Clock3
                                                                size={16}
                                                                className="text-emerald-600"
                                                            />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                                            Withdrawal Available
                                                        </span>

                                                    </div>

                                                    <p className="mt-3 text-xs text-emerald-700">
                                                        You can withdraw until
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold text-emerald-800">
                                                        {formatDateTime(
                                                            withdrawalDeadline,
                                                        )}
                                                    </p>
                                                </>

                                            ) : (

                                                <>
                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100">
                                                            <Lock
                                                                size={16}
                                                                className="text-rose-600"
                                                            />
                                                        </div>

                                                        <span className="text-xs font-bold uppercase tracking-wide text-rose-700">
                                                            Withdrawal Closed
                                                        </span>

                                                    </div>

                                                    <p className="mt-3 text-xs text-rose-700">
                                                        Withdrawal deadline
                                                    </p>

                                                    {withdrawalDeadline && (
                                                        <p className="mt-1 text-sm font-bold text-rose-800">
                                                            {formatDateTime(
                                                                withdrawalDeadline,
                                                            )}
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-[11px] text-rose-600">
                                                        Deadline has passed
                                                    </p>

                                                </>
                                            )}

                                        </div>


                                        {/* ================= ACTIONS ================= */}
                                        <div className="flex flex-row gap-2 lg:flex-col">

                                            {/* Details */}
                                            <Link
                                                to={`/user/events/${event.event_id}`}
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 lg:w-full"
                                            >
                                                View Details
                                                <ArrowRight size={15} />
                                            </Link>


                                            {/* Withdraw */}
                                            {event.registration_status ===
                                            "cancelled" ? (

                                                <button
                                                    type="button"
                                                    disabled
                                                    className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 lg:w-full"
                                                >
                                                    <Lock size={14} />
                                                    Withdrawn
                                                </button>

                                            ) : canWithdraw ? (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleWithdraw(event)
                                                    }
                                                    disabled={
                                                        withdrawingEventId ===
                                                        event.event_id
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 lg:w-full"
                                                >
                                                    <LogOut size={14} />

                                                    {withdrawingEventId ===
                                                    event.event_id
                                                        ? "Withdrawing..."
                                                        : "Withdraw"}
                                                </button>

                                            ) : (

                                                <button
                                                    type="button"
                                                    disabled
                                                    title="Withdrawal is no longer available"
                                                    className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 lg:w-full"
                                                >
                                                    <Lock size={14} />
                                                    Withdrawal Closed
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </section>


            {/* Result count */}
            {!loading &&
                !error &&
                filteredRegistrations.length > 0 && (
                    <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">

                        <p className="text-xs font-medium text-slate-500">
                            Showing{" "}
                            <span className="font-bold text-blue-700">
                                {filteredRegistrations.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-slate-700">
                                {events.length}
                            </span>{" "}
                            registrations
                        </p>

                        <button
                            type="button"
                            onClick={loadRegistrations}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-800"
                        >
                            <RefreshCw size={13} />
                            Refresh
                        </button>

                    </div>
                )}

        </div>
    );
};

export default UserRegistrations;