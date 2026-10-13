# system-main

- `index.html` – kerangka halaman
- `css/style.css` – gaya
- `js/data.js` – isi slide (edit di sini, tanpa build)
- `src/` – kode sumber: `slides.js` (DOM), `snapshot.js` (DOM → tekstur), `paper.js` (three.js / WebGL2, efek kertas melengkung), `main.js` (navigasi)
- `js/app.js` – hasil build (sudah disertakan)

Ubah kode di `src/` → `npm install` lalu `npm run build`.
Jalankan lewat server (GitHub Pages, atau `python -m http.server`), bukan file://, karena tekstur WebGL tidak boleh dari file lokal.
