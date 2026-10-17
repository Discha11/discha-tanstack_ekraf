import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UserRoleModal } from "@/components/UserRoleModal";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/db";
import { deleteUser, getUsers } from "@/lib/server/users";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, UserCog } from "lucide-react";
import { useState } from "react";

type Row = { id: string; email: string; name: string | null; role: Role; createdAt: string };

export const Route = createFileRoute("/_admin/users")({
	// Guard untuk UX saja; keamanan sebenarnya ada di requireAdmin() pada server function.
	beforeLoad: ({ context }) => {
		if (context.role !== "admin") throw redirect({ to: "/dashboard" });
	},
	component: UsersPage,
});

function UsersPage() {
	const { user: me } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const query = useQuery({ queryKey: ["users"], queryFn: () => getUsers() });
	const deleteFn = useServerFn(deleteUser);

	const [editing, setEditing] = useState<Row | null>(null);
	const [toDelete, setToDelete] = useState<Row | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const confirmDelete = async () => {
		if (!toDelete) return;
		setDeleting(true);
		setDeleteError("");
		try {
			await deleteFn({ data: { userId: toDelete.id } });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
			setToDelete(null);
		} catch (err) {
			setDeleteError(err instanceof Error ? err.message : "Gagal menghapus");
		} finally {
			setDeleting(false);
		}
	};

	const data = (query.data ?? []) as Row[];

	return (
		<div className="mx-auto grid max-w-5xl gap-4">
			<div>
				<h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Pengguna</h1>
				<p className="text-sm text-[var(--sea-ink-soft)]">
					Kelola akun dan role. Khusus administrator.
				</p>
			</div>

			{query.isPending ? (
				<div className="grid gap-2">
					{[0, 1, 2].map((i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : query.isError ? (
				<div
					role="alert"
					className="rounded-xl border border-destructive/40 p-6 text-sm text-destructive"
				>
					Gagal memuat pengguna: {(query.error as Error).message}
				</div>
			) : data.length === 0 ? (
				<div className="rounded-xl border border-dashed border-[var(--line)] p-10 text-center text-[var(--sea-ink-soft)]">
					Belum ada pengguna.
				</div>
			) : (
				<ul className="grid gap-3">
					{data.map((u) => {
						const isMe = u.id === me.id;
						return (
							<li
								key={u.id}
								className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-4"
							>
								<div className="min-w-0 flex-1">
									<p className="m-0 truncate font-semibold">
										{u.name ?? "—"}{" "}
										{isMe && (
											<span className="text-xs font-normal text-[var(--sea-ink-soft)]">(Anda)</span>
										)}
									</p>
									<p className="m-0 truncate text-sm text-[var(--sea-ink-soft)]">{u.email}</p>
								</div>
								<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
									{u.role === "admin" ? "Administrator" : "User"}
								</span>
								<div className="flex gap-1">
									<Button variant="outline" size="sm" disabled={isMe} onClick={() => setEditing(u)}>
										<UserCog /> Role
									</Button>
									<Button
										variant="ghost"
										size="icon"
										disabled={isMe}
										aria-label={`Hapus ${u.email}`}
										onClick={() => {
											setDeleteError("");
											setToDelete(u);
										}}
									>
										<Trash2 className="text-destructive" />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			<UserRoleModal user={editing} onClose={() => setEditing(null)} />
			<ConfirmDialog
				open={!!toDelete}
				onOpenChange={(o) => !o && setToDelete(null)}
				title="Hapus pengguna?"
				description={`Akun ${toDelete?.email ?? ""} akan dihapus dan tidak bisa login lagi.`}
				loading={deleting}
				error={deleteError}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
