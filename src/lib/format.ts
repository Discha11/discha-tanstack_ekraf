export const rupiah = (n: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(n);

export const MAX_IMAGE_PX = 512;

/** Perkecil gambar (maks 512px) lalu encode ke JPEG data URL. */
export async function fileToResizedJpeg(file: File): Promise<string> {
	if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
	if (file.size > 8 * 1024 * 1024) throw new Error("Ukuran file maksimal 8 MB");
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_IMAGE_PX / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Browser tidak mendukung canvas");
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL("image/jpeg", 0.85);
}

/** Cek dimensi gambar dari URL https; tolak jika > 512px. */
export function checkImageUrl(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!/^https:\/\//i.test(url)) return reject(new Error("URL harus diawali https://"));
		const img = new Image();
		img.onload = () =>
			Math.max(img.naturalWidth, img.naturalHeight) > MAX_IMAGE_PX
				? reject(
						new Error(
							`Gambar maksimal ${MAX_IMAGE_PX}px (ini ${img.naturalWidth}×${img.naturalHeight})`,
						),
					)
				: resolve();
		img.onerror = () => reject(new Error("Gambar tidak dapat dimuat dari URL tersebut"));
		img.src = url;
	});
}
