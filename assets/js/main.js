const map = L.map("map");
const bounds = L.latLngBounds();

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let markers = [];

fetch("data/restaurants.csv")
  .then(res => res.text())
  .then(csv => {
    const parsed = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length) {
      console.error("CSV parse errors:", parsed.errors);
      return;
    }

    const data = parsed.data;
    renderMarkers(data);
    setupSearch();
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  });

function renderMarkers(data) {
  data.forEach(p => {
    const lat = parseFloat(p.lat);
    const lng = parseFloat(p.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const latlng = [lat, lng];

    const m = L.marker(latlng)
      .addTo(map)
      .bindPopup(`
        <strong>${p.name}</strong><br/>
        Cuisine: ${p.cuisine}<br/>
        ⭐ Must try: ${p.must_try}<br/>
        ⚠️ Avoid: ${p.avoid}
      `);

    bounds.extend(latlng);
    markers.push({ m, p });
  });
}

function setupSearch() {
  const searchInput = document.getElementById("search");
  const resultsDiv = document.getElementById("results");

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase().trim();
    resultsDiv.innerHTML = "";

    if (!q) {
      resultsDiv.style.display = "none";
      markers.forEach(({ m }) => m.addTo(map));
      return;
    }

    const matches = [];

    markers.forEach(({ m, p }) => {
      const haystack = Object.values(p).join(" ").toLowerCase();
      if (haystack.includes(q)) {
        m.addTo(map);
        matches.push({ m, p });
      } else {
        map.removeLayer(m);
      }
    });

    if (!matches.length) {
      resultsDiv.style.display = "none";
      return;
    }

    resultsDiv.style.display = "block";

    matches.forEach(({ m, p }) => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `<strong>${p.name}</strong><br/><small>${p.cuisine}</small>`;

      div.onclick = () => {
        map.setView(m.getLatLng(), 16);
        m.openPopup();
        resultsDiv.style.display = "none";
      };

      resultsDiv.appendChild(div);
    });
  });
}
