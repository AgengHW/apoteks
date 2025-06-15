// Ikon pengguna dan fasilitas
const userIcon = L.icon({
  iconUrl: 'assets/user-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const facilityIcon = L.icon({
  iconUrl: 'assets/facility-icon.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

// Inisialisasi peta
// Base layers
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
});

const imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: '&copy; Esri &mdash; Source: Esri, Earthstar Geographics'
});

// Inisialisasi peta dan layer default
const map = L.map('map', {
  center: [-7.7956, 110.3695],
  zoom: 13,
  layers: [osm] // Ini layer awal
});

let currentLayer = osm; // Simpan layer aktif


let userMarker = null;
let manualMarker = null;
let routingControl = null;
let apotekData = null;
const infoBox = document.getElementById('infoBox');

// Fungsi Haversine
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ambil data roads dan apotek
Promise.all([
  fetch('data/roads.geojson', { cache: 'no-store' }).then(res => res.json()),
  fetch('data/apotek.geojson', { cache: 'no-store' }).then(res => res.json())
]).then(([roads, apoteks]) => {
  apotekData = apoteks;

  // Tampilkan jalan
  L.geoJSON(roads, {
    style: {
      color: '#e75480',
      weight: 4,
      opacity: 0.6,
      dashArray: '6 9'
    }
  }).addTo(map);

  // TAMPILKAN APOTEK
 L.geoJSON(apoteks, {
  pointToLayer: (feature, latlng) =>
    L.marker(latlng, {
      icon: facilityIcon,
      title: feature.properties.name || feature.properties.NAMA_RS || 'Unnamed Facility'
    }),
  onEachFeature: (feature, layer) => {
    const nama = feature.properties.name || feature.properties.NAMA_RS || 'Unnamed Facility';
    const [lon, lat] = feature.geometry.coordinates;
    const gmapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
    layer.bindPopup(`
      <strong>${nama}</strong><br>
      <a href="${gmapsLink}" target="_blank">🧭 Buka di Google Maps</a>
    `);
  }
}).addTo(map);

  // Fungsi cari apotek terdekat
  function findNearest(lat, lng) {
    let minDist = Infinity;
    let nearest = null;
    apoteks.features.forEach(f => {
      const [lon, lat_] = f.geometry.coordinates;
      const dist = haversineDistance(lat, lng, lat_, lon);
      const name = f.properties.name || f.properties.NAMA_RS || 'Unnamed Facility';
      if (dist < minDist) {
        minDist = dist;
        nearest = { lat: lat_, lng: lon, name, dist };
      }
    });
    return nearest;
  }

const toggleBtn = document.getElementById('toggleLayerBtn');

toggleBtn?.addEventListener('click', () => {
  map.removeLayer(currentLayer);
  currentLayer = currentLayer === osm ? imagery : osm;
  map.addLayer(currentLayer);
});


  // Lokasi pengguna otomatis
  function updateUserLocation(pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (!userMarker) {
      userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      map.setView([lat, lng], 15);
    } else {
      userMarker.setLatLng([lat, lng]);
    }

    const nearest = findNearest(lat, lng);
    if (!nearest) return infoBox.textContent = 'Tidak ada fasilitas ditemukan.';

    infoBox.textContent = `Apotek Terdekat: ${nearest.name}, approx ${(nearest.dist / 1000).toFixed(2)} km away.`;

    if (routingControl) {
      routingControl.setWaypoints([L.latLng(lat, lng), L.latLng(nearest.lat, nearest.lng)]);
    } else {
      routingControl = L.Routing.control({
        waypoints: [L.latLng(lat, lng), L.latLng(nearest.lat, nearest.lng)],
        lineOptions: { styles: [{ color: '#e75480', opacity: 0.85, weight: 6 }] },
        createMarker: () => null,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false
      }).addTo(map);
    }

    setTimeout(() => {
  const container = document.querySelector('.leaflet-routing-container');
  if (container && !document.getElementById('route-title')) {
    const title = document.createElement('div');
    title.id = 'route-title';
    title.innerText = '🧭 Rute Perjalanan';
    title.style.fontWeight = 'bold';
    title.style.padding = '8px 16px 4px';
    title.style.color = '#183B4E';
    title.style.fontSize = '16px';
    container.prepend(title);
  }
}, 500);
  }

// Aktifkan lokasi otomatis sekali saat awal
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(updateUserLocation, () => {
    infoBox.textContent = 'Aktifkan layanan lokasi.';
  }, {
    enableHighAccuracy: true,
    timeout: 10000
  });
} else {
  infoBox.textContent = 'Geolocation tidak didukung browser ini.';
}

});

// Toggle sidebar
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
sidebarToggle.addEventListener('click', () => {
  sidebar.style.display = sidebar.style.display === 'flex' ? 'none' : 'flex';
});

// Tombol daftar apotek
const listBtn = document.getElementById('listBtn');
listBtn.addEventListener('click', () => {
  if (!apotekData) {
    alert('Data apotek belum dimuat.');
    return;
  }

  const names = apotekData.features
    .map(f => f.properties.name || f.properties.NAMA_RS || 'Unnamed')
    .join('\n');

});

const popup = document.getElementById('popupList');
const apotekList = document.getElementById('apotekList');
const popupClose = document.getElementById('popupClose');

listBtn.addEventListener('click', () => {
  if (!apotekData) {
    alert('Data apotek belum dimuat.');
    return;
  }

  // Kosongkan isi list
  apotekList.innerHTML = '';

  apotekData.features.forEach((f, idx) => {
    const nama = f.properties.name || f.properties.NAMA_RS || 'Unnamed Facility';
    const [lon, lat] = f.geometry.coordinates;

    const li = document.createElement('li');
    li.textContent = `${idx + 1}. ${nama}`;
    li.addEventListener('click', () => {
      map.setView([lat, lon], 17);
      L.popup()
        .setLatLng([lat, lon])
        .setContent(`<strong>${nama}</strong><br><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank">🧭 Buka di Google Maps</a>`)
        .openOn(map);
      popup.classList.add('hidden');
    });
    apotekList.appendChild(li);
  });

  popup.classList.remove('hidden');
});

popupClose.addEventListener('click', () => {
  popup.classList.add('hidden');
});

// 🔍 Tombol pencarian
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

searchBtn?.addEventListener('click', () => {
  if (!apotekData) {
    alert('Data apotek belum dimuat.');
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    alert('Ketik nama apotek terlebih dahulu.');
    return;
  }

  const match = apotekData.features.find(f => {
    const nama = (f.properties.name || f.properties.NAMA_RS || '').toLowerCase();
    return nama.includes(query);
  });

  if (!match) {
    alert('Apotek tidak ditemukan.');
    return;
  }

  const [lon, lat] = match.geometry.coordinates;
  const nama = match.properties.name || match.properties.NAMA_RS || 'Apotek';

  map.setView([lat, lon], 17);
  L.popup()
    .setLatLng([lat, lon])
    .setContent(`<strong>${nama}</strong><br>📍 Ditemukan di hasil pencarian`)
    .openOn(map);
});

// 📍 Lokasi manual
const manualBtn = document.getElementById('manualBtn');
let manualMode = false;

manualBtn?.addEventListener('click', () => {
  manualMode = true;
  showManualPopup();
});

// Fungsi untuk menampilkan popup kustom
function showManualPopup() {
  // Hapus popup jika sudah ada
  const existing = document.querySelector('.manual-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'manual-popup';
  popup.innerHTML = `
    <div class="manual-popup-content">
      <span class="manual-popup-close">&times;</span>
      <p>📍 Klik di peta untuk memilih lokasi secara manual.</p>
    </div>
  `;
  document.body.appendChild(popup);

  // Tombol close
  popup.querySelector('.manual-popup-close').addEventListener('click', () => {
    popup.remove();
  });
}


// Event klik peta
map.on('click', (e) => {
  if (!manualMode || !apotekData) return;
  manualMode = false;

  const { lat, lng } = e.latlng;

  if (manualMarker) map.removeLayer(manualMarker);
  manualMarker = L.marker([lat, lng], {
    icon: userIcon,
    title: 'Lokasi Manual'
  }).addTo(map);

  map.setView([lat, lng], 15);

  const nearest = apotekData.features.reduce((acc, f) => {
    const [lon, lat_] = f.geometry.coordinates;
    const dist = haversineDistance(lat, lng, lat_, lon);
    const name = f.properties.name || f.properties.NAMA_RS || 'Unnamed Facility';
    return dist < acc.dist ? { lat: lat_, lng: lon, name, dist } : acc;
  }, { dist: Infinity });

  infoBox.textContent = `Apotek Terdekat: ${nearest.name}, approx ${(nearest.dist / 1000).toFixed(2)} km away.`;

  if (routingControl) {
    routingControl.setWaypoints([L.latLng(lat, lng), L.latLng(nearest.lat, nearest.lng)]);
  } else {
    routingControl = L.Routing.control({
      waypoints: [L.latLng(lat, lng), L.latLng(nearest.lat, nearest.lng)],
      lineOptions: { styles: [{ color: '#e75480', opacity: 0.85, weight: 6 }] },
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false
    }).addTo(map);
  }
});

