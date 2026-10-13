# system-main

- `public/` – isi situs yang di-deploy (index.html, css/, js/, images/)
- `index.html` – kerangka halaman
- `public/css/style.css` – gaya
- `public/js/data.js` – isi slide (edit di sini, tanpa build)
- `src/` – kode sumber: `slides.js` (DOM), `snapshot.js` (DOM → tekstur), `paper.js` (three.js / WebGL2, efek kertas melengkung), `main.js` (navigasi)
- `public/js/app.js` – hasil build (sudah disertakan)

Ubah kode di `src/` → `npm install` lalu `npm run build`.
Jalankan lewat server (GitHub Pages, atau `python -m http.server`), bukan file://, karena tekstur WebGL tidak boleh dari file lokal.

Deploy Cloudflare: `wrangler.jsonc` hanya meng-upload folder `public/` (node_modules tidak ikut). Build command boleh dikosongkan karena `public/js/app.js` sudah ada.
