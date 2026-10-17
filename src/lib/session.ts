import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/db";
import { getRequest } from "@tanstack/react-start/server";

export async function getCurrentSession() {
	try {
		const request = getRequest();
		const result = await auth.api.getSession({
			headers: request.headers,
		});
		return {
			session: result?.session ?? null,
			user: result?.user ?? null,
			role: result?.user ? getUserRole(result.user.id) : null,
		};
	} catch {
		return {
			session: null,
			user: null,
			role: null,
		};
	}
}

export async function requireAuth() {
	const { session, user, role } = await getCurrentSession();
	if (!session || !user) {
		const err = new Error("Unauthorized");
		Object.assign(err, { status: 401 });
		throw err;
	}
	return { session, user, role };
}

export async function requireAdmin() {
	const { session, user, role } = await requireAuth();
	if (role !== "admin") {
		const err = new Error("Forbidden: Akses admin diperlukan");
		Object.assign(err, { status: 403 });
		throw err;
	}
	return { session, user, role };
}
