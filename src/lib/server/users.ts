import { db, getUserRole, removeUserRole, setUserRole } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const userRoleSchema = z.object({
	userId: z.string().min(1),
	role: z.enum(["admin", "user"]),
});

const httpError = (message: string, status: number) =>
	Object.assign(new Error(message), { status });
const adminCount = () => db.userRole.filter((r) => r.role === "admin").length;

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		const { user: me } = await requireAdmin();
		if (!db.user.some((u) => u.id === data.userId)) throw httpError("User tidak ditemukan", 404);
		if (data.userId === me.id && data.role !== "admin") {
			throw httpError("Anda tidak dapat menurunkan role akun Anda sendiri", 400);
		}
		if (getUserRole(data.userId) === "admin" && data.role !== "admin" && adminCount() <= 1) {
			throw httpError("Tidak dapat menurunkan administrator terakhir", 400);
		}
		setUserRole(data.userId, data.role);
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string().min(1) }))
	.handler(async ({ data }) => {
		const { user: me } = await requireAdmin();
		if (data.userId === me.id) throw httpError("Anda tidak dapat menghapus akun Anda sendiri", 400);
		if (!db.user.some((u) => u.id === data.userId)) throw httpError("User tidak ditemukan", 404);
		if (getUserRole(data.userId) === "admin" && adminCount() <= 1) {
			throw httpError("Tidak dapat menghapus administrator terakhir", 400);
		}
		db.user = db.user.filter((u) => u.id !== data.userId);
		db.session = (db.session as { userId: string }[]).filter((s) => s.userId !== data.userId);
		db.account = (db.account as { userId: string }[]).filter((a) => a.userId !== data.userId);
		removeUserRole(data.userId);
		return { ok: true };
	});
