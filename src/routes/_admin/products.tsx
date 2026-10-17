import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductFormModal } from "@/components/ProductFormModal";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/db";
import { rupiah } from "@/lib/format";
import { deleteProduct, getProducts } from "@/lib/server/products";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	createColumnHelper,
	flexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_admin/products")({ component: Products });

const features = tableFeatures({ rowSortingFeature });
const columnHelper = createColumnHelper<typeof features, Product>();

function Thumb({ src }: { src: string | null }) {
	return src ? (
		<img src={src} alt="" className="size-12 shrink-0 rounded-md border object-cover" />
	) : (
		<div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
			<ImageOff className="size-4" />
		</div>
	);
}

function Products() {
	const { role } = Route.useRouteContext();
	const isAdmin = role === "admin";
	const queryClient = useQueryClient();
	const query = useQuery({ queryKey: ["products"], queryFn: () => getProducts() });
	const deleteFn = useServerFn(deleteProduct);

	const [form, setForm] = useState<{ open: boolean; product: Product | null }>({
		open: false,
		product: null,
	});
	const [toDelete, setToDelete] = useState<Product | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const columns = columnHelper.columns([
		columnHelper.display({
			id: "image",
			header: "",
			cell: (i) => <Thumb src={(i.row.original as Product).image} />,
		}),
		columnHelper.accessor("name", { header: "Nama" }),
		columnHelper.accessor("category", { header: "Kategori" }),
		columnHelper.accessor("price", { header: "Harga", cell: (i) => rupiah(Number(i.getValue())) }),
		columnHelper.accessor("stock", { header: "Stok" }),
		columnHelper.display({
			id: "actions",
			header: "",
			cell: (i) => (isAdmin ? <Actions product={i.row.original as Product} /> : null),
		}),
	]);

	const table = useTable({ features, columns, data: query.data ?? [] });

	function Actions({ product }: { product: Product }) {
		return (
			<div className="flex justify-end gap-1">
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Ubah ${product.name}`}
					onClick={() => setForm({ open: true, product })}
				>
					<Pencil />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Hapus ${product.name}`}
					onClick={() => {
						setDeleteError("");
						setToDelete(product);
					}}
				>
					<Trash2 className="text-destructive" />
				</Button>
			</div>
		);
	}

	const confirmDelete = async () => {
		if (!toDelete) return;
		setDeleting(true);
		setDeleteError("");
		try {
			await deleteFn({ data: { id: toDelete.id } });
			await queryClient.invalidateQueries({ queryKey: ["products"] });
			setToDelete(null);
		} catch (err) {
			setDeleteError(err instanceof Error ? err.message : "Gagal menghapus");
		} finally {
			setDeleting(false);
		}
	};

	const data = query.data ?? [];

	return (
		<div className="mx-auto grid max-w-5xl gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="display-title text-3xl font-bold text-[var(--sea-ink)]">Produk</h1>
					<p className="text-sm text-[var(--sea-ink-soft)]">
						Produk ekonomi kreatif kawasan Danau Toba.
					</p>
				</div>
				{isAdmin && (
					<Button onClick={() => setForm({ open: true, product: null })}>
						<Plus /> Tambah Produk
					</Button>
				)}
			</div>

			{query.isPending ? (
				<div className="grid gap-2">
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
					))}
				</div>
			) : query.isError ? (
				<div role="alert" className="rounded-xl border border-destructive/40 p-6 text-sm">
					<p className="text-destructive">Gagal memuat produk: {(query.error as Error).message}</p>
					<Button className="mt-3" variant="outline" size="sm" onClick={() => query.refetch()}>
						Coba lagi
					</Button>
				</div>
			) : data.length === 0 ? (
				<div className="rounded-xl border border-dashed border-[var(--line)] p-10 text-center text-[var(--sea-ink-soft)]">
					Belum ada produk.{isAdmin && " Klik “Tambah Produk” untuk memulai."}
				</div>
			) : (
				<>
					<ul className="grid gap-3 md:hidden">
						{data.map((p) => (
							<li
								key={p.id}
								className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] p-3"
							>
								<Thumb src={p.image} />
								<div className="min-w-0 flex-1">
									<p className="m-0 truncate font-semibold">{p.name}</p>
									<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
										{p.category} · stok {p.stock}
									</p>
									<p className="m-0 text-sm font-medium">{rupiah(p.price)}</p>
								</div>
								{isAdmin && <Actions product={p} />}
							</li>
						))}
					</ul>

					<div className="hidden overflow-x-auto rounded-xl border border-[var(--line)] md:block">
						<table className="w-full border-collapse text-sm">
							<thead>
								{table.getHeaderGroups().map((hg) => (
									<tr key={hg.id} className="bg-[var(--chip-bg)]">
										{hg.headers.map((h) => (
											<th
												key={h.id}
												className="px-4 py-3 text-left text-xs font-semibold text-[var(--sea-ink-soft)]"
											>
												{h.isPlaceholder || !h.column.getCanSort() ? (
													flexRender(h.column.columnDef.header, h.getContext())
												) : (
													<button
														type="button"
														className="inline-flex items-center gap-1"
														onClick={h.column.getToggleSortingHandler()}
													>
														{flexRender(h.column.columnDef.header, h.getContext())}
														<ArrowUpDown className="size-3" />
														{{ asc: "▲", desc: "▼" }[h.column.getIsSorted() as string] ?? null}
													</button>
												)}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{table.getRowModel().rows.map((row) => (
									<tr key={row.id} className="border-t border-[var(--line)]">
										{row.getAllCells().map((cell) => (
											<td key={cell.id} className="px-4 py-3">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{form.open && (
				<ProductFormModal
					key={form.product?.id ?? "new"}
					open
					product={form.product}
					onOpenChange={(o) => !o && setForm({ open: false, product: null })}
				/>
			)}
			<ConfirmDialog
				open={!!toDelete}
				onOpenChange={(o) => !o && setToDelete(null)}
				title="Hapus produk?"
				description={`“${toDelete?.name ?? ""}” akan dihapus permanen.`}
				loading={deleting}
				error={deleteError}
				onConfirm={confirmDelete}
			/>
		</div>
	);
}
