import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Role } from "@/lib/db";
import { updateUserRole } from "@/lib/server/users";
// UserRoleModal.tsx
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type U = { id: string; email: string; role: Role };

export function UserRoleModal({ user, onClose }: { user: U | null; onClose: () => void }) {
	return (
		<Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
			<DialogContent>{user && <Body key={user.id} user={user} onClose={onClose} />}</DialogContent>
		</Dialog>
	);
}

function Body({ user, onClose }: { user: U; onClose: () => void }) {
	const queryClient = useQueryClient();
	const updateFn = useServerFn(updateUserRole);
	const [role, setRole] = useState<Role>(user.role);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const save = async () => {
		setSaving(true);
		setError("");
		try {
			await updateFn({ data: { userId: user.id, role } });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal mengubah role");
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Ubah Role</DialogTitle>
				<DialogDescription>{user.email}</DialogDescription>
			</DialogHeader>
			<select
				value={role}
				onChange={(e) => setRole(e.target.value as Role)}
				aria-label="Role"
				className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
			>
				<option value="user" className="text-black">
					User
				</option>
				<option value="admin" className="text-black">
					Administrator
				</option>
			</select>
			{error && (
				<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</p>
			)}
			<DialogFooter>
				<Button variant="outline" disabled={saving} onClick={onClose}>
					Batal
				</Button>
				<Button disabled={saving || role === user.role} onClick={save}>
					{saving && <Loader2 className="animate-spin" />}
					Simpan
				</Button>
			</DialogFooter>
		</>
	);
}
