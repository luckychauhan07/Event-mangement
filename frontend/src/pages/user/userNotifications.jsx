import { useEffect, useMemo, useState } from "react";
import {
	Bell,
	BellRing,
	CheckCircle2,
	Clock3,
	ExternalLink,
	Filter,
	Info,
	Megaphone,
	Search,
	ShieldAlert,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";
import {
	getMyNotifications,
	markNotificationRead,
	markAllNotificationsRead,
} from "../../services/notificationServices";

const notificationTypeStyles = {
	approval: {
		icon: <CheckCircle2 size={17} />,
		style: "border-l-emerald-500 bg-emerald-50/70",
	},
	team: {
		icon: <Users size={17} />,
		style: "border-l-blue-500 bg-blue-50/70",
	},
	reminder: {
		icon: <Clock3 size={17} />,
		style: "border-l-sky-500 bg-sky-50/70",
	},
	announcement: {
		icon: <Megaphone size={17} />,
		style: "border-l-indigo-500 bg-indigo-50/70",
	},
	system: {
		icon: <ShieldAlert size={17} />,
		style: "border-l-rose-500 bg-rose-50/70",
	},
	default: {
		icon: <Info size={17} />,
		style: "border-l-slate-400 bg-slate-50/70",
	},
};

const UserNotifications = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [notifications, setNotifications] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const loadNotifications = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await getMyNotifications({ limit: 50, offset: 0 });
			setNotifications(data?.notifications || []);
		} catch (err) {
			setNotifications([]);
			setError(
				err?.response?.data?.message ||
					"Unable to fetch notifications right now.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadNotifications();
	}, []);

	const unreadCount = useMemo(
		() => notifications.filter((notification) => !notification.is_read).length,
		[notifications],
	);

	const filteredNotifications = useMemo(() => {
		return notifications.filter((notification) => {
			const haystack = [
				notification.title,
				notification.message,
				notification.target_role,
				notification.sender_role,
				notification.priority,
			]
				.join(" ")
				.toLowerCase();

			const matchesSearch = haystack.includes(searchTerm.toLowerCase());
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "read" && notification.is_read) ||
				(statusFilter === "unread" && !notification.is_read);

			return matchesSearch && matchesStatus;
		});
	}, [notifications, searchTerm, statusFilter]);

	const handleMarkRead = async (id) => {
		try {
			await markNotificationRead(id);
			setNotifications((current) =>
				current.map((item) =>
					item.id === id ? { ...item, is_read: true } : item,
				),
			);
		} catch (err) {
			toast.error(err?.response?.data?.message || "Failed to mark as read");
		}
	};

	const handleMarkAllRead = async () => {
		if (unreadCount === 0) return;

		const toastId = toast.loading("Marking all as read...");
		try {
			await markAllNotificationsRead();
			setNotifications((current) =>
				current.map((item) => ({ ...item, is_read: true })),
			);
			toast.success("All notifications marked as read.", { id: toastId });
		} catch (err) {
			toast.error(err?.response?.data?.message || "Failed to mark all as read.", { id: toastId });
		}
	};

	return (
		<div className="space-y-6">
			<section className="relative overflow-hidden rounded-[2rem] border border-blue-200 bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 p-6 text-white shadow-lg md:p-8">
				<div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
							<BellRing size={14} />
							Notifications
						</div>
						<h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
							Stay Updated
						</h1>
						<p className="mt-3 max-w-xl text-sm leading-6 text-slate-50">
							Track event updates, registration approvals, announcements, and system messages all in one place.
						</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
						<div className="rounded-2xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Total
							</p>
							<p className="mt-3 text-3xl font-bold text-slate-900">
								{notifications.length}
							</p>
							<p className="text-xs text-slate-500">All messages</p>
						</div>
						<div className="rounded-2xl bg-amber-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
								Unread
							</p>
							<p className="mt-3 text-3xl font-bold text-amber-800">
								{unreadCount}
							</p>
							<p className="text-xs text-amber-700">Require attention</p>
						</div>
						<div className="rounded-2xl bg-emerald-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
								Read
							</p>
							<p className="mt-3 text-3xl font-bold text-emerald-800">
								{notifications.length - unreadCount}
							</p>
							<p className="text-xs text-emerald-700">Already viewed</p>
						</div>
					</div>
				</div>
			</section>

			<section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
				<div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
					<div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
						<Search size={16} className="text-slate-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search title, message, sender, or priority"
							className="w-full bg-transparent pl-2 text-sm text-slate-20 outline-none placeholder:text-slate-400"
						/>
					</div>

					<div className="relative flex items-center rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
						<Filter size={16} className="text-slate-400" />
						<select
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
							className="w-full appearance-none bg-transparent pl-2 text-sm font-medium text-slate-700 outline-none"
						>
							<option value="all">All notifications</option>
							<option value="unread">Unread</option>
							<option value="read">Read</option>
						</select>
					</div>
					<button
						type="button"
						onClick={handleMarkAllRead}
						disabled={unreadCount === 0}
						className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<CheckCircle2 size={16} />
						Mark all read
					</button>
				</div>
			</section>

			<section className="rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 p-5 shadow-sm">
				{loading ? (
					<p className="text-sm font-medium text-slate-500">
						Loading notifications...
					</p>
				) : error ? (
					<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
						{error}
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
						<Bell className="mx-auto text-slate-400" size={36} />
						<h2 className="mt-4 text-lg font-semibold text-slate-800">
							You're all caught up
						</h2>
						<p className="mt-2 text-sm text-slate-500">
							New notifications from admins or teachers will appear here.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4">
    {filteredNotifications.map((notification) => {
        const typeStyle =
            notificationTypeStyles[notification.type] ||
            notificationTypeStyles.default;

        const isUnread = !notification.is_read;

        return (
            <article
                key={notification.id}
                className={`group relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    isUnread
                        ? "border-blue-200 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/60"
                        : "border-slate-200 bg-gradient-to-r from-slate-50/70 via-white to-white"
                }`}
            >
                {/* Colored left accent */}
                <div
                    className={`absolute left-0 top-0 h-full w-1 ${
                        isUnread ? "bg-blue-500" : "bg-slate-300"
                    }`}
                />

                <div className="p-5 pl-6">
                    <div className="flex gap-4">
                        {/* Notification icon */}
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                isUnread
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            {typeStyle.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                            {/* Top row */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2
                                            className={`text-base tracking-tight ${
                                                isUnread
                                                    ? "font-bold text-slate-900"
                                                    : "font-semibold text-slate-800"
                                            }`}
                                        >
                                            {notification.title}
                                        </h2>

                                        {isUnread && (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                                        {notification.message}
                                    </p>
                                </div>

                                {/* Priority */}
                                {notification.priority && (
                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                            notification.priority === "high"
                                                ? "border-rose-200 bg-rose-50 text-rose-600"
                                                : notification.priority === "urgent"
                                                  ? "border-red-200 bg-red-50 text-red-600"
                                                  : "border-slate-200 bg-slate-100 text-slate-500"
                                        }`}
                                    >
                                        {notification.priority}
                                    </span>
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock3 size={13} />
                                    {new Date(
                                        notification.created_at,
                                    ).toLocaleString()}
                                </span>

                                {notification.sender_role && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Users size={13} />
                                        From {notification.sender_role}
                                    </span>
                                )}
                            </div>

                            {/* Bottom actions */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-4">
                                {notification.link_url && (
                                    <a
                                        href={notification.link_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                    >
                                        <ExternalLink size={14} />
                                        Open
                                    </a>
                                )}

                                {isUnread ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleMarkRead(notification.id)
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                                    >
                                        <CheckCircle2 size={14} />
                                        Mark as read
                                    </button>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-500">
                                        <CheckCircle2 size={14} />
                                        Read
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    })}
</div>
				)}
			</section>
		</div>
	);
};

export default UserNotifications;
