# POgrid — Error, Empty, and Loading States

> Factory users must never see a broken or ambiguous screen. Every major route and component needs explicit loading, empty, error, and permission states.

## Copy Rule

Production UI copy should be Bahasa Indonesia.

## Global Loading States

### App Initializing

Copy:

```txt
Memuat POgrid...
```

Use:

- App start
- Session check

### Page Loading

Copy:

```txt
Memuat data...
```

Use:

- Route-level data fetch

### Skeletons

Use skeletons for:

- Task cards
- PO list
- Board cards
- Finance rows
- Dashboard KPI cards
- Notification drawer

## Auth States

### Wrong PIN

Copy:

```txt
PIN salah. Coba lagi.
```

Behavior:

- Shake PIN pad.
- Brief cooldown.

### Cooldown

Copy:

```txt
Tunggu sebentar sebelum mencoba lagi.
```

### No Active Users for Role

Copy:

```txt
Belum ada user aktif untuk role ini.
```

### Session Missing

Copy:

```txt
Sesi tidak ditemukan. Silakan login ulang.
```

Action:

- Redirect to `/login`.

## Permission States

### Unauthorized Route

Copy:

```txt
Anda tidak punya akses ke halaman ini.
```

Action:

- Button: `Kembali ke halaman utama`

### Forbidden Action

Copy:

```txt
Aksi ini tidak tersedia untuk role Anda.
```

Rule:

- Prefer hiding unauthorized actions.
- Still enforce on server.

## Task States

### Loading Task List

Copy:

```txt
Memuat tugas...
```

### No Active Tasks

Copy:

```txt
Tidak ada tugas aktif saat ini.
```

### No Archive Items

Copy:

```txt
Belum ada tugas selesai untuk periode ini.
```

### Search No Results

Copy:

```txt
Tidak ada item yang cocok.
```

### Read-Only Item

Copy:

```txt
Item ini bisa dilihat, tetapi tidak bisa diubah oleh role Anda.
```

## Item Detail States

### Loading Item Detail

Copy:

```txt
Memuat detail item...
```

### Item Not Found

Copy:

```txt
Item tidak ditemukan atau sudah tidak tersedia.
```

### Item Changed Elsewhere

Copy:

```txt
Data item diperbarui oleh user lain.
```

Action:

- Refetch item.

### Progress Save Pending

Copy:

```txt
Progress tersimpan ✓ — Batalkan?
```

Behavior:

- Sonner toast with Undo countdown.

### Progress Save Failed

Copy:

```txt
Progress gagal disimpan. Coba lagi.
```

### Progress Stale Value

Copy:

```txt
Progress sudah diperbarui di perangkat lain. Data terbaru dimuat ulang.
```

Action:

- Refetch item.

## PO States

### Loading PO List

Copy:

```txt
Memuat daftar PO...
```

### No POs

Copy:

```txt
Belum ada Production Order.
```

### No Filtered POs

Copy:

```txt
Tidak ada PO pada filter ini.
```

### PO Not Found

Copy:

```txt
PO tidak ditemukan.
```

### PO Create Success

Copy:

```txt
PO berhasil dibuat.
```

### PO Create Failed

Copy:

```txt
PO gagal dibuat. Periksa data lalu coba lagi.
```

### Required Field Error

Copy:

```txt
Field ini wajib diisi.
```

### Delete Blocked

Copy:

```txt
PO tidak bisa dihapus karena sudah memiliki item DONE atau invoice PAID.
```

### Delete Confirmation

Copy:

```txt
Hapus PO ini? Semua item terkait akan ikut terhapus.
```

### Delete Wrong PIN

Copy:

```txt
PIN salah. PO tidak dihapus.
```

## Board States

### Loading Board

Copy:

```txt
Memuat board produksi...
```

### No Board Items

Copy:

```txt
Belum ada item produksi.
```

### Realtime Disconnected

Copy:

```txt
Koneksi realtime terputus. Data akan dimuat ulang saat tersambung.
```

### Realtime Reconnected

Copy:

```txt
Koneksi tersambung kembali. Data diperbarui.
```

## Problem States

### Loading Problems

Copy:

```txt
Memuat masalah...
```

### No Open Problems

Copy:

```txt
Tidak ada masalah terbuka.
```

### Problem Reported

Copy:

```txt
Masalah berhasil dilaporkan.
```

### Problem Report Failed

Copy:

```txt
Masalah gagal dilaporkan.
```

### Problem Resolved

Copy:

```txt
Masalah diselesaikan.
```

### Other Requires Note

Copy:

```txt
Catatan wajib diisi untuk kategori Lainnya.
```

## QC States

### Invalid Quantity Split

Copy:

```txt
Total qty Pass, Minor, dan Major harus sama dengan qty item.
```

### Reason Required

Copy:

```txt
Alasan rework wajib dipilih.
```

### QC Submitted

Copy:

```txt
Keputusan QC berhasil disimpan.
```

### QC Failed to Submit

Copy:

```txt
Keputusan QC gagal disimpan.
```

## Delivery States

### Delivery Confirmed

Copy:

```txt
Pengiriman dikonfirmasi. Item masuk DONE.
```

### Delivery Failed

Copy:

```txt
Konfirmasi pengiriman gagal.
```

### Return Spawned

Copy:

```txt
Return dibuat. Item masuk ulang ke produksi.
```

### Return Failed

Copy:

```txt
Return gagal dibuat.
```

## Finance States

### Loading Finance

Copy:

```txt
Memuat data finance...
```

### No Pending Items

Copy:

```txt
Tidak ada item pending invoice.
```

### No Invoiced Items

Copy:

```txt
Tidak ada item invoiced.
```

### No Paid Items

Copy:

```txt
Tidak ada item paid.
```

### Invoice Updated

Copy:

```txt
Status invoice diperbarui.
```

### Invoice Update Failed

Copy:

```txt
Status invoice gagal diperbarui.
```

### No Money Reminder

Do not show:

```txt
Amount
Total
Price
Payment value
```

## Notification States

### Loading Notifications

Copy:

```txt
Memuat notifikasi...
```

### No Notifications

Copy:

```txt
Belum ada notifikasi.
```

### Notification Read Failed

Copy:

```txt
Notifikasi gagal diperbarui.
```

## Dashboard States

### Loading Dashboard

Copy:

```txt
Memuat dashboard...
```

### No Dashboard Data

Copy:

```txt
Belum ada data untuk periode ini.
```

### Chart Error

Copy:

```txt
Grafik gagal dimuat.
```

## Settings States

### Loading Users

Copy:

```txt
Memuat user...
```

### No Users

Copy:

```txt
Belum ada user.
```

### User Created

Copy:

```txt
User berhasil dibuat.
```

### PIN Reset

Copy:

```txt
PIN baru berhasil dibuat.
```

### User Toggle Success

Copy:

```txt
Status user diperbarui.
```

### Loading Clients

Copy:

```txt
Memuat client...
```

### No Clients

Copy:

```txt
Belum ada client.
```

### Client Created

Copy:

```txt
Client berhasil dibuat.
```

## Network and Server Errors

### Generic Server Error

Copy:

```txt
Terjadi kesalahan server. Coba lagi.
```

### Network Error

Copy:

```txt
Koneksi bermasalah. Periksa internet lalu coba lagi.
```

### Mutation Conflict

Copy:

```txt
Data sudah berubah. Data terbaru dimuat ulang.
```

### Validation Error

Copy:

```txt
Periksa data yang ditandai.
```

## Forbidden Error Handling

Do not show raw database errors.
Do not show stack traces.
Do not expose table names.
Do not reveal PIN hash/session internals.
Do not use English fallback copy on production screens unless no Indonesian copy exists yet.
