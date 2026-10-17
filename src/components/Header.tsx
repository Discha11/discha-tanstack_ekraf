// src/components/Header.tsx
import { Link } from "@tanstack/react-router";
import { Mountain } from "lucide-react";
import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center gap-4 py-3">
				<Link
					to="/"
					className="inline-flex items-center gap-2 font-semibold text-[var(--sea-ink)] no-underline"
				>
					<Mountain className="size-5 text-primary" />
					Ekraf Toba
				</Link>
				<div className="flex items-center gap-4 text-sm font-semibold">
					<Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
						Beranda
					</Link>
					<Link
						to="/dashboard"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Dashboard
					</Link>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<BetterAuthHeader />
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
