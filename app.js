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

const certificationQuestions = [
  {
    question: "What does B Corp Certification assess?",
    answers: ["A company's overall social and environmental performance", "The ingredients in one specific product", "Whether every product is carbon neutral"],
    correct: 0,
    explanation: "B Corp Certification evaluates a company's wider impact and accountability. It is not a product-level eco-label, and it does not mean every product is impact-free."
  },
  {
    question: "A Fairtrade mark on a product is mainly a signal about…",
    answers: ["The product meeting Fairtrade requirements for its certified ingredients", "A guarantee that the whole product has zero environmental impact", "A company's workplace policies in every country"],
    correct: 0,
    explanation: "Fairtrade certification applies to products and their covered supply chains. Check which ingredients are certified; the mark is not a promise that a product has no impact."
  },
  {
    question: "What is Leaping Bunny best known for?",
    answers: ["Cruelty-free commitments covering animal testing in a company's supply chain", "Certifying that a product is made with recycled packaging", "Measuring a company's overall community impact"],
    correct: 0,
    explanation: "Leaping Bunny focuses on animal-testing policies for cosmetics and household products, including supply-chain commitments. It addresses a different issue from B Corp or Fairtrade."
  },
  {
    question: "A company is B Corp Certified. Does that automatically certify every product it sells?",
    answers: ["Yes—all of its products receive a product certification", "No—it is a company-level certification, not a seal for each product", "Only products sold online are covered"],
    correct: 1,
    explanation: "Right: B Corp is about a company's broader impact and accountability. Look for product-specific information when comparing an individual item."
  },
  {
    question: "What can Fairtrade's Minimum Price and Premium help do?",
    answers: ["Support more predictable returns and investment for producers", "Guarantee that a product uses no packaging", "Replace all local labor and environmental laws"],
    correct: 0,
    explanation: "Fairtrade standards include mechanisms such as a Minimum Price and Premium that can support producer income and community investment. They do not replace local laws or solve every supply-chain challenge."
  },
  {
    question: "You want to check animal-testing practices, farmer terms, and company-wide responsibility. What's a smart next step?",
    answers: ["Treat one certification as proof of all three", "Look for the relevant certification or evidence for each issue", "Choose the product with the most badges without checking what they cover"],
    correct: 1,
    explanation: "Exactly. These certifications focus on different things. Match the label to the question, check its scope, and look at current details for the product or company."
  }
];

function initializeQuiz() {
  const content = document.querySelector("#game-content");
  if (!content) return;

  const round = document.querySelector("#game-round");
  const scoreDisplay = document.querySelector("#game-score");
  const progress = document.querySelector("#game-progress");
  const progressFill = document.querySelector("#game-progress-fill");
  let currentQuestion = 0;
  let score = 0;
  let answered = false;

  function updateProgress(completed) {
    progress.setAttribute("aria-valuenow", String(completed));
    progressFill.style.width = `${completed / certificationQuestions.length * 100}%`;
  }

  function renderQuestion() {
    const item = certificationQuestions[currentQuestion];
    answered = false;
    round.textContent = `Question ${currentQuestion + 1} of ${certificationQuestions.length}`;
    content.innerHTML = `
      <p class="game-question-label">Pick the best answer</p>
      <h2 class="game-question">${item.question}</h2>
      <div class="game-answers" role="group" aria-label="Answer choices">
        ${item.answers.map((answer, index) => `<button class="game-answer" type="button" data-answer="${index}"><span class="answer-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${answer}</span></button>`).join("")}
      </div>
      <div id="game-feedback" aria-live="polite"></div>
      <div class="game-controls"><button class="button button-dark" type="button" data-game-action="next" hidden>${currentQuestion === certificationQuestions.length - 1 ? "See my score" : "Next question"} <span aria-hidden="true">↗</span></button></div>`;
    content.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => selectAnswer(button)));
    content.querySelector('[data-game-action="next"]').addEventListener("click", nextQuestion);
  }

  function selectAnswer(selectedButton) {
    if (answered) return;
    answered = true;
    const item = certificationQuestions[currentQuestion];
    const isCorrect = Number(selectedButton.dataset.answer) === item.correct;
    if (isCorrect) score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
    updateProgress(currentQuestion + 1);
    content.querySelectorAll("[data-answer]").forEach(button => {
      button.disabled = true;
      if (Number(button.dataset.answer) === item.correct) button.classList.add("is-correct");
      if (button === selectedButton && !isCorrect) button.classList.add("is-incorrect");
    });
    const feedback = content.querySelector("#game-feedback");
    feedback.className = `game-feedback${isCorrect ? "" : " is-incorrect"}`;
    feedback.textContent = `${isCorrect ? "That's it! " : "Not quite. "}${item.explanation}`;
    content.querySelector('[data-game-action="next"]').hidden = false;
  }

  function finishGame() {
    round.textContent = "All done!";
    content.innerHTML = `
      <div class="game-finish">
        <span class="game-spark" aria-hidden="true">${score === certificationQuestions.length ? "✦" : "✳"}</span>
        <p class="game-result">${score}/${certificationQuestions.length}</p>
        <h2>${score === certificationQuestions.length ? "Label legend!" : score >= 4 ? "You're getting the picture." : "Curiosity is a great start."}</h2>
        <p>Different certifications focus on different issues. Keep checking what a label covers and whether it applies to the specific product or company you have in mind.</p>
        <button class="button button-dark" type="button" data-game-action="restart">Play again <span aria-hidden="true">↻</span></button>
      </div>`;
    updateProgress(certificationQuestions.length);
    content.querySelector('[data-game-action="restart"]').addEventListener("click", startGame);
  }

  function nextQuestion() {
    currentQuestion += 1;
    if (currentQuestion === certificationQuestions.length) finishGame();
    else renderQuestion();
  }

  function startGame() {
    currentQuestion = 0;
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    updateProgress(0);
    renderQuestion();
  }

  content.querySelector('[data-game-action="start"]').addEventListener("click", startGame);
}

function initializeLabelGame() {
  const canvas = document.querySelector("#label-game");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const status = document.querySelector("#arcade-status");
  const scoreDisplay = document.querySelector("#arcade-score");
  const timeDisplay = document.querySelector("#arcade-time");
  const overlay = document.querySelector("#arcade-overlay");
  const overlayTitle = document.querySelector("#arcade-overlay-title");
  const overlayCopy = document.querySelector("#arcade-overlay-copy");
  const startButton = document.querySelector("#arcade-start");
  const announcement = document.querySelector("#arcade-announcement");
  if (!context) {
    status.textContent = "This browser can't display the game.";
    startButton.disabled = true;
    return;
  }

  const goodLabels = ["B CORP", "FAIRTRADE", "LEAPING BUNNY", "FSC"];
  const badLabels = ["EXCESS PLASTIC", "DEFORESTATION", "FAST FASHION", "GREENWASHING"];
  const keys = { left: false, right: false, up: false, down: false };
  const player = { x: canvas.width / 2, y: canvas.height - 48, radius: 17 };
  let targets = [];
  let score = 0;
  let remaining = 45;
  let spawnElapsed = 0;
  let lastFrame = 0;
  let frameRequest = 0;
  let displayedSeconds = 45;
  let state = "ready";

  function draw() {
    const width = canvas.width;
    const height = canvas.height;
    context.fillStyle = "#f3f6ed";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(69,107,85,.09)";
    context.lineWidth = 1;
    for (let x = 24; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 22; y < height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    targets.forEach(target => {
      context.font = "700 11px DM Sans, sans-serif";
      const labelWidth = Math.max(100, context.measureText(target.label).width + 26);
      const left = Math.max(4, Math.min(width - labelWidth - 4, target.x - labelWidth / 2));
      context.fillStyle = target.good ? "#e5efdc" : "#f8e9e3";
      context.strokeStyle = target.good ? "#78a45e" : "#cf8469";
      context.lineWidth = 1.5;
      context.beginPath();
      context.roundRect(left, target.y - 19, labelWidth, 38, 19);
      context.fill();
      context.stroke();
      context.fillStyle = target.good ? "#365c3b" : "#8a4734";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(target.label, left + labelWidth / 2, target.y);
    });

    context.fillStyle = "#456b55";
    context.beginPath();
    context.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fffefa";
    context.beginPath();
    context.arc(player.x - 5, player.y - 2, 2, 0, Math.PI * 2);
    context.arc(player.x + 5, player.y - 2, 2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#fffefa";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(player.x, player.y + 2, 5, .15, Math.PI - .15);
    context.stroke();
    context.fillStyle = "#9dc96a";
    context.beginPath();
    context.ellipse(player.x + 12, player.y - 13, 7, 3.5, -.6, 0, Math.PI * 2);
    context.fill();
  }

  function updateScore(points, label) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    announcement.textContent = points > 0
      ? `Collected ${label}. Plus ${points} points. Score ${score}.`
      : `Hit ${label}. Minus ${Math.abs(points)} points. Score ${score}.`;
  }

  function showOverlay(title, copy) {
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlay.hidden = false;
  }

  function finishGame() {
    state = "finished";
    remaining = 0;
    timeDisplay.textContent = "Time: 0s";
    status.textContent = "Game over";
    startButton.textContent = "Play again";
    showOverlay("Time's up!", `Your final score is ${score}. ${score > 0 ? "Nice label spotting!" : "Play again and look out for the responsible labels."}`);
    announcement.textContent = `Game over. Final score: ${score}.`;
    draw();
  }

  function spawnTarget() {
    const good = Math.random() < .62;
    const labels = good ? goodLabels : badLabels;
    targets.push({
      x: 65 + Math.random() * (canvas.width - 130),
      y: -25,
      speed: 76 + Math.random() * 48,
      good,
      label: labels[Math.floor(Math.random() * labels.length)]
    });
  }

  function tick(timestamp) {
    if (state !== "playing") return;
    frameRequest = 0;
    const delta = Math.min((timestamp - lastFrame) / 1000, .05);
    lastFrame = timestamp;
    remaining = Math.max(0, remaining - delta);

    const horizontal = Number(keys.right) - Number(keys.left);
    const vertical = Number(keys.down) - Number(keys.up);
    const length = Math.hypot(horizontal, vertical) || 1;
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x + horizontal / length * 250 * delta));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + vertical / length * 250 * delta));

    spawnElapsed += delta;
    if (spawnElapsed >= .78 && targets.length < 8) {
      spawnElapsed = 0;
      spawnTarget();
    }

    for (let index = targets.length - 1; index >= 0; index -= 1) {
      const target = targets[index];
      target.y += target.speed * delta;
      if (Math.hypot(target.x - player.x, target.y - player.y) < player.radius + 22) {
        updateScore(target.good ? 10 : -10, target.label);
        targets.splice(index, 1);
      } else if (target.y > canvas.height + 24) {
        targets.splice(index, 1);
      }
    }

    const seconds = Math.ceil(remaining);
    if (seconds !== displayedSeconds) {
      displayedSeconds = seconds;
      timeDisplay.textContent = `Time: ${seconds}s`;
    }
    draw();
    if (remaining === 0) finishGame();
    else frameRequest = requestAnimationFrame(tick);
  }

  function startGame() {
    score = 0;
    remaining = 45;
    displayedSeconds = 45;
    spawnElapsed = 0;
    targets = [];
    player.x = canvas.width / 2;
    player.y = canvas.height - 48;
    Object.keys(keys).forEach(direction => { keys[direction] = false; });
    scoreDisplay.textContent = "Score: 0";
    timeDisplay.textContent = "Time: 45s";
    status.textContent = "Playing — use the arrow keys";
    startButton.textContent = "Pause game";
    overlay.hidden = true;
    announcement.textContent = "Game started. Use the arrow keys to move.";
    state = "playing";
    canvas.focus();
    lastFrame = performance.now();
    frameRequest = requestAnimationFrame(tick);
  }

  startButton.addEventListener("click", () => {
    if (state === "playing") {
      state = "paused";
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      status.textContent = "Paused";
      startButton.textContent = "Resume game";
      showOverlay("Game paused", "Pick up where you left off when you're ready.");
      Object.keys(keys).forEach(direction => { keys[direction] = false; });
    } else if (state === "paused") {
      state = "playing";
      status.textContent = "Playing — use the arrow keys";
      startButton.textContent = "Pause game";
      overlay.hidden = true;
      lastFrame = performance.now();
      frameRequest = requestAnimationFrame(tick);
      canvas.focus();
    } else {
      startGame();
    }
  });

  const directionForKey = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
  document.addEventListener("keydown", event => {
    const direction = directionForKey[event.key];
    if (!direction || state !== "playing") return;
    event.preventDefault();
    keys[direction] = true;
  });
  document.addEventListener("keyup", event => {
    const direction = directionForKey[event.key];
    if (direction) keys[direction] = false;
  });
  window.addEventListener("blur", () => {
    Object.keys(keys).forEach(direction => { keys[direction] = false; });
  });

  document.querySelectorAll("[data-direction]").forEach(button => {
    const direction = button.dataset.direction;
    button.addEventListener("pointerdown", event => {
      if (state !== "playing") return;
      event.preventDefault();
      keys[direction] = true;
      button.setPointerCapture(event.pointerId);
    });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(eventName => {
      button.addEventListener(eventName, () => { keys[direction] = false; });
    });
  });

  draw();
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
initializeQuiz();
initializeLabelGame();