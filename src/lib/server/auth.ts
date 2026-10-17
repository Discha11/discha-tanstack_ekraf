import { auth } from "@/lib/auth";
import { type Category, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { createServerFn } from "@tanstack/react-start";

export const getServerSession = createServerFn({ method: "GET" }).handler(async () =>
	getCurrentSession(),
);

const SAMPLE_PRODUCTS: {
	name: string;
	description: string;
	category: Category;
	price: number;
	stock: number;
}[] = [
	{
		name: "Ulos Ragidup",
		description: "Kain tenun tangan khas Batak, motif sarat makna adat.",
		category: "Tenun & Ulos",
		price: 1250000,
		stock: 8,
	},
	{
		name: "Kopi Sidikalang 250g",
		description: "Biji kopi arabika dataran tinggi, aroma kuat dan earthy.",
		category: "Kopi",
		price: 85000,
		stock: 40,
	},
	{
		name: "Andaliman Kering 100g",
		description: "Rempah khas Tanah Batak, rasa pedas-menggigit untuk arsik.",
		category: "Kuliner & Rempah",
		price: 45000,
		stock: 60,
	},
	{
		name: "Patung Gorga Mini",
		description: "Ukiran kayu bermotif gorga, cinderamata khas Samosir.",
		category: "Kerajinan Kayu",
		price: 275000,
		stock: 12,
	},
	{
		name: "Paket Wisata Desa Tomok",
		description: "Tur budaya setengah hari: makam Raja Sidabutar & tari tortor.",
		category: "Wisata & Budaya",
		price: 350000,
		stock: 20,
	},
];

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	if (db.userRole.some((r) => r.role === "admin")) {
		return { ok: true, alreadySeeded: true, admin: SEED_ADMIN_EMAIL };
	}
	// Jangan mempromosikan akun yang sudah ada: orang bisa mendaftar dengan email admin lebih dulu.
	if (db.user.some((u) => u.email === SEED_ADMIN_EMAIL)) {
		throw new Error(
			"Email admin sudah terdaftar tanpa role admin. Restart server lalu jalankan /setup lagi.",
		);
	}
	await auth.api.signUpEmail({
		body: {
			email: SEED_ADMIN_EMAIL,
			password: process.env.SEED_ADMIN_PASSWORD ?? SEED_ADMIN_PASSWORD,
			name: "Administrator",
		},
		headers: new Headers(),
	});
	const adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
	if (adminUser) db.userRole.push({ userId: adminUser.id, role: "admin" });

	if (db.product.length === 0) {
		const now = new Date().toISOString();
		db.product.push(
			...SAMPLE_PRODUCTS.map((p) => ({
				id: crypto.randomUUID(),
				...p,
				image: null,
				createdAt: now,
				updatedAt: now,
			})),
		);
	}
	return { ok: true, alreadySeeded: false, admin: SEED_ADMIN_EMAIL };
});
