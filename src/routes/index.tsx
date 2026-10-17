import { authClient } from "@/lib/auth-client";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Coffee, Landmark, Scissors } from "lucide-react";
import SiteShell from "../components/SiteShell";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const HIGHLIGHTS = [
	{ icon: Scissors, title: "Tenun & Ulos", text: "Warisan kain adat Batak yang ditenun tangan." },
	{
		icon: Coffee,
		title: "Kopi & Rempah",
		text: "Kopi Sidikalang dan andaliman khas dataran tinggi.",
	},
	{
		icon: Landmark,
		title: "Budaya & Wisata",
		text: "Desa adat, ukiran gorga, dan tari tortor di Samosir.",
	},
];

function Home() {
	const { data: session } = authClient.useSession();
	return (
		<SiteShell>
			<main className="page-wrap px-4 py-12">
				<section className="island-shell rounded-2xl p-6 sm:p-10">
					<p className="island-kicker mb-2">Horas! · Kawasan Danau Toba</p>
					<h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
						Dashboard Ekonomi Kreatif Toba
					</h1>
					<p className="m-0 max-w-2xl text-base leading-8 text-[var(--sea-ink-soft)]">
						Kelola produk dan pelaku ekraf di sekitar Danau Toba — dari ulos hingga kopi — dalam
						satu tempat.
					</p>
					<div className="mt-8">
						<Button asChild size="lg">
							<Link to={session?.user ? "/dashboard" : "/login"}>
								{session?.user ? "Buka Dashboard" : "Masuk"}
							</Link>
						</Button>
					</div>
				</section>
				<div className="mt-6 grid gap-4 sm:grid-cols-3">
					{HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
						<div
							key={title}
							className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5"
						>
							<Icon className="mb-3 size-6 text-primary" />
							<h2 className="m-0 text-base font-semibold">{title}</h2>
							<p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">{text}</p>
						</div>
					))}
				</div>
			</main>
		</SiteShell>
	);
}
