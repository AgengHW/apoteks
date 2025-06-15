<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apotek 24 Jam Jogja</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <header>Apotek 24 Jam Jogja di Dalam Ringroad</header>

  <div id="sidebarToggle">☰</div>
  <aside id="sidebar">
    <h2>📍 Info WebGIS</h2>
    <button id="listBtn">🧾 Lihat Daftar Apotek</button>
    <button id="manualBtn">📍 Pilih Lokasi Manual</button>
    <button id="showRouteBtn" style="position: fixed; bottom: 70px; right: 20px; z-index: 9999; display: none;">
  Tampilkan Rute Lagi
</button>


    <hr style="margin: 16px 0;" />
    <label for="searchInput">🔎 Cari Apotek</label>
    <input type="text" id="searchInput" placeholder="Nama apotek..." style="width: 100%; padding: 6px; margin-bottom: 8px;" />
    <button id="searchBtn" style="width: 100%;">Cari & Zoom</button>

    <div style="margin-top: 16px;">
      <h3>👨‍💻 Kelompok 10 Pemrograman Spasial</h3>
      <p><strong>Dosen Pengampu:</strong><br>
      Dr. Nur Mohammad Farda, S.Si., M.Cs.</p>

      <p><strong>Anggota Kelompok:</strong></p>
      <ul style="padding-left: 18px; list-style-type: disc;">
        <li>Ageng Haryo Widagdo</li>
        <li>Darvpa Nusantara Yogya</li>
        <li>Fifi Nurul Aini</li>
        <li>Farah Setyani Danial</li>
        <li>Hasna Fauziyah</li>
        <li>Gabriella Divanka</li>
      </ul>
    </div>
  </aside>

  <main>
    <div id="map" role="region" aria-label="Map showing your location and nearby apotek"></div>
    <div id="layerToggle"> <button id="toggleLayerBtn">🛰 Imagery</button> </div>
    <div id="infoBox" aria-live="polite" aria-atomic="true" aria-relevant="additions removals"></div>
    <!-- Popup daftar apotek -->
<div id="popupList" class="popup hidden">
  <div class="popup-close" id="popupClose">✖</div>
  <h3>📋 Daftar Apotek</h3>
  <ul id="apotekList" class="popup-list"></ul>
</div>

  </main>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
  <script src="js/main.js"></script>


  <div id="zoom-controls">
  <button id="zoomIn">+</button>
  <button id="zoomOut">−</button>
  <script>
    document.getElementById('zoomIn').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoomOut').addEventListener('click', () => map.zoomOut());
  </script>
  </div>
  
</body>
</html>
