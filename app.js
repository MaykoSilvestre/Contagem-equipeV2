// ======================
// ESTADO
// ======================

let appData = JSON.parse(localStorage.getItem("contagemEquipe")) || {
  sectors: [],
  selectedSectorId: null
};

function saveData() {
  localStorage.setItem(
    "contagemEquipe",
    JSON.stringify(appData)
  );
}

// ======================
// ELEMENTOS
// ======================

const sectorSelect = document.getElementById("sectorSelect");
const categoriesContainer = document.getElementById("categoriesContainer");
const totalCount = document.getElementById("totalCount");
const previewText = document.getElementById("previewText");

const emptySector = document.getElementById("emptySector");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

const createFirstSectorBtn = document.getElementById("createFirstSectorBtn");

const sectorList = document.getElementById("sectorList");
const categoryList = document.getElementById("categoryList");

const categoryEditor = document.getElementById("categoryEditor");
const categoryEditorTitle = document.getElementById("categoryEditorTitle");

// ======================
// HELPERS
// ======================

function generateId() {
  return Date.now().toString() +
         Math.random().toString(36).slice(2);
}

function getSelectedSector() {
  return appData.sectors.find(
    s => s.id === appData.selectedSectorId
  );
}

function formatDate() {

  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
}

// ======================
// RENDER SELECT
// ======================

function renderSectorSelect() {

  sectorSelect.innerHTML = "";

  if (appData.sectors.length === 0) {

    emptySector.classList.remove("hidden");

    categoriesContainer.innerHTML = "";
    totalCount.textContent = "0";
    previewText.textContent = "";

    return;
  }

  emptySector.classList.add("hidden");

  appData.sectors.forEach(sector => {

    const option = document.createElement("option");

    option.value = sector.id;
    option.textContent = sector.name;

    sectorSelect.appendChild(option);

  });

  if (!appData.selectedSectorId) {
    appData.selectedSectorId = appData.sectors[0].id;
  }

  sectorSelect.value = appData.selectedSectorId;

}

// ======================
// RENDER CATEGORIAS
// ======================

function renderCategories() {

  categoriesContainer.innerHTML = "";

  const sector = getSelectedSector();

  if (!sector) return;

  if (sector.categories.length === 0) {

    categoriesContainer.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma categoria cadastrada.</p>
        <button id="quickAddCategory" class="primary-btn">
          ➕ Adicionar categoria
        </button>
      </div>
    `;

    document
      .getElementById("quickAddCategory")
      .addEventListener("click", () => {
        openCategoryModal();
      });

    updatePreview();

    return;
  }

  sector.categories.forEach(category => {

    const card = document.createElement("div");
    card.className = "category-card";

    const complete =
      category.limit !== null &&
      category.limit !== "" &&
      category.count >= category.limit;

    card.innerHTML = `
      <div class="category-name">
        ${category.name}
      </div>

      <div class="counter-row">

        <button
          class="counter-btn minus-btn"
          data-id="${category.id}">
          ➖
        </button>

        <div class="counter-display ${complete ? "complete" : ""}">
          ${
            category.limit
              ? `${category.count}/${category.limit}${complete ? " ✓" : ""}`
              : category.count
          }
        </div>

        <button
          class="counter-btn plus-btn"
          data-id="${category.id}"
          ${complete ? "disabled" : ""}>
          ➕
        </button>

      </div>
    `;

    categoriesContainer.appendChild(card);

  });

  bindCounterButtons();

  updatePreview();

}

// ======================
// CONTADORES
// ======================

function bindCounterButtons() {

  document.querySelectorAll(".plus-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const sector = getSelectedSector();

        const category =
          sector.categories.find(
            c => c.id === btn.dataset.id
          );

        if (
          category.limit &&
          category.count >= category.limit
        ) {
          return;
        }

        category.count++;

        saveData();
        renderCategories();

      });

    });

  document.querySelectorAll(".minus-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const sector = getSelectedSector();

        const category =
          sector.categories.find(
            c => c.id === btn.dataset.id
          );

        if (category.count > 0) {
          category.count--;
        }

        saveData();
        renderCategories();

      });

    });

}

// ======================
// TOTAL
// ======================

function updateTotal() {

  const sector = getSelectedSector();

  if (!sector) {
    totalCount.textContent = "0";
    return;
  }

  const total =
    sector.categories.reduce(
      (sum, c) => sum + c.count,
      0
    );

  totalCount.textContent = total;

}
