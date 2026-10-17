import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server/auth";
import { Link, Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	LayoutDashboard,
	LogOut,
	Menu,
	Mountain,
	Package,
	PanelLeftClose,
	PanelLeftOpen,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async () => {
		const { user, role } = await getServerSession();
		if (!user || !role) throw redirect({ to: "/login" });
		return { user, role };
	},
	component: AdminLayout,
});

const NAV = [
	{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
	{ to: "/products", label: "Produk", icon: Package, adminOnly: false },
	{ to: "/users", label: "Pengguna", icon: Users, adminOnly: true },
] as const;

function AdminLayout() {
	const { user, role } = Route.useRouteContext();
	const navigate = useNavigate();
	const [collapsed, setCollapsed] = useState(false);
	const [drawer, setDrawer] = useState(false);
	const items = NAV.filter((n) => !n.adminOnly || role === "admin");

	const nav = (showLabels: boolean) => (
		<nav className="grid gap-1 p-3">
			{items.map(({ to, label, icon: Icon }) => (
				<Link
					key={to}
					to={to}
					onClick={() => setDrawer(false)}
					title={label}
					className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)]"
					activeProps={{ className: "bg-primary/10 !text-primary" }}
				>
					<Icon className="size-5 shrink-0" />
					{showLabels && <span>{label}</span>}
				</Link>
			))}
		</nav>
	);

	const brand = (showLabel: boolean) => (
		<div className="flex h-14 items-center gap-2 border-b border-[var(--line)] px-4 font-semibold text-[var(--sea-ink)]">
			<Mountain className="size-5 shrink-0 text-primary" />
			{showLabel && "Ekraf Toba"}
		</div>
	);

	return (
		<div className="flex min-h-screen">
			<aside
				className={`sticky top-0 hidden h-screen shrink-0 border-r border-[var(--line)] bg-[var(--header-bg)] backdrop-blur transition-[width] md:block ${collapsed ? "w-16" : "w-60"}`}
			>
				{brand(!collapsed)}
				{nav(!collapsed)}
			</aside>

			{drawer && (
				<div className="fixed inset-0 z-50 md:hidden">
					<button
						type="button"
						aria-label="Tutup menu"
						className="absolute inset-0 bg-black/50"
						onClick={() => setDrawer(false)}
					/>
					<aside className="absolute inset-y-0 left-0 w-64 bg-[var(--bg-base)] shadow-xl">
						<div className="flex items-center justify-between pr-2">
							{brand(true)}
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setDrawer(false)}
								aria-label="Tutup"
							>
								<X />
							</Button>
						</div>
						{nav(true)}
					</aside>
				</div>
			)}

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur">
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={() => setDrawer(true)}
						aria-label="Buka menu"
					>
						<Menu />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="hidden md:inline-flex"
						onClick={() => setCollapsed((c) => !c)}
						aria-label="Ciutkan sidebar"
					>
						{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
					</Button>
					<div className="ml-auto flex items-center gap-2">
						<span className="hidden text-sm text-[var(--sea-ink-soft)] sm:block">
							{user.email} · {role === "admin" ? "Admin" : "User"}
						</span>
						<ThemeToggle />
						<Button
							variant="outline"
							size="sm"
							onClick={async () => {
								await authClient.signOut();
								await navigate({ to: "/login" });
							}}
						>
							<LogOut /> <span className="hidden sm:inline">Keluar</span>
						</Button>
					</div>
				</header>
				<main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
