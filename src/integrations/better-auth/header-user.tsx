import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
// src/integrations/better-auth/header-user.tsx
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();

	if (isPending) return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />;
	if (session?.user) {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={async () => {
					await authClient.signOut();
					await navigate({ to: "/login" });
				}}
			>
				<LogOut /> Keluar
			</Button>
		);
	}
	return (
		<Button asChild size="sm">
			<Link to="/login">Masuk</Link>
		</Button>
	);
}
