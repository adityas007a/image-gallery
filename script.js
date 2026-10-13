const photos = [
  {
    id: 1,
    title: "The long way home",
    location: "Dolomites, Italy",
    category: "Nature and Wildlife",
    photographer: "Ethan Steel",
    date: "2025-03-12",
    image: "photo-1470770841072-f978cf4d019e",
    description: "The last light settling over a still alpine lake.",
  },
  {
    id: 2,
    title: "A softer kind of blue",
    location: "Amalfi Coast, Italy",
    category: "Travel",
    photographer: "Ethan Steel",
    date: "2025-03-08",
    image: "photo-1533105079780-92b9be482077",
    description: "A sun-warmed village leaning into the blue Mediterranean.",
  },
  {
    id: 3,
    title: "A pause in the day",
    location: "Kyoto, Japan",
    category: "Portrait",
    photographer: "Ethan Steel",
    date: "2025-02-28",
    image: "photo-1534528741775-53994a69daeb",
    description: "A portrait caught somewhere between a thought and a smile.",
  },
  {
    id: 4,
    title: "Before the city wakes",
    location: "Paris, France",
    category: "Travel",
    photographer: "Ethan Steel",
    date: "2025-02-21",
    image: "photo-1502602898657-3e91760cbb34",
    description: "Quiet rooftops and the first blush of morning.",
  },
  {
    id: 5,
    title: "Where the pines breathe",
    location: "British Columbia, Canada",
    category: "Nature and Wildlife",
    photographer: "Ethan Steel",
    date: "2025-02-14",
    image: "photo-1448375240586-882707db888b",
    description: "A small path disappearing into a deep green forest.",
  },
  {
    id: 6,
    title: "The shape of a Sunday",
    location: "Copenhagen, Denmark",
    category: "Portrait",
    photographer: "Ethan Steel",
    date: "2025-02-02",
    image: "photo-1524504388940-b1c1722653e1",
    description: "A quiet portrait in the soft, late-afternoon light.",
  },
  {
    id: 7,
    title: "Salt in the air",
    location: "Big Sur, California",
    category: "Nature and Wildlife",
    photographer: "Ethan Steel",
    date: "2025-01-19",
    image: "photo-1500530855697-b586d89ba3ee",
    description: "The coast holding its breath just before the fog rolls in.",
  },
  {
    id: 8,
    title: "A room with a view",
    location: "Marrakech, Morocco",
    category: "Fashion",
    photographer: "Ethan Steel",
    date: "2025-01-11",
    image: "photo-1618221195710-dd6b41faaea6",
    description: "A sunlit interior made of texture, stillness, and shadow.",
  },
  {
    id: 9,
    title: "The sun takes its time",
    location: "Santorini, Greece",
    category: "Travel",
    photographer: "Ethan Steel",
    date: "2024-12-27",
    image: "photo-1533105079780-92b9be482077",
    description: "Whitewashed walls catching the last warmth of the day.",
  },
  {
    id: 10,
    title: "Small, wild things",
    location: "Provence, France",
    category: "Nature and Wildlife",
    photographer: "Ethan Steel",
    date: "2024-12-15",
    image: "photo-1490750967868-88aa4486c946",
    description: "A little field of flowers leaning into the afternoon.",
  },
  {
    id: 11,
    title: "Between two tides",
    location: "Lofoten, Norway",
    category: "Nature and Wildlife",
    photographer: "Ethan Steel",
    date: "2024-12-03",
    image: "photo-1464822759023-fed622ff2c3b",
    description: "A mountain range opening up beneath a pale northern sky.",
  },
  {
    id: 12,
    title: "Things left on the table",
    location: "Lisbon, Portugal",
    category: "Fashion",
    photographer: "Ethan Steel",
    date: "2024-11-21",
    image: "photo-1490312278390-ab64016e0aa9",
    description: "Everyday objects holding on to the afternoon light.",
  },
];

const pageSize = 8;
const favoriteIds = new Set();
const grid = document.querySelector("#gallery-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#gallery-search");
const sortSelect = document.querySelector("#gallery-sort");
const resultsCount = document.querySelector("#results-count");
const loadMoreButton = document.querySelector("#load-more");
const favoritesToggle = document.querySelector("#favorites-toggle");
const savedCount = document.querySelector("#saved-count");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxLocation = document.querySelector("#lightbox-location");
const lightboxCounter = document.querySelector("#lightbox-counter");
const lightboxZoomLevel = document.querySelector("#lightbox-zoom-level");
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

let activeCategory = "All";
let visibleCount = pageSize;
let showingFavorites = false;
let lightboxPhotos = [];
let activePhotoIndex = 0;
let galleryRenderId = 0;
let galleryRenderTimeout = 0;
let galleryFadeFrame = 0;
let lightboxZoom = 1;
let tiltedCard = null;

function imageUrl(photo, width = 900) {
  return `https://images.unsplash.com/${photo.image}?auto=format&fit=crop&w=${width}&q=82`;
}

function getFilteredPhotos() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = photos.filter((photo) => {
    const matchesCategory = activeCategory === "All" || photo.category === activeCategory;
    const searchableText = `${photo.title} ${photo.location} ${photo.category} ${photo.photographer} ${photo.description}`.toLowerCase();
    const matchesSearch = !query || searchableText.includes(query);
    const matchesFavorite = !showingFavorites || favoriteIds.has(photo.id);
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  if (sortSelect.value === "newest") {
    filtered.sort((first, second) => second.date.localeCompare(first.date));
  } else if (sortSelect.value === "az") {
    filtered.sort((first, second) => first.title.localeCompare(second.title));
  }

  return filtered;
}

function renderGallery() {
  const currentRenderId = ++galleryRenderId;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const existingCards = [...grid.querySelectorAll(".photo-card")];
  resetTiltedCard();
  window.clearTimeout(galleryRenderTimeout);
  window.cancelAnimationFrame(galleryFadeFrame);
  grid.classList.add("is-filtering");

  const updateGallery = () => {
    if (currentRenderId !== galleryRenderId) return;

    const filteredPhotos = getFilteredPhotos();
    const visiblePhotos = filteredPhotos.slice(0, visibleCount);

    resultsCount.textContent = `${filteredPhotos.length} ${filteredPhotos.length === 1 ? "photograph" : "photographs"}`;
    savedCount.textContent = favoriteIds.size;
    emptyState.hidden = filteredPhotos.length > 0;
    grid.hidden = filteredPhotos.length === 0;
    loadMoreButton.hidden = filteredPhotos.length <= visibleCount;
    grid.innerHTML = visiblePhotos
      .map((photo, index) => {
        const isFavorite = favoriteIds.has(photo.id);
        const imageDescription = `${photo.description} — ${photo.location}`;

        return `
        <article class="photo-card" data-photo-id="${photo.id}">
          <div class="photo-image-wrap" data-open-photo="${photo.id}" role="button" tabindex="0" aria-label="View ${photo.title}, ${photo.location}">
            <img class="photo-image" src="${imageUrl(photo)}" alt="${imageDescription}" loading="lazy" decoding="async" />
            <button class="favorite-button${isFavorite ? " is-favorite" : ""}" type="button" data-favorite="${photo.id}" aria-label="${isFavorite ? "Remove" : "Save"} ${photo.title} ${isFavorite ? "from" : "to"} favorites" aria-pressed="${isFavorite}">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 17s-7-4.3-7-9.2A3.8 3.8 0 0 1 10 5.5a3.8 3.8 0 0 1 7 2.3C17 12.7 10 17 10 17Z" />
              </svg>
            </button>
            <span class="photo-glass-overlay" aria-hidden="true">
              <span class="photo-overlay-credit">${photo.photographer} <span>·</span> ${photo.category}</span>
              <span class="photo-overlay-title">${photo.title}</span>
              <span class="photo-overlay-caption">${photo.description}</span>
            </span>
          </div>
          <div class="photo-meta">
            <div>
              <h3 class="photo-title">${photo.title}</h3>
              <p class="photo-location">${photo.location}</p>
            </div>
            <span class="photo-number">${String(index + 1).padStart(2, "0")}</span>
          </div>
        </article>`;
      })
      .join("");

    galleryFadeFrame = window.requestAnimationFrame(() => {
      if (currentRenderId === galleryRenderId) grid.classList.remove("is-filtering");
    });
  };

  const fadeDuration = reducedMotion || existingCards.length === 0 ? 0 : 150;
  galleryRenderTimeout = window.setTimeout(updateGallery, fadeDuration);
}

function setActiveCategory(category) {
  activeCategory = category;
  visibleCount = pageSize;

  document.querySelectorAll(".filter-button").forEach((button) => {
    const selected = button.dataset.filter === category;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  renderGallery();
}

function toggleFavorite(photoId) {
  if (favoriteIds.has(photoId)) {
    favoriteIds.delete(photoId);
  } else {
    favoriteIds.add(photoId);
  }

  renderGallery();
}

function showPhotoInLightbox(index) {
  if (lightboxPhotos.length === 0) return;

  activePhotoIndex = (index + lightboxPhotos.length) % lightboxPhotos.length;
  const photo = lightboxPhotos[activePhotoIndex];
  lightboxImage.src = imageUrl(photo, 1800);
  lightboxImage.alt = `${photo.description} — ${photo.location}`;
  lightboxTitle.textContent = photo.title;
  lightboxCategory.textContent = photo.category;
  lightboxLocation.textContent = photo.location;
  lightboxCounter.textContent = `${String(activePhotoIndex + 1).padStart(2, "0")} / ${String(lightboxPhotos.length).padStart(2, "0")}`;
  setLightboxZoom(1);
}

function setLightboxZoom(zoom) {
  lightboxZoom = Math.max(1, Math.min(3, zoom));
  lightboxImage.style.transform = `scale(${lightboxZoom})`;
  lightboxZoomLevel.textContent = `${Math.round(lightboxZoom * 100)}%`;
  lightboxImage.classList.toggle("is-zoomed", lightboxZoom > 1);
}

function resetTiltedCard() {
  if (!tiltedCard) return;
  tiltedCard.style.transform = "";
  tiltedCard.style.removeProperty("--parallax-x");
  tiltedCard.style.removeProperty("--parallax-y");
  tiltedCard = null;
}

function openLightbox(photoId) {
  lightboxPhotos = getFilteredPhotos();
  const index = lightboxPhotos.findIndex((photo) => photo.id === photoId);
  if (index === -1) return;

  showPhotoInLightbox(index);
  lightbox.showModal();
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => setActiveCategory(button.dataset.filter));
});

document.querySelectorAll("[data-nav-filter]").forEach((link) => {
  link.addEventListener("click", () => setActiveCategory(link.dataset.navFilter));
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  });
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  mainNav.classList.toggle("is-open", !isExpanded);
});

searchInput.addEventListener("input", () => {
  visibleCount = pageSize;
  renderGallery();
});

sortSelect.addEventListener("change", () => {
  visibleCount = pageSize;
  renderGallery();
});

loadMoreButton.addEventListener("click", () => {
  visibleCount += pageSize;
  renderGallery();
});

favoritesToggle.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  favoritesToggle.classList.toggle("is-active", showingFavorites);
  favoritesToggle.setAttribute("aria-pressed", String(showingFavorites));
  renderGallery();
});

document.querySelector("#clear-filters").addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "curated";
  showingFavorites = false;
  favoritesToggle.classList.remove("is-active");
  favoritesToggle.setAttribute("aria-pressed", "false");
  setActiveCategory("All");
});

grid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    event.stopPropagation();
    toggleFavorite(Number(favoriteButton.dataset.favorite));
    return;
  }

  const photoTarget = event.target.closest("[data-open-photo]");
  if (photoTarget) openLightbox(Number(photoTarget.dataset.openPhoto));
});

grid.addEventListener("keydown", (event) => {
  const photoTarget = event.target.closest("[data-open-photo]");
  if (photoTarget && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openLightbox(Number(photoTarget.dataset.openPhoto));
  }
});

grid.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;

  const card = event.target.closest(".photo-card");
  if (!card) {
    resetTiltedCard();
    return;
  }

  if (tiltedCard !== card) resetTiltedCard();

  const bounds = card.getBoundingClientRect();
  const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
  const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
  const tiltX = (-vertical * 4).toFixed(2);
  const tiltY = (horizontal * 4).toFixed(2);

  card.style.transform = `perspective(850px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(2px)`;
  card.style.setProperty("--parallax-x", `${(horizontal * 5).toFixed(2)}px`);
  card.style.setProperty("--parallax-y", `${(vertical * 5).toFixed(2)}px`);
  tiltedCard = card;
});

grid.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "mouse") return;
  resetTiltedCard();
});

favoritesToggle.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && showingFavorites) {
    showingFavorites = false;
    favoritesToggle.classList.remove("is-active");
    favoritesToggle.setAttribute("aria-pressed", "false");
    renderGallery();
  }
});

document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector("#lightbox-previous").addEventListener("click", () => showPhotoInLightbox(activePhotoIndex - 1));
document.querySelector("#lightbox-next").addEventListener("click", () => showPhotoInLightbox(activePhotoIndex + 1));
document.querySelector("#lightbox-zoom-in").addEventListener("click", () => setLightboxZoom(lightboxZoom + 0.25));
document.querySelector("#lightbox-zoom-out").addEventListener("click", () => setLightboxZoom(lightboxZoom - 0.25));
document.querySelector("#lightbox-zoom-reset").addEventListener("click", () => setLightboxZoom(1));

lightbox.addEventListener(
  "wheel",
  (event) => {
    if (!lightbox.open || !event.target.closest(".lightbox-image-viewport")) return;
    event.preventDefault();
    setLightboxZoom(lightboxZoom + (event.deltaY < 0 ? 0.15 : -0.15));
  },
  { passive: false },
);

document.querySelector("#showcase-fullscreen").addEventListener("click", () => {
  lightboxPhotos = [
    {
      id: "featured",
      title: "Moments in Focus",
      location: "Selected Work · 2025",
      category: "Featured",
      image: "photo-1487958449943-2429e8be8625",
      description: "Finding stillness in the shape of a city.",
    },
  ];
  showPhotoInLightbox(0);
  lightbox.showModal();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPhotoInLightbox(activePhotoIndex - 1);
  if (event.key === "ArrowRight") showPhotoInLightbox(activePhotoIndex + 1);
  if (event.key === "+" || event.key === "=") setLightboxZoom(lightboxZoom + 0.25);
  if (event.key === "-") setLightboxZoom(lightboxZoom - 0.25);
  if (event.key === "0") setLightboxZoom(1);
});

renderGallery();
