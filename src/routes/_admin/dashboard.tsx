import { CATEGORIES } from "@/lib/db";
import { getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Package, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/_admin/dashboard")({ component: Dashboard });

function Dashboard() {
	const { role } = Route.useRouteContext();
	const products = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
	const users = useQuery({
		queryKey: ["users"],
		queryFn: () => getUsers(),
		enabled: role === "admin",
	});

	const list = products.data ?? [];
	const max = Math.max(1, ...CATEGORIES.map((c) => list.filter((p) => p.category === c).length));

	return (
		<div className="mx-auto grid max-w-5xl gap-6">
			<section className="island-shell rounded-2xl p-6">
				<p className="island-kicker mb-1">Horas! · Kawasan Danau Toba</p>
				<h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Ringkasan Ekraf</h1>
				<p className="mt-1 text-[var(--sea-ink-soft)]">
					Pantau produk ulos, kopi, rempah, kerajinan dan paket wisata budaya dari Samosir dan
					sekitarnya.
				</p>
			</section>

			<div className="grid gap-4 sm:grid-cols-3">
				<Stat
					icon={Package}
					label="Produk"
					value={products.data?.length}
					loading={products.isPending}
				/>
				{role === "admin" && (
					<>
						<Stat
							icon={Users}
							label="Pengguna"
							value={users.data?.length}
							loading={users.isPending}
						/>
						<Stat
							icon={ShieldCheck}
							label="Administrator"
							value={users.data?.filter((u) => u.role === "admin").length}
							loading={users.isPending}
						/>
					</>
				)}
			</div>

			<section className="island-shell rounded-2xl p-6">
				<h2 className="mb-4 text-lg font-semibold text-[var(--sea-ink)]">Produk per kategori</h2>
				{products.isError ? (
					<p role="alert" className="text-sm text-destructive">
						Gagal memuat data: {(products.error as Error).message}
					</p>
				) : products.isPending ? (
					<div className="grid gap-3">
						{[0, 1, 2].map((i) => (
							<div key={i} className="h-6 animate-pulse rounded bg-muted" />
						))}
					</div>
				) : list.length === 0 ? (
					<p className="text-sm text-[var(--sea-ink-soft)]">
						Belum ada produk. Tambahkan dari menu Produk.
					</p>
				) : (
					<ul className="grid gap-3">
						{CATEGORIES.map((c) => {
							const n = list.filter((p) => p.category === c).length;
							return (
								<li
									key={c}
									className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2rem]"
								>
									<span className="truncate">{c}</span>
									<span className="h-3 overflow-hidden rounded-full bg-muted">
										<span
											className="block h-full rounded-full bg-primary"
											style={{ width: `${(n / max) * 100}%` }}
										/>
									</span>
									<span className="text-right font-semibold">{n}</span>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</div>
	);
}

function Stat({
	icon: Icon,
	label,
	value,
	loading,
}: { icon: typeof Package; label: string; value?: number; loading: boolean }) {
	return (
		<div className="flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-5">
			<Icon className="size-8 text-primary" />
			<div>
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">{label}</p>
				{loading ? (
					<div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
				) : (
					<p className="m-0 text-3xl font-bold text-[var(--sea-ink)]">{value ?? 0}</p>
				)}
			</div>
		</div>
	);
}
