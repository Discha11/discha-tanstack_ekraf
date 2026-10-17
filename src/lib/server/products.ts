import { CATEGORIES, type Product, db } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/session";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_IMAGE_PX = 512;
const MAX_DATA_URL_LENGTH = 400_000;

/** Baca lebar/tinggi dari byte JPEG (cari marker SOFn). */
function jpegSize(bytes: Uint8Array): { w: number; h: number } | null {
	if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
	let i = 2;
	while (i + 9 < bytes.length) {
		if (bytes[i] !== 0xff) return null;
		const marker = bytes[i + 1];
		const len = (bytes[i + 2] << 8) | bytes[i + 3];
		if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
			return { h: (bytes[i + 5] << 8) | bytes[i + 6], w: (bytes[i + 7] << 8) | bytes[i + 8] };
		}
		i += 2 + len;
	}
	return null;
}

const noHtml = (v: string) => !/[<>]/.test(v);

const imageSchema = z
	.string()
	.max(MAX_DATA_URL_LENGTH, "Gambar terlalu besar")
	.refine((v) => {
		// URL https: tidak di-fetch server, jadi tidak ada risiko SSRF
		if (/^https:\/\/[^\s]+$/i.test(v)) return v.length <= 2048;
		// data URL JPEG: dimensi dicek ulang di server
		const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(v);
		if (!m) return false;
		const size = jpegSize(Buffer.from(m[1], "base64"));
		return !!size && size.w <= MAX_IMAGE_PX && size.h <= MAX_IMAGE_PX;
	}, `Gambar harus URL https atau JPEG maksimal ${MAX_IMAGE_PX}px`)
	.nullable();

export const productSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama wajib diisi")
		.max(80)
		.refine(noHtml, "Karakter < > tidak diizinkan"),
	description: z
		.string()
		.trim()
		.min(1, "Deskripsi wajib diisi")
		.max(500)
		.refine(noHtml, "Karakter < > tidak diizinkan"),
	category: z.enum(CATEGORIES),
	price: z.coerce.number().min(0, "Harga tidak boleh negatif").max(1_000_000_000),
	stock: z.coerce
		.number()
		.int("Stok harus bilangan bulat")
		.min(0, "Stok tidak boleh negatif")
		.max(1_000_000),
	image: imageSchema,
});
export type ProductInput = z.infer<typeof productSchema>;

const httpError = (message: string, status: number) =>
	Object.assign(new Error(message), { status });

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product: Product = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().uuid(), ...productSchema.shape }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) throw httpError("Produk tidak ditemukan", 404);
		const updated: Product = { ...db.product[index], ...data, updatedAt: new Date().toISOString() };
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().uuid() }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) throw httpError("Produk tidak ditemukan", 404);
		db.product.splice(index, 1);
		return { ok: true };
	});
