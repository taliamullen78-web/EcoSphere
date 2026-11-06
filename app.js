const brands = [
  { name: "Patagonia", industry: "Outdoor apparel", certifications: ["B Corp"], initials: "P", url: "https://www.patagonia.com/" },
  { name: "Dr. Bronner's", industry: "Personal care", certifications: ["B Corp", "Leaping Bunny"], initials: "D", url: "https://www.drbronner.com/" },
  { name: "Tony's Chocolonely", industry: "Food & drink", certifications: ["B Corp"], initials: "T", url: "https://tonyschocolonely.com/" },
  { name: "Allbirds", industry: "Footwear", certifications: ["B Corp"], initials: "A", url: "https://www.allbirds.com/" },
  { name: "The Body Shop", industry: "Personal care", certifications: ["Leaping Bunny"], initials: "B", url: "https://www.thebodyshop.com/" },
  { name: "Divine Chocolate", industry: "Food & drink", certifications: ["Fairtrade"], initials: "D", url: "https://divinechocolate.com/" }
];

const productProfiles = {
  shampoo: { score: 72, summary: "A broad personal-care category with options ranging from concentrated bars to heavily packaged liquids. Check the specific formula and bottle before comparing products.", metrics: [["Ingredients", 68], ["Packaging", 76], ["Sourcing", 61]], good: ["A solid shampoo bar can avoid a new plastic bottle.", "Look for ingredient and sourcing details published by the maker."], watch: ["Formulas differ widely; this is not an ingredient review.", "Recyclability depends on your local collection rules."] },
  coffee: { score: 64, summary: "Coffee's impact varies with farming practices, origin, and how it's brewed. Reusable or easy-to-recycle packaging can reduce waste, but sourcing matters too.", metrics: [["Ingredients", 60], ["Packaging", 57], ["Sourcing", 74]], good: ["A recognized sourcing label can offer a useful starting signal.", "Buy only what you'll use and store it well."], watch: ["Single-use pods add material and processing steps.", "Check which certification applies to this exact blend."] },
  sneakers: { score: 59, summary: "Footwear combines multiple materials and supply-chain stages. Long wear, repairability, and a clear materials breakdown can matter as much as recycled-content claims.", metrics: [["Materials", 63], ["Packaging", 81], ["Sourcing", 49]], good: ["Choose durable styles that can be worn and maintained longer.", "Look for specific, traceable recycled-material claims."], watch: ["Mixed materials can make end-of-life recycling difficult.", "Brand-wide commitments may not apply to every model."] },
  default: { score: 67, summary: "Impact depends on the exact product, materials, maker, and local end-of-life options. This category-level demo is a prompt for what to investigate, not a rating of a specific item.", metrics: [["Materials", 65], ["Packaging", 69], ["Sourcing", 58]], good: ["Look for product-level material and sourcing disclosures.", "Favor durable, repairable formats where practical."], watch: ["A brand promise may not apply to every product.", "Compare specific products and local disposal options."] }
};

function initializeBrandDirectory() {
  const grid = document.querySelector("#brand-grid");
  if (!grid) return;

  const search = document.querySelector("#brand-search");
  const count = document.querySelector("#brand-result-count");
  const empty = document.querySelector("#brand-empty");
  const chips = [...document.querySelectorAll("[data-cert]")];
  let activeCertification = "all";

  function render() {
    const query = search.value.trim().toLowerCase();
    const matches = brands.filter(brand => {
      const matchesQuery = `${brand.name} ${brand.industry}`.toLowerCase().includes(query);
      return matchesQuery && (activeCertification === "all" || brand.certifications.includes(activeCertification));
    });
    grid.innerHTML = matches.map((brand, index) => `
      <article class="brand-card" style="animation-delay:${index * 45}ms">
        <div class="brand-card-top"><span class="brand-monogram" aria-hidden="true">${brand.initials}</span><a class="brand-card-link" href="${brand.url}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${brand.name} website">↗</a></div>
        <h3>${brand.name}</h3><p class="brand-industry">${brand.industry}</p>
        <div class="brand-badges">${brand.certifications.map(certification => `<span class="brand-badge"><span class="badge-mark" aria-hidden="true">${certification === "B Corp" ? "B" : certification === "Fairtrade" ? "F" : "✳"}</span>${certification}</span>`).join("")}</div>
      </article>`).join("");
    count.textContent = `${String(matches.length).padStart(2, "0")} ${matches.length === 1 ? "brand" : "brands"}`;
    empty.hidden = matches.length > 0;
    grid.hidden = matches.length === 0;
  }

  chips.forEach(chip => chip.addEventListener("click", () => {
    activeCertification = chip.dataset.cert;
    chips.forEach(item => {
      const selected = item === chip;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    render();
  }));
  search.addEventListener("input", render);
  document.querySelector("[data-clear-search]")?.addEventListener("click", () => {
    search.value = "";
    activeCertification = "all";
    chips.forEach(chip => {
      const selected = chip.dataset.cert === "all";
      chip.classList.toggle("is-selected", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    render();
    search.focus();
  });
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.focus();
    }
  });
  render();
}

function initializeAnalyzer() {
  const form = document.querySelector("#product-search-form");
  if (!form) return;

  const input = document.querySelector("#product-search");
  const result = document.querySelector("#analyzer-results");
  const placeholder = document.querySelector("#analyzer-placeholder");
  const card = document.querySelector("#analysis-card");
  const suggestions = [...document.querySelectorAll("[data-suggestion]")];

  function render(query) {
    const normalized = query.toLowerCase();
    const key = normalized.includes("shampoo") || normalized.includes("hair") ? "shampoo"
      : normalized.includes("coffee") || normalized.includes("pod") ? "coffee"
        : normalized.includes("sneaker") || normalized.includes("shoe") ? "sneakers" : "default";
    const profile = productProfiles[key];
    result.setAttribute("aria-busy", "true");
    placeholder.hidden = true;
    card.hidden = false;
    card.innerHTML = `
      <div class="analysis-top"><div><p class="eyebrow"><span class="eyebrow-dot"></span> Sample category analysis</p><h2>${escapeHtml(query)}</h2></div><div class="score-block"><div class="score-ring" style="--score:${profile.score}" data-score="${profile.score}"></div><span class="score-label"><strong>Demo score</strong>out of 100</span></div></div>
      <p class="analysis-summary">${profile.summary}</p>
      <div class="metric-grid">${profile.metrics.map(([label, value]) => `<div class="metric-item"><div class="metric-head"><span>${label}</span><strong>${value}/100</strong></div><div class="metric-track"><div class="metric-fill" style="width:${value}%"></div></div></div>`).join("")}</div>
      <div class="analysis-details"><section><h3>Worth looking for</h3><ul>${profile.good.map(item => `<li>${item}</li>`).join("")}</ul></section><section><h3>Keep in mind</h3><ul class="caution-list">${profile.watch.map(item => `<li>${item}</li>`).join("")}</ul></section></div>`;
    result.setAttribute("aria-busy", "false");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    render(query);
  });
  suggestions.forEach(button => button.addEventListener("click", () => {
    input.value = button.dataset.suggestion;
    render(input.value);
    input.focus();
  }));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

const mapPlaces = [
  { name: "Juniper Refill Co.", type: "physical", label: "Refill station", detail: "Hawthorne · Home & body refills", coordinates: [45.5127, -122.6228], icon: "↻" },
  { name: "Good Ground Market", type: "physical", label: "Physical store", detail: "Alberta Arts District · Pantry & produce", coordinates: [45.5595, -122.6433], icon: "⌂" },
  { name: "Morrow Goods", type: "physical", label: "Physical store", detail: "Pearl District · Thoughtful everyday goods", coordinates: [45.5273, -122.6815], icon: "⌂" },
  { name: "Common Ground Works", type: "physical", label: "B Corp headquarters", detail: "Central Eastside · Certified B Corp (demo)", coordinates: [45.5203, -122.6579], icon: "B" },
  { name: "Open Earth Collective", type: "online", label: "Online hub", detail: "Online · Certified brand directory", coordinates: [45.5357, -122.6552], icon: "↗" }
];

function initializeMap() {
  const mapElement = document.querySelector("#eco-map");
  if (!mapElement) return;

  const list = document.querySelector("#map-list");
  const count = document.querySelector("#map-result-count");
  const filters = [...document.querySelectorAll("[data-map-filter]")];
  const searchForm = document.querySelector("#location-search-form");
  let activeFilter = "all";
  let map = null;
  let markers = new Map();

  if (window.L) {
    map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: false }).setView([45.535, -122.655], 12);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    mapPlaces.forEach(place => {
      const icon = L.divIcon({ className: "", html: `<div class="eco-marker ${place.type === "online" ? "online-marker" : ""}"><span>${place.icon}</span></div>`, iconSize: [31, 31], iconAnchor: [15, 29], popupAnchor: [0, -27] });
      const marker = L.marker(place.coordinates, { icon }).addTo(map);
      marker.bindPopup(`<strong>${place.name}</strong><br>${place.label} · ${place.detail}<br><small>Illustrative demo location</small>`);
      markers.set(place.name, marker);
    });
  } else {
    mapElement.innerHTML = '<div class="map-fallback">Map tiles could not load. Check your connection and reload to view the sample map.</div>';
  }

  function render() {
    const visible = mapPlaces.filter(place => activeFilter === "all" || place.type === activeFilter);
    list.innerHTML = visible.map(place => `
      <article class="place-card" tabindex="0" data-place="${place.name}">
        <span class="place-icon ${place.type === "online" ? "online" : ""}" aria-hidden="true">${place.icon}</span>
        <div class="place-info"><h2>${place.name}</h2><p>${place.detail}</p><span class="place-type ${place.type === "online" ? "online-type" : ""}">${place.label}</span></div><span class="place-arrow" aria-hidden="true">↗</span>
      </article>`).join("");
    count.textContent = `${String(visible.length).padStart(2, "0")} ${visible.length === 1 ? "place" : "places"}`;
    markers.forEach((marker, name) => {
      const place = mapPlaces.find(item => item.name === name);
      if (activeFilter === "all" || place.type === activeFilter) marker.addTo(map);
      else map.removeLayer(marker);
    });
    list.querySelectorAll("[data-place]").forEach(item => {
      const focusPlace = () => {
        const marker = markers.get(item.dataset.place);
        const place = mapPlaces.find(entry => entry.name === item.dataset.place);
        if (!marker || !map) return;
        map.flyTo(place.coordinates, 15, { duration: .5 });
        marker.openPopup();
        list.querySelectorAll(".place-card").forEach(card => card.classList.toggle("is-focused", card === item));
      };
      item.addEventListener("click", focusPlace);
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); focusPlace(); }
      });
    });
  }

  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.mapFilter;
    filters.forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle("is-selected", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    render();
  }));
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    const query = document.querySelector("#location-search").value.trim().toLowerCase();
    if (query.includes("portland") || query.includes("oregon") || query.includes("hawthorne") || query.includes("alberta") || query.includes("pearl")) {
      if (map) map.flyTo([45.535, -122.655], 12, { duration: .6 });
    } else {
      document.querySelector("#location-search").value = "Portland, Oregon";
      if (map) map.flyTo([45.535, -122.655], 12, { duration: .6 });
    }
  });
  render();
}

function initializeMobileNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open", !isOpen);
  });
}

initializeMobileNavigation();
initializeBrandDirectory();
initializeAnalyzer();
initializeMap();