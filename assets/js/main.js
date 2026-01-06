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
    setupSearch(data);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  });

function renderMarkers(data) {
  data.forEach(p => {
    const lat = parseFloat(p.lat);
    const lng = parseFloat(p.lng);
    if (isNaN(
