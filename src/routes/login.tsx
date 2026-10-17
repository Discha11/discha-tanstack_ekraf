import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server/auth";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2, Mountain } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const { user } = await getServerSession();
		if (user) throw redirect({ to: "/dashboard" });
	},
	component: Login,
});

function Login() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"in" | "up">("in");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res =
				mode === "in"
					? await authClient.signIn.email({ email, password })
					: await authClient.signUp.email({ email, password, name });
			if (res.error) {
				// Pesan generik: tidak membocorkan apakah email terdaftar (user enumeration)
				setError(
					res.error.status === 429
						? "Terlalu banyak percobaan. Coba lagi dalam satu menit."
						: mode === "in"
							? "Email atau kata sandi salah."
							: (res.error.message ?? "Pendaftaran gagal."),
				);
				return;
			}
			await navigate({ to: "/dashboard" });
		} catch {
			setError("Terjadi kesalahan. Coba lagi.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="relative flex min-h-screen items-center justify-center px-4 py-12">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] p-8 shadow-xl backdrop-blur">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
						<Mountain className="size-6" />
					</div>
					<h1 className="display-title text-2xl font-bold text-[var(--sea-ink)]">Ekraf Toba</h1>
					<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
						{mode === "in" ? "Masuk ke dashboard ekonomi kreatif Danau Toba" : "Buat akun baru"}
					</p>
				</div>

				<form onSubmit={submit} className="grid gap-4">
					{mode === "up" && (
						<div className="grid gap-1.5">
							<Label htmlFor="name">Nama</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								autoComplete="name"
							/>
						</div>
					)}
					<div className="grid gap-1.5">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="password">Kata sandi</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							minLength={8}
							autoComplete={mode === "in" ? "current-password" : "new-password"}
						/>
					</div>
					{error && (
						<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</p>
					)}
					<Button type="submit" disabled={loading}>
						{loading && <Loader2 className="animate-spin" />}
						{mode === "in" ? "Masuk" : "Daftar"}
					</Button>
				</form>

				<button
					type="button"
					className="mt-4 w-full text-center text-sm text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
					onClick={() => {
						setMode(mode === "in" ? "up" : "in");
						setError("");
					}}
				>
					{mode === "in" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
				</button>
				<p className="mt-4 text-center text-xs text-[var(--sea-ink-soft)]">
					Pertama kali?{" "}
					<Link to="/setup" className="underline">
						Siapkan akun admin
					</Link>
				</p>
			</div>
		</main>
	);
}
