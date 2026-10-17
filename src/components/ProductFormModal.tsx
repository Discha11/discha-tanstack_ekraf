import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, type Category, type Product } from "@/lib/db";
import { checkImageUrl, fileToResizedJpeg } from "@/lib/format";
import { createProduct, updateProduct } from "@/lib/server/products";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Values = {
	name: string;
	description: string;
	category: Category;
	price: string;
	stock: string;
	image: string;
};

const required =
	(label: string) =>
	({ value }: { value: string }) =>
		value.trim() ? undefined : `${label} wajib diisi`;

const nonNegative =
	(label: string) =>
	({ value }: { value: string }) => {
		const n = Number(value);
		if (value.trim() === "" || !Number.isFinite(n)) return `${label} harus berupa angka`;
		return n < 0 ? `${label} tidak boleh negatif` : undefined;
	};

export function ProductFormModal({
	open,
	onOpenChange,
	product,
}: { open: boolean; onOpenChange: (open: boolean) => void; product?: Product | null }) {
	const queryClient = useQueryClient();
	const createFn = useServerFn(createProduct);
	const updateFn = useServerFn(updateProduct);
	const [serverError, setServerError] = useState("");
	const [imageError, setImageError] = useState("");

	const form = useForm({
		defaultValues: {
			name: product?.name ?? "",
			description: product?.description ?? "",
			category: product?.category ?? CATEGORIES[0],
			price: product ? String(product.price) : "",
			stock: product ? String(product.stock) : "",
			image: product?.image ?? "",
		} as Values,
		onSubmit: async ({ value }) => {
			setServerError("");
			const payload = {
				name: value.name,
				description: value.description,
				category: value.category,
				price: Number(value.price),
				stock: Number(value.stock),
				image: value.image || null,
			};
			try {
				if (product) await updateFn({ data: { id: product.id, ...payload } });
				else await createFn({ data: payload });
				await queryClient.invalidateQueries({ queryKey: ["products"] });
				onOpenChange(false);
			} catch (err) {
				setServerError(err instanceof Error ? err.message : "Gagal menyimpan produk");
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={(o) => !form.state.isSubmitting && onOpenChange(o)}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{product ? "Ubah Produk" : "Tambah Produk"}</DialogTitle>
					<DialogDescription>Data produk ekonomi kreatif kawasan Danau Toba.</DialogDescription>
				</DialogHeader>

				<form
					className="grid gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
				>
					{/* KUNCI PERBAIKAN: <form.Field> + field.state.value + field.handleChange */}
					<form.Field
						name="name"
						validators={{ onChange: required("Nama"), onBlur: required("Nama") }}
					>
						{(field) => (
							<Field label="Nama" id="name" error={field.state.meta.errors.join(", ")}>
								<Input
									id="name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="mis. Ulos Ragidup"
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="description" validators={{ onChange: required("Deskripsi") }}>
						{(field) => (
							<Field label="Deskripsi" id="description" error={field.state.meta.errors.join(", ")}>
								<Input
									id="description"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="category">
						{(field) => (
							<Field label="Kategori" id="category">
								<select
									id="category"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value as Category)}
									className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
								>
									{CATEGORIES.map((c) => (
										<option key={c} value={c} className="text-black">
											{c}
										</option>
									))}
								</select>
							</Field>
						)}
					</form.Field>

					<div className="grid gap-4 sm:grid-cols-2">
						<form.Field name="price" validators={{ onChange: nonNegative("Harga") }}>
							{(field) => (
								<Field label="Harga (Rp)" id="price" error={field.state.meta.errors.join(", ")}>
									<Input
										id="price"
										type="number"
										inputMode="numeric"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</Field>
							)}
						</form.Field>
						<form.Field name="stock" validators={{ onChange: nonNegative("Stok") }}>
							{(field) => (
								<Field label="Stok" id="stock" error={field.state.meta.errors.join(", ")}>
									<Input
										id="stock"
										type="number"
										inputMode="numeric"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
									/>
								</Field>
							)}
						</form.Field>
					</div>

					<form.Field name="image">
						{(field) => (
							<Field label="Gambar (maks 512px)" id="image" error={imageError}>
								<div className="grid gap-2">
									<Input
										id="image"
										type="file"
										accept="image/*"
										onChange={async (e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											try {
												setImageError("");
												field.handleChange(await fileToResizedJpeg(file));
											} catch (err) {
												setImageError(err instanceof Error ? err.message : "Gambar tidak valid");
											}
										}}
									/>
									<Input
										placeholder="atau tempel URL gambar https://…"
										value={field.state.value.startsWith("data:") ? "" : field.state.value}
										onChange={(e) => {
											setImageError("");
											field.handleChange(e.target.value);
										}}
										onBlur={async (e) => {
											const url = e.target.value.trim();
											if (!url) return;
											try {
												await checkImageUrl(url);
											} catch (err) {
												field.handleChange("");
												setImageError(err instanceof Error ? err.message : "URL tidak valid");
											}
										}}
									/>
									{field.state.value && !imageError && (
										<div className="flex items-center gap-3">
											<img
												src={field.state.value}
												alt="Pratinjau produk"
												className="size-24 rounded-md border object-cover"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => field.handleChange("")}
											>
												Hapus gambar
											</Button>
										</div>
									)}
								</div>
							</Field>
						)}
					</form.Field>

					{serverError && (
						<p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{serverError}
						</p>
					)}

					<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
						{([canSubmit, isSubmitting]) => (
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
									onClick={() => onOpenChange(false)}
								>
									Batal
								</Button>
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting && <Loader2 className="animate-spin" />}
									{isSubmitting ? "Menyimpan…" : "Simpan"}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	label,
	id,
	error,
	children,
}: { label: string; id: string; error?: string; children: React.ReactNode }) {
	return (
		<div className="grid gap-1.5">
			<Label htmlFor={id}>{label}</Label>
			{children}
			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
}
