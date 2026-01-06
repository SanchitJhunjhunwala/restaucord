
//const map = L.map("map").setView([12.97, 77.59], 12);
const map = L.map("map");
const bounds = L.latLngBounds([]);


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

let markers = [];

fetch("data/restaurants.csv")
  .then(r => r.text())
  .then(csv => {
    const data = parseCSV(csv);
    data.forEach(p => {
      //const m = L.marker([p.lat, p.lng]).addTo(map)
      //  .bindPopup(`<b>${p.name}</b><br/>⭐ ${p.must_try}<br/>⚠️ ${p.avoid}`);
      //markers.push({ m, p });
		const latlng = [parseFloat(p.lat), parseFloat(p.lng)];

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
		
		if (bounds.isValid()) {
		  map.fitBounds(bounds, { padding: [40, 40] });
		}


    });

    // document.getElementById("search").addEventListener("input", e => {
      // const q = e.target.value.toLowerCase();
      // markers.forEach(({ m, p }) => {
        // if (p.name.toLowerCase().includes(q) || p.cuisine.toLowerCase().includes(q)) {
          // m.addTo(map);
        // } else {
          // map.removeLayer(m);
        // }
      // });
    // });
	
	const searchInput = document.getElementById("search");
	const resultsDiv = document.getElementById("results");

	searchInput.addEventListener("input", e => {
	  const q = e.target.value.toLowerCase().trim();
	  resultsDiv.innerHTML = "";

	  if (!q) {
		resultsDiv.style.display = "none";
		markers.forEach(({ m }) => m.addTo(map));
		return;
	  }

	  const matches = [];

	  markers.forEach(({ m, p }) => {
		const haystack = Object.values(p)
		  .join(" ")
		  .toLowerCase();

		if (haystack.includes(q)) {
		  m.addTo(map);
		  matches.push({ m, p });
		} else {
		  map.removeLayer(m);
		}
	  });

	  if (matches.length === 0) {
		resultsDiv.style.display = "none";
		return;
	  }

	  resultsDiv.style.display = "block";

	  matches.forEach(({ m, p }) => {
		const div = document.createElement("div");
		div.className = "result-item";
		div.innerHTML = `<strong>${p.name}</strong><br/><small>${p.cuisine}</small>`;

		div.addEventListener("click", () => {
		  map.setView(m.getLatLng(), 16);
		  m.openPopup();
		  resultsDiv.style.display = "none";
		});

		resultsDiv.appendChild(div);
	  });
	});

	
	
	
	
  });
