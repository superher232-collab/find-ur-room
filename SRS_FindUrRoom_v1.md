SRS — Find Ur Room  |  TALKS Season 2  |  FTI UAJY  |  Versi 1.0




**SOFTWARE REQUIREMENTS SPECIFICATION**

**SRS — FIND UR ROOM**

*Sistem Navigasi Indoor Berbasis PWA & Algoritma Graf*



|**Nama Sistem**|Find Ur Room|
| :- | :- |
|**Versi**|1\.0 — Draft Awal (Prototype)|
|**Tim**|Find Ur Room|
|**Program**|TALKS Season 2 — Collaborative Research Bootcamp|
|**Institusi**|FTI UAJY|
|**Tanggal**|Mei 2026|


# **1. Pendahuluan**
## **1.1 Tujuan Dokumen**
Dokumen Software Requirements Specification (SRS) ini mendefinisikan secara lengkap dan formal semua kebutuhan fungsional dan non-fungsional sistem Find Ur Room versi 1.0 (fase prototyping MVP). Dokumen ini menjadi kontrak antara tim developer, dosen mentor, dan seluruh stakeholder mengenai apa yang akan dibangun dan bagaimana sistem harus berperilaku.

SRS ini diadaptasi dari standar IEEE 830-1998 dan disesuaikan untuk konteks tim developer mahasiswa dalam kerangka TALKS Season 2 — Collaborative Research Bootcamp.

## **1.2 Ruang Lingkup Sistem**
Find Ur Room adalah Progressive Web App (PWA) navigasi indoor yang memungkinkan pengguna menemukan ruangan di dalam gedung kampus dengan cara:

- Memindai QR Code yang ditempel di persimpangan lorong untuk menentukan posisi awal
- Memilih ruangan tujuan dari daftar yang tersedia
- Melihat rute terpendek yang dirender di atas peta denah interaktif
- Memperbarui posisi secara fleksibel tanpa harus kembali ke titik QR awal

Sistem ini dirancang untuk menggantikan kebutuhan hardware IoT mahal (Bluetooth Beacon, Wi-Fi fingerprinting) dengan solusi berbasis QR Code statis berbiaya sangat rendah.

## **1.3 Definisi, Akronim, dan Singkatan**

|**Istilah**|**Definisi**|
| :- | :- |
|**PWA (Progressive Web App)**|Aplikasi web yang dapat berfungsi seperti aplikasi native, termasuk mode offline dan instalasi di home screen, tanpa perlu dipublikasikan di app store.|
|**QR Code Anchor**|Stiker QR Code yang berisi URL dengan parameter posisi, ditempel di titik fisik tertentu di gedung, berfungsi sebagai penanda lokasi absolut pengguna.|
|**Graph (Graf)**|Struktur data yang terdiri dari node (titik) dan edge (garis penghubung). Digunakan untuk merepresentasikan layout gedung.|
|**Node**|Titik dalam graph yang merepresentasikan lokasi signifikan di gedung: pintu masuk, persimpangan, pintu ruangan, tangga, atau lift.|
|**Edge**|Koneksi langsung antara dua node yang merepresentasikan jalur lorong yang dapat dilalui, dengan bobot berupa estimasi jarak.|
|**Dijkstra**|Algoritma komputasi untuk menemukan jalur terpendek antara dua node dalam graph berbobot non-negatif.|
|**Leaflet.js**|Library JavaScript open-source untuk membuat peta interaktif di browser. Digunakan dengan CRS.Simple untuk peta non-geografis (denah gedung).|
|**CRS.Simple**|Coordinate Reference System dari Leaflet untuk peta yang menggunakan koordinat pixel kartesian, bukan koordinat geografis (lat/lng).|
|**Graphology**|Library JavaScript untuk manipulasi dan analisis graph, digunakan untuk implementasi Dijkstra di sisi client/browser.|
|**SUS (System Usability Scale)**|Kuesioner standar industri berisi 10 pertanyaan untuk mengukur usability sistem, menghasilkan skor 0–100.|
|**Client-side**|Eksekusi kode yang terjadi di browser pengguna, bukan di server. Eliminasi kebutuhan server backend.|
|**MVP (Minimum Viable Product)**|Versi paling sederhana dari produk yang tetap memiliki cukup fitur untuk didemonstrasikan dan diuji oleh pengguna nyata.|


## **1.4 Referensi**
- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications
- Jamshidi et al. (2025). HERD Journal. DOI: 10.1177/19375867251317240
- Jamshidi et al. (2020). Frontiers in Psychology. DOI: 10.3389/fpsyg.2020.549628
- Graphology Documentation — graphology.github.io
- Leaflet.js Documentation — leafletjs.com
- Next.js 14 App Router Documentation — nextjs.org/docs

## **1.5 Riwayat Revisi**

|**Versi**|**Tanggal**|**Deskripsi Perubahan**|**Penulis**|
| :- | :- | :- | :- |
|1\.0|Mei 2026|Draft awal SRS untuk fase prototyping MVP|Tim Find Ur Room|



# **2. Deskripsi Umum Sistem**
## **2.1 Perspektif Produk**
Find Ur Room adalah sistem baru yang berdiri sendiri (standalone), tidak terintegrasi dengan sistem informasi kampus yang sudah ada. Sistem ini beroperasi sebagai aplikasi web statis yang di-host di Vercel CDN, dapat diakses oleh siapa saja yang memiliki URL melalui browser smartphone tanpa instalasi.

## **2.2 Fungsi Utama Produk**
Secara ringkas, sistem Find Ur Room menyediakan fungsi:

1. Penentuan posisi pengguna via QR Code scan atau pilihan manual
1. Pencarian ruangan tujuan dari database gedung
1. Kalkulasi rute terpendek menggunakan algoritma Dijkstra
1. Visualisasi rute di atas peta denah interaktif
1. Update posisi fleksibel setelah mencapai tujuan
1. Akses offline setelah load pertama (service worker)

## **2.3 Karakteristik Pengguna**

|**Segmen Pengguna**|**Karakteristik**|**Ekspektasi Penggunaan**|
| :- | :- | :- |
|**Mahasiswa baru**|Tidak familiar dengan tata letak gedung; pengguna smartphone aktif|Orientasi awal semester; menemukan kelas dan ruang dosen|
|**Mahasiswa umum**|Familiar dengan gedung utama, belum tentu familiar gedung lain|Menemukan ruang rapat, lab, atau ruang administrasi|
|**Pengunjung/tamu**|Tidak familiar sama sekali dengan kampus; butuh bantuan cepat|Menemukan kantor, ruang seminar, atau fasilitas umum|


## **2.4 Stakeholder**

|**Stakeholder**|**Peran**|**Kepentingan Utama**|
| :- | :- | :- |
|**Pengguna Akhir (Mahasiswa/Pengunjung)**|Pengguna sistem navigasi|Kemudahan menemukan ruangan tanpa download aplikasi|
|**Tim Developer**|Perancang dan pembangun sistem|Implementasi sesuai spesifikasi, deliverable tepat waktu|
|**Institusi/Pengelola Gedung**|Pemilik infrastruktur gedung|Sistem murah, mudah dikelola, mengurangi beban staf|
|**Juri Lomba (TALKS Season 2)**|Evaluator inovasi teknologi|Kebaruan solusi, implementasi teknis, dampak nyata|


## **2.5 Asumsi dan Ketergantungan**
Dokumen ini dibuat dengan asumsi berikut:

- Gambar denah gedung lantai yang dituju tersedia dan dapat didigitalisasi
- Izin dari pihak gedung/kampus untuk menempelkan stiker QR Code di titik-titik lorong telah diperoleh
- Pengguna memiliki smartphone dengan kamera dan browser modern (Chrome/Safari/Firefox terbaru)
- Koneksi internet tersedia minimal saat pertama kali mengakses sistem
- Koordinat node dalam building-graph.json sudah divalidasi dan akurat terhadap gambar denah



# **3. Kebutuhan Fungsional**
## **3.1 Ringkasan Fitur**

|**ID**|**Nama Fitur**|**Prioritas**|**Status MVP**|
| :- | :- | :- | :- |
|**FR-01**|QR Code Location Anchoring|**Wajib**|Masuk MVP|
|**FR-02**|Flexible Position Update|**Wajib**|Masuk MVP|
|**FR-03**|Destination Search|**Wajib**|Masuk MVP|
|**FR-04**|Route Generation (Dijkstra)|**Wajib**|Masuk MVP|
|**FR-05**|Indoor Map Rendering (Leaflet)|**Wajib**|Masuk MVP|
|**FR-06**|Route Visualization|**Wajib**|Masuk MVP|
|**FR-07**|PWA Offline Mode|Tinggi|Masuk MVP|
|**FR-08**|Multi-Lantai Support|Rendah|Di luar MVP|


## **3.2 Spesifikasi Kebutuhan Fungsional Detail**

### **FR-01 — QR Code Location Anchoring**

|**FR-01  —  QR Code Location Anchoring**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus mampu membaca parameter posisi dari URL yang di-generate oleh QR Code dan secara otomatis menetapkan posisi awal pengguna tanpa interaksi tambahan.|
|**Input**|URL dengan query parameter ?start=<node\_id> (contoh: https://domain.com/?start=entrance\_01)|
|**Proses**|1\. Parse URL query parameter saat halaman dimuat. 2. Cari node dengan ID yang sesuai di building-graph.json. 3. Set state startNodeId ke node yang ditemukan. 4. Tampilkan label node di UI sebagai 'Posisi Anda Sekarang'.|
|**Output**|Field posisi terisi otomatis dengan label node yang sesuai; sistem siap menerima input tujuan.|
|**Constraint**|Jika node\_id tidak ditemukan dalam graph, tampilkan pesan error yang informatif dan minta user memilih posisi manual. URL parameter hanya dibaca saat pertama load jika belum ada posisi yang di-set.|

### **FR-02 — Flexible Position Update**

|**FR-02  —  Flexible Position Update**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus menyediakan tiga mekanisme update posisi: (1) scan QR baru, (2) tombol 'Sudah Sampai' setelah rute selesai, dan (3) dropdown pilihan manual. User tidak perlu kembali ke titik QR awal untuk memulai navigasi baru.|
|**Input**|(1) URL baru dari QR scan; (2) Klik tombol 'Sudah Sampai'; (3) Pilihan dari dropdown semua node tersedia.|
|**Proses**|Mekanisme 1: Sama dengan FR-01, baca ?start= dari URL. Mekanisme 2: Set startNodeId = destinationId saat ini; clear destinationId; clear routeResult; tampilkan UI pencarian tujuan baru. Mekanisme 3: Set startNodeId = nilai yang dipilih dari dropdown; clear routeResult.|
|**Output**|Posisi pengguna diperbarui; rute lama dihapus dari peta; UI siap menerima tujuan baru.|
|**Constraint**|Dropdown manual menampilkan semua node (semua tipe), bukan hanya ruangan. Perubahan posisi via dropdown langsung efektif tanpa perlu konfirmasi tambahan.|

### **FR-03 — Destination Search**

|**FR-03  —  Destination Search**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus menyediakan antarmuka pencarian tujuan berupa dropdown yang menampilkan semua node bertipe 'room' dari building-graph.json, dengan kemampuan filter berdasarkan label.|
|**Input**|Input teks dari pengguna untuk filter; klik/tap pada item untuk memilih.|
|**Proses**|1\. Load semua node dengan type='room' saat aplikasi dimuat. 2. Tampilkan dalam dropdown dengan label sebagai teks tampilan. 3. Filter daftar secara real-time saat user mengetik. 4. Set state destinationId saat user memilih item.|
|**Output**|Node tujuan terpilih; tombol 'Cari Rute' aktif (enable).|
|**Constraint**|Tombol 'Cari Rute' hanya aktif jika startNodeId DAN destinationId sudah di-set. Tidak boleh memilih tujuan yang sama dengan posisi saat ini.|

### **FR-04 — Route Generation**

|**FR-04  —  Route Generation (Dijkstra Client-Side)**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus mampu menghitung rute terpendek antara dua node menggunakan algoritma Dijkstra yang berjalan sepenuhnya di browser pengguna tanpa request ke server.|
|**Input**|startNodeId (string), destinationId (string), graph yang sudah di-build dari building-graph.json.|
|**Proses**|1\. Panggil dijkstra.bidirectional(graph, startNodeId, destinationId, 'weight') dari library graphology-shortest-path. 2. Map array node ID hasil Dijkstra ke array objek RouteNode lengkap (id, label, x, y, floor, type). 3. Kelompokkan nodes per lantai untuk mendukung multi-lantai di masa depan.|
|**Output**|RouteResult object berisi: path (array RouteNode), floorSegments (grouped per lantai), totalWeight (total bobot).|
|**Constraint**|Jika tidak ada path yang ditemukan (graph tidak terhubung), kembalikan null dan tampilkan pesan error. Graph di-build sekali saat startup dan di-reuse untuk semua request routing.|

### **FR-05 — Indoor Map Rendering**

|**FR-05  —  Indoor Map Rendering (Leaflet.js + CRS.Simple)**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus merender gambar denah gedung sebagai peta interaktif yang dapat di-zoom dan di-pan, menggunakan sistem koordinat pixel (bukan koordinat geografis).|
|**Input**|URL gambar denah, dimensi gambar (width × height dalam pixel).|
|**Proses**|1\. Inisialisasi Leaflet map dengan L.CRS.Simple dan zoom controls. 2. Set bounds peta = [[0,0], [imageHeight, imageWidth]]. 3. Render gambar denah dengan L.imageOverlay(imageUrl, bounds). 4. Fit peta ke bounds gambar. 5. Konversi koordinat: y\_leaflet = imageHeight - y\_node (flip Y axis).|
|**Output**|Gambar denah ter-render penuh di area map; zoom (scroll wheel/pinch) dan pan (drag) berfungsi.|
|**Constraint**|Gunakan dynamic import untuk Leaflet (tidak support SSR Next.js). Pastikan CSS Leaflet ter-import. imageHeight dan imageWidth harus sesuai persis dengan dimensi pixel gambar asli.|

### **FR-06 — Route Visualization**

|**FR-06  —  Route Visualization**  [Prioritas: Wajib]||
| :- | :- |
|**Deskripsi**|Sistem harus merender rute sebagai garis (polyline) di atas peta denah, dengan marker berbeda untuk titik awal dan titik akhir, tepat di atas jalur lorong sesuai koordinat node.|
|**Input**|Array RouteNode untuk lantai yang sedang ditampilkan (currentFloorNodes).|
|**Proses**|1\. Hapus semua layer rute sebelumnya dari peta. 2. Konversi koordinat: latLng = [imageHeight - node.y, node.x]. 3. Render L.polyline dengan warna biru, weight 4, dash pattern. 4. Render marker start (hijau) di node pertama. 5. Render marker end (merah) di node terakhir.|
|**Output**|Garis rute biru ter-render di atas denah; marker hijau di titik awal; marker merah di titik tujuan.|
|**Constraint**|Layer rute lama dihapus sebelum render rute baru. Marker menggunakan L.divIcon (HTML/CSS) bukan gambar external untuk menghindari dependensi asset tambahan.|

### **FR-07 — PWA Offline Mode**

|**FR-07  —  PWA Offline Mode**  [Prioritas: Tinggi]||
| :- | :- |
|**Deskripsi**|Sistem harus berfungsi penuh tanpa koneksi internet setelah pertama kali di-load, menggunakan service worker untuk cache seluruh aset aplikasi.|
|**Input**|Tidak ada (berjalan otomatis setelah service worker terdaftar).|
|**Proses**|1\. Register service worker saat aplikasi pertama dimuat. 2. Service worker mencache: HTML, CSS, JS bundle, gambar denah, building-graph.json. 3. Intercept semua request dan serve dari cache jika offline.|
|**Output**|Aplikasi berfungsi penuh tanpa koneksi internet; tidak ada error 404 atau network timeout.|
|**Constraint**|Gambar denah harus dikompres < 500KB sebelum deploy untuk memastikan cache tidak overload. Gunakan next-pwa library untuk konfigurasi service worker otomatis.|



# **4. Kebutuhan Non-Fungsional**

|**ID**|**Kategori**|**Kebutuhan**|**Metrik/Target**|
| :- | :- | :- | :- |
|**NFR-01**|Performa|Waktu kalkulasi rute|< 100ms untuk graph < 300 node|
|**NFR-02**|Performa|Waktu load halaman pertama|< 3 detik pada koneksi 4G|
|**NFR-03**|Performa|Ukuran gambar denah|< 500KB per lantai (setelah kompresi)|
|**NFR-04**|Ketersediaan|Uptime sistem|> 99% (Vercel CDN SLA)|
|**NFR-05**|Ketersediaan|Concurrent users|Tidak terbatas (client-side rendering)|
|**NFR-06**|Kegunaan|Skor SUS|Minimal 68 (acceptable)|
|**NFR-07**|Kegunaan|Kompatibilitas browser|Chrome, Safari, Firefox versi terbaru|
|**NFR-08**|Kegunaan|Kompatibilitas device|Smartphone Android & iOS, tablet|
|**NFR-09**|Keamanan|Proteksi data|Tidak ada data pribadi yang dikumpulkan|
|**NFR-10**|Portabilitas|Instalasi server|Tidak diperlukan (fully static)|



# **5. Kriteria Penerimaan (Acceptance Criteria)**
Tabel berikut mendefinisikan kondisi yang harus dipenuhi agar setiap kebutuhan fungsional dianggap selesai dan diterima oleh stakeholder:

|**FR**|**Acceptance Criteria**|**Test Case**|
| :- | :- | :- |
|**FR-01**|Saat URL dibuka dengan ?start=node\_id, field posisi awal terisi dengan label node yang sesuai tanpa interaksi tambahan|Buka URL /?start=entrance\_01 → verifikasi label 'Pintu Masuk Utama' muncul di field posisi|
|**FR-02**|Setelah klik 'Sudah Sampai', posisi saat ini berubah ke node tujuan sebelumnya; rute lama terhapus; dropdown tujuan aktif kembali|Test flow: rute A→B selesai → klik tombol → verifikasi posisi = B → pilih C → rute B→C muncul|
|**FR-03**|Dropdown pencarian menampilkan semua node bertipe 'room' dari building-graph.json; search filter berjalan by label|Ketik 'Lab' → hanya node dengan 'Lab' di label yang muncul|
|**FR-04**|Rute yang dihasilkan adalah rute terpendek berdasarkan bobot edge; path alternatif yang lebih panjang tidak dipilih|Bandingkan output Dijkstra dengan kalkulasi manual untuk graph sederhana 5 node|
|**FR-05**|Gambar denah ter-render penuh di area map; zoom dan pan berfungsi; tidak ada distorsi atau offset|Test zoom in/out dan drag; verifikasi gambar tidak terpotong|
|**FR-06**|Garis rute (polyline) muncul di atas denah tepat di atas jalur lorong sesuai koordinat node; marker start (hijau) dan end (merah) visible|Verifikasi visual: garis melewati titik node yang benar di atas gambar denah|
|**FR-07**|Setelah load pertama, matikan koneksi internet; reload halaman → semua fitur tetap berfungsi normal|Airplane mode → refresh → test full navigation flow|



# **6. Spesifikasi Data**
## **6.1 Skema Data Graph Gedung**
Seluruh data gedung disimpan dalam satu file JSON statis. Format berikut adalah kontrak data yang harus dipatuhi oleh tim data/backend:

// building-graph.json — Kontrak Data v1.0 {   "metadata": {     "building": string,      // Nama gedung     "floor": number,         // Nomor lantai (untuk MVP: 1)     "imageWidth": number,    // Lebar gambar denah dalam pixel     "imageHeight": number,   // Tinggi gambar denah dalam pixel     "imageUrl": string       // Path relatif ke gambar denah   },   "nodes": [     {       "id": string,          // UNIQUE. Format: {type}\_{nn} (cth: "room\_01")       "label": string,       // Nama tampilan (cth: "Ruang 101")       "x": number,           // Koordinat X dalam pixel (dari kiri gambar)       "y": number,           // Koordinat Y dalam pixel (dari atas gambar)       "floor": number,       // Lantai (integer, mulai dari 1)       "type": enum           // "entrance"|"junction"|"room"|"stair"|"lift"     }   ],   "edges": [     {       "from": string,        // Node ID asal       "to": string,          // Node ID tujuan       "weight": number       // Jarak Euclidean antar node (pixel, integer)     }   ] }

## **6.2 Aturan Validasi Data**
Building-graph.json dianggap valid jika memenuhi semua aturan berikut:

- Setiap node.id bersifat unik di seluruh file
- Setiap edge.from dan edge.to merujuk ke node.id yang ada
- Tidak ada edge duplikat (pasangan from-to yang sama lebih dari satu kali)
- Semua node dapat dicapai dari node bertipe 'entrance' (graph terhubung penuh)
- Tidak ada node tanpa edge (semua node terhubung minimal ke 1 node lain)
- Nilai weight selalu positif (> 0)
- Nilai x dalam range [0, metadata.imageWidth]; y dalam range [0, metadata.imageHeight]



# **7. Constraint dan Asumsi Teknis**
## **7.1 Constraint Teknis**

|**Constraint**|**Detail**|
| :- | :- |
|**Tidak ada Server Backend**|Seluruh logika aplikasi berjalan client-side. Tidak ada FastAPI, Node.js server, atau database server yang di-deploy.|
|**Tidak ada GPS/Real-time Tracking**|Sistem tidak menggunakan GPS, Bluetooth, atau WiFi untuk tracking posisi. Posisi user hanya diperbarui via QR scan atau input manual.|
|**Data Statis**|building-graph.json adalah file statis yang harus diperbarui secara manual jika ada perubahan tata letak gedung.|
|**Dependensi CDN Minimal**|Leaflet CSS di-load dari CDN; semua library JS di-bundle oleh Next.js. Tidak ada dependensi runtime eksternal lain.|
|**No Authentication**|Sistem MVP tidak memiliki login atau autentikasi. Semua pengguna memiliki akses yang sama.|


## **7.2 Lingkungan Deployment**

|**Parameter**|**Spesifikasi**|
| :- | :- |
|**Platform Hosting**|Vercel Free Tier — Static + Serverless Functions|
|**CDN**|Vercel Edge Network (global CDN otomatis)|
|**Domain**|\*.vercel.app (free) atau custom domain|
|**Build Command**|next build|
|**Node.js Version**|18\.x atau lebih baru|
|**Package Manager**|npm atau yarn|
|**CI/CD**|Auto-deploy dari branch main di GitHub (Vercel integration)|



# **8. Referensi**
- IEEE Std 830-1998. IEEE Recommended Practice for Software Requirements Specifications. IEEE Computer Society.
- Jamshidi, S., Hashemi, S., & Tran, D.-M. T. (2025). Costs and effects of ineffective wayfinding in US hospitals: A survey of hospital staff. HERD: Health Environments Research & Design Journal, 18(2), 259–275. DOI: 10.1177/19375867251317240
- Jamshidi, S., Ensafi, M., & Pati, D. (2020). Wayfinding in interior environments: An integrative review. Frontiers in Psychology, 11, 549628. DOI: 10.3389/fpsyg.2020.549628
- Next.js Team. (2024). Next.js 14 Documentation — App Router. nextjs.org/docs
- Graphology Contributors. (2024). Graphology — A robust & multipurpose Graph object for JavaScript. graphology.github.io
- Leaflet Contributors. (2024). Leaflet.js — Interactive Maps for Modern Websites. leafletjs.com
- Nielsen, J. (2012). Usability 101: Introduction to Usability. Nielsen Norman Group. nngroup.com
- W3C. (2023). Progressive Web Apps. developer.mozilla.org/en-US/docs/Web/Progressive\_web\_apps
Halaman Find Ur Room  |  FTI UAJY  |  TALKS Season 2
