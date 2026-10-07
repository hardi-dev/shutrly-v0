# Client access — manual test checklist (round 2)

Date: 2026-10-07 · Tester: Owner · Branch `feat/client-access` · Environment: `localhost:3000`, dev database, seed from `.env.seed.dev` (owner `owner@shutrly.test`; passwords and the client link are in the file)

Checks the fixes for [manual-test-findings.md](manual-test-findings.md) #1–#7, F-19 (client proof downloads) and F-20 (delivery folder mapping). Mark each row as it is tested: ⬜ not tested · ✅ pass · ❌ fail (write what happened in *Catatan*; a fail becomes a new finding in `manual-test-findings.md`).

## 1. Pemetaan subfolder (#5, F-20)

Gallery page › *Sumber foto*.

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 1.1 | Buka menu `…` di baris folder | Isinya *Sinkronkan · Edit folder · Hapus* | ✅ | |
| 1.2 | *Edit folder* › ubah nama › *Simpan* | Nama baru muncul di daftar | ✅ | |
| 1.3 | Buka *Edit folder* | Skeleton tampil selama subfolder dimuat, lalu diganti daftar item | ✅ | |
| 1.4 | *Edit folder* di folder yang punya subfolder | Satu baris per item paket; tiap item memilih satu subfolder atau *Belum dipilih* | ✅ | |
| 1.5 | Subfolder **kosong** di Drive › *Sinkronkan* › *Edit folder* | Subfolder kosong tetap muncul di pilihan | ✅ | |
| 1.6 | Pilih subfolder untuk satu item, lalu buka pilihan item lain | Subfolder yang sudah dipilih tidak ditawarkan lagi | ✅ | |
| 1.7 | Upload hasil edit ke subfolder yang **belum** dipetakan › *Sinkronkan* › lalu petakan subfolder itu ke item › *Simpan* (tanpa sinkron ulang) | Hasil edit langsung pindah ke tab item itu di `/final` dan tidak lagi di `/photos`; foto asli di folder root tetap di `/photos` | ⬜ | |
| 1.8 | Buat subfolder baru di Drive › *Sinkronkan* | Toast menyebut subfolder baru, dengan tombol *Petakan* yang membuka *Edit folder* | ✅ | |
| 1.9 | Upload foto ke subfolder yang sudah dipetakan › *Sinkronkan* | Foto masuk ke item tersebut | ✅ | |
| 1.10 | *Edit folder* di proyek yang paketnya tanpa item pilihan foto | Pesan singkat dengan tombol *Buka Isi paket* | ✅ | |
| 1.11 | *Edit folder* di folder tanpa subfolder | Pesan *Belum ada subfolder…* | ✅ | |

## 2. Hasil akhir per item (#5, F-20) — client

Client link (`SEED_CLIENT_PATH`, password `SEED_GALLERY_PASSWORD`) › `/final`.

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 2.1 | Buka `/final` | Tab per item paket (nama item), bukan *Edited / Print* | ⬜ | |
| 2.2 | Buka tiap tab | Fotonya sesuai pemetaan di bagian 1 | ⬜ | |

## 3. Download & pilih sekaligus (#6, F-19) — client `/photos`

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 3.1 | Tombol unduh di satu foto | File asli terunduh | ⬜ | |
| 3.2 | Buka viewer › *Unduh foto* | File asli terunduh | ⬜ | |
| 3.3 | *Unduh semua* | Konfirmasi, lalu foto terunduh satu per satu dengan kartu progres | ⬜ | |
| 3.4 | *Pilih beberapa* › pilih foto › *Unduh n foto* | Hanya foto terpilih yang terunduh | ⬜ | |
| 3.5 | *Pilih beberapa* › *Pilih untuk…* › pilih bagian | Foto masuk ke pilihan bagian itu (×1 di *Foto cetak*) | ⬜ | |
| 3.6 | Pilih lebih banyak dari sisa kuota › *Pilih untuk…* | Semua ditolak, tidak ada yang masuk; pesan sisa kuota | ⬜ | |
| 3.7 | Buka `/picks/<groupId>` | Halaman pilih per bagian tetap seperti sebelumnya | ⬜ | |

## 4. Hapus folder (#4)

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 4.1 | *Hapus* folder yang fotonya belum dipilih klien | Folder dan fotonya hilang | ⬜ | |
| 4.2 | *Hapus* folder yang fotonya sudah dipilih klien | Ditolak: *Ada foto dari folder ini yang sudah dipilih klien.* | ⬜ | |
| 4.3 | *Hapus* folder terakhir di galeri yang sudah dipublikasikan | Ditolak | ⬜ | |

## 5. Folder di *Buat galeri* (#3)

Project without a gallery › *Buat galeri*.

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 5.1 | Isi link folder Drive › Buat | Halaman galeri terbuka dan langsung sinkron | ⬜ | |
| 5.2 | Buat tanpa link folder | Galeri tetap terbuat | ⬜ | |
| 5.3 | Link folder yang dipakai proyek lain | Konfirmasi *Tetap buat galeri* | ⬜ | |

## 6. Tambah anggota tim dari sesi (#1, #2)

Workspace without active team members.

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 6.1 | *Proyek baru* › *Tambah sesi* › *Tambah anggota* | Dialog anggota muncul di atas; setelah simpan, anggota baru terpilih; form sesi tidak ikut tersubmit | ⬜ | |
| 6.2 | Detail proyek › *Tambah anggota · <sesi>* | Sama seperti 6.1, tanpa diarahkan ke halaman Tim | ⬜ | |

## 7. Route bahasa Inggris (#7)

| # | Langkah | Hasil yang diharapkan | Status | Catatan |
|---|---|---|---|---|
| 7.1 | Client: `/photos`, `/final`, `/picks/<id>`, `/picks/<id>/review` | Semua terbuka | ⬜ | |
| 7.2 | Owner: `/gallery/picks` | Terbuka | ⬜ | |
| 7.3 | Klik semua link di halaman-halaman itu | Tidak ada 404 | ⬜ | |
