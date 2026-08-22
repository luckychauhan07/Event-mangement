import {
	LayoutDashboard,
	Users,
	CalendarDays,
	PlusCircle,
	BarChart3,
	Bell,
	User,
} from "lucide-react";

export const adminMenu = [
	{
		title: "🏠 Dashboard",
		key: "dashboard",
		path: "/admin",
		icon: LayoutDashboard,
	},
	{
		title: "👥 Users",
		key: "users",
		path: "/admin/users",
		icon: Users,
	},
	{
		title: "📅 Events",
		key: "events",
		path: "/admin/events",
		icon: CalendarDays,
	},
	{
		title: "➕ Add Event",
		key: "add-event",
		path: "/admin/add-event",
		icon: PlusCircle,
	},
	{
		title: "📊 Reports",
		key: "reports",
		path: "/admin/reports",
		icon: BarChart3,
	},
	{
		title: "🔔 Notifications",
		key: "notifications",
		path: "/admin/notifications",
		icon: Bell,
	},
	{
		title: "👤 Profile",
		key: "profile",
		path: "/admin/profile",
		icon: User,
	},
];

export const teacherMenu = [
	{
		title: "🏠 Dashboard",
		key: "dashboard",
		path: "/teacher",
		icon: LayoutDashboard,
	},
	{
		title: "👥 Users",
		key: "users",
		path: "/teacher/users",
		icon: Users,
	},
	{
		title: "📅 Events",
		key: "events",
		path: "/teacher/events",
		icon: CalendarDays,
	},
	{
		title: "➕ Add Event",
		key: "add-event",
		path: "/teacher/add-event",
		icon: PlusCircle,
	},
	{
		title: "🔔 Notifications",
		key: "notifications",
		path: "/teacher/notifications",
		icon: Bell,
	},
	{
		title: "👤 Profile",
		key: "profile",
		path: "/teacher/profile",
		icon: User,
	},
];

export const userMenu = [
	{
		title: "🏠 Dashboard",
		key: "dashboard",
		path: "/user",
		icon: LayoutDashboard,
	},
	{
		title: "📅 Events",
		key: "events",
		path: "/user/events",
		icon: CalendarDays,
	},
	{
		title: "👥 My Registrations",
		key: "registrations",
		path: "/user/registrations",
		icon: Users,
	},
	{
		title: "🔔 Notifications",
		key: "notifications",
		path: "/user/notifications",
		icon: Bell,
	},
	{
		title: "👤 Profile",
		key: "profile",
		path: "/user/profile",
		icon: User,
	},
];

export const studentMenu = [
	{
		title: "Dashboard",
		key: "dashboard",
		path: "/student",
		icon: LayoutDashboard,
	},
	{
		title: "Events",
		key: "events",
		path: "/student/events",
		icon: CalendarDays,
	},
	{
		title: "Notifications",
		key: "notifications",
		path: "/student/notifications",
		icon: Bell,
	},
	{
		title: "Profile",
		key: "profile",
		path: "/student/profile",
		icon: User,
	},
];
