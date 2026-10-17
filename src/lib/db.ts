import { memoryAdapter } from "@better-auth/memory-adapter";

export const CATEGORIES = [
	"Tenun & Ulos",
	"Kuliner & Rempah",
	"Kopi",
	"Kerajinan Kayu",
	"Wisata & Budaya",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Role = "admin" | "user";

export interface Product {
	id: string;
	name: string;
	description: string;
	category: Category;
	price: number;
	stock: number;
	image: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface UserRoleRecord {
	userId: string;
	role: Role;
}

export interface MemoryDb {
	[key: string]: any[];
	user: any[];
	session: any[];
	account: any[];
	verification: any[];
	userRole: UserRoleRecord[];
	product: Product[];
}

export const SEED_ADMIN_EMAIL = "admin@example.com";
export const SEED_ADMIN_PASSWORD = "admin12345";

// Global singleton to persist across HMR in dev if needed
const globalForDb = globalThis as unknown as {
	__memoryDb?: MemoryDb;
};

export const db: MemoryDb = globalForDb.__memoryDb ?? {
	user: [],
	session: [],
	account: [],
	verification: [],
	userRole: [],
	product: [],
};

if (process.env.NODE_ENV !== "production") {
	globalForDb.__memoryDb = db;
}

export const adapter = memoryAdapter(db);

export function getUserRole(userId: string): Role {
	return db.userRole.find((r) => r.userId === userId)?.role ?? "user";
}

export function setUserRole(userId: string, role: Role) {
	const existing = db.userRole.find((r) => r.userId === userId);
	if (existing) {
		existing.role = role;
	} else {
		db.userRole.push({ userId, role });
	}
}

export function removeUserRole(userId: string) {
	db.userRole = db.userRole.filter((r) => r.userId !== userId);
}
