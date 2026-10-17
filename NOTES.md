# Catatan Implementasi & Keamanan (NOTES.md)

## What I broke and how I fixed it

Saat merestrukturisasi layout admin ke pathless layout `_admin` dan membersihkan rute demo bawaan scaffold, sinkronisasi state file `src/lib/session.ts` sempat terpotong sehingga fungsi autentikasi server (`getCurrentSession`, `requireAuth`, `requireAdmin`) terputus dan menghasilkan sintaks `return` di luar fungsi. Selain itu, input pada modal form produk sebelumnya tidak merespons ketikan pengguna akibat siklus render dan binding yang salah pada TanStack Form; masalah ini diperbaiki dengan mengaitkan `<form.Field>` langsung ke `field.state.value` dan handler `field.handleChange`, memisahkan komponen field wrapper ke luar modal, serta memindahkan modal dialog ke dalam layout responsif. Biome linter dan Vite build juga diperbaiki dengan merapikan urutan `@import` di `styles.css` dan meregenerasi route tree (`bunx tsr generate`).

---

## Security Enhancements & Attacks Prevented

### 1. Otorisasi Sisi Server Berlapis (`requireAuth` & `requireAdmin`)
- **Implementasi**: Setiap server function yang memutasi data (`createProduct`, `updateProduct`, `deleteProduct`, `updateUserRole`, `deleteUser`) serta endpoint data pengguna (`getUsers`) memverifikasi sesi melalui Better Auth menggunakan header request asli TanStack Start.
- **Serangan yang dicegah**: **Broken Object Level Authorization (BOLA) & Privilege Escalation**. Pengguna biasa atau penyerang yang memanggil server function via HTTP request tidak dapat membaca data sensitif atau memodifikasi katalog dan hak akses tanpa privilege admin terverifikasi di server.

### 2. Pencegahan Self-Demotion, Self-Deletion, dan Last Admin Lockout
- **Implementasi**: Server function `updateUserRole` dan `deleteUser` menolak jika seorang admin mencoba menurunkan rolenya sendiri, menghapus akunnya sendiri, atau jika aksi tersebut akan menghapus/menurunkan admin terakhir yang tersisa di sistem.
- **Serangan yang dicegah**: **Denial of Service (DoS) Administratif & Accidental Account Lockout**. Mencegah sistem kehilangan seluruh akun pengelola sehingga aplikasi tidak terjebak dalam kondisi terkunci permanen tanpa administrator.

### 3. Rate Limiting pada Autentikasi
- **Implementasi**: Konfigurasi Better Auth menerapkan rate limit maksimal 5 percobaan per menit untuk endpoint `/sign-in/email` dan 3 percobaan per menit untuk `/sign-up/email`.
- **Serangan yang dicegah**: **Credential Stuffing & Brute Force Attacks**. Penyerang dicegah melakukan uji coba ribuan kombinasi kata sandi atau membuat massal akun spam.

### 4. Validasi Skema Ketat Sisi Server dengan Zod & Sanitasi Karakter
- **Implementasi**: Seluruh input data produk dan pengguna divalidasi dengan Zod schema, termasuk batas panjang, tipe angka non-negatif, enum kategori resmi kawasan Danau Toba, pencegahan injeksi karakter tag HTML (`<`, `>`), dan validasi dimensi gambar maksimal 512px (baik JPEG base64 maupun URL HTTPS).
- **Serangan yang dicegah**: **Stored Cross-Site Scripting (XSS), Parameter Tampering, & Server-Side Resource Exhaustion**. Memastikan payload berbahaya tidak masuk ke in-memory database dan tidak dieksekusi di browser pengguna lain.

### 5. Keamanan Session Cookie
- **Implementasi**: Atribut cookie default dikonfigurasi dengan `httpOnly: true`, `sameSite: "lax"`, dan `secure: true` pada environment produksi, dengan masa kedaluwarsa sesi (8 jam).
- **Serangan yang dicegah**: **Session Hijacking & Cross-Site Scripting (XSS) Cookie Theft**. Mencegah script jahat di sisi klien membaca cookie sesi autentikasi.
