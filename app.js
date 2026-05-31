// ======================
// ESTADO DA APLICAÇÃO
// ======================

const STORAGE_KEY = "contagemEquipeV1";

let appData = {
  sectors: [],
  selectedSectorId: null
};

let currentEditingSectorId = null;
let currentEditingCategoryId = null;
let currentManagingSectorId = null;

let confirmCallback = null;

// ======================
// ELEMENTOS
// ======================

const sectorSelect = document.getElementById("sectorSelect");
const categoriesContainer = document.getElementById("categoriesContainer");
const totalCount = document.getElementById("totalCount");
const previewText = document.getElementById("previewText");

const emptySector = document.getElementById("emptySector");

const settingsBtn = document.getElementById("settingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

const settingsModal = document.getElementById("settingsModal");
const sectorModal = document.getElementById("sectorModal");
const categoryModal = document.getElementById("categoryModal");
const confirmModal = document.getElementById("confirmModal");

const sectorList = document.getElementById("sectorList");
const categoryList = document.getElementById("categoryList");

const categoryEditor = document.getElementById("categoryEditor");
const categoryEditorTitle = document.getElementById("categoryEditorTitle");

const createFirstSectorBtn = document.getElementById("createFirstSectorBtn");

const addSectorBtn = document.getElementById("addSectorBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");

const saveSectorBtn = document.getElementById("saveSectorBtn");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");

const sectorNameInput = document.getElementById("sectorNameInput");

const categoryNameInput =
  document.getElementById("categoryNameInput");

const categoryLimitInput =
  document.getElementById("categoryLimitInput");

const copyBtn = document.getElementById("copyBtn");
const resetBtn = document.getElementById("resetBtn");

const confirmText = document.getElementById("confirmText");
const confirmBtn = document.getElementById("confirmBtn");
const cancelConfirmBtn =
  document.getElementById("cancelConfirmBtn");

// ======================
// STORAGE
// ======================

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(appData)
  );

}

function loadData() {

  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  appData = JSON.parse(saved);

}

// ======================
// UTILITÁRIOS
// ======================

function generateId() {

  return (
    Date.now().toString() +
    Math.random().toString(36).slice(2)
  );

}

function getSelectedSector() {

  return appData.sectors.find(
    sector =>
      sector.id === appData.selectedSectorId
  );

}

function getTotal(sector) {

  return sector.categories.reduce(
    (sum, category) =>
      sum + category.count,
    0
  );

}

function formatDate() {

  const now = new Date();

  const day =
    String(now.getDate()).padStart(2, "0");

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const year =
    now.getFullYear();

  return `${day}/${month}/${year}`;

}

// ======================
// RENDER SETORES
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

    const option =
      document.createElement("option");

    option.value = sector.id;
    option.textContent = sector.name;

    sectorSelect.appendChild(option);

  });

  if (!appData.selectedSectorId) {

    appData.selectedSectorId =
      appData.sectors[0].id;

  }

  sectorSelect.value =
    appData.selectedSectorId;

}

// ======================
// RENDER CATEGORIAS
// ======================

function renderCategories() {

  categoriesContainer.innerHTML = "";

  const sector =
    getSelectedSector();

  if (!sector) return;

  if (sector.categories.length === 0) {

    categoriesContainer.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma categoria cadastrada.</p>

        <button
          id="quickAddCategory"
          class="primary-btn">

          ➕ Adicionar categoria

        </button>
      </div>
    `;

    const quickBtn =
      document.getElementById(
        "quickAddCategory"
      );

    if (quickBtn) {

      quickBtn.addEventListener(
        "click",
        () => {

          currentManagingSectorId =
            sector.id;

          openCategoryModal();

        }
      );

    }

    updatePreview();

    return;

  }

  sector.categories.forEach(category => {

    const card =
      document.createElement("div");

    card.className =
      "category-card";

    const hasLimit =
      category.limit !== null &&
      category.limit !== "";

    const complete =
      hasLimit &&
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

        <div
          class="counter-display ${
            complete
              ? "complete"
              : ""
          }">

          ${
            hasLimit
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

    categoriesContainer
      .appendChild(card);

  });

  bindCounterButtons();

  updatePreview();

}

// ======================
// CONTADORES
// ======================

function bindCounterButtons() {

  document
    .querySelectorAll(".plus-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const sector =
            getSelectedSector();

          const category =
            sector.categories.find(
              c =>
                c.id ===
                button.dataset.id
            );

          const hasLimit =
            category.limit !== null &&
            category.limit !== "";

          if (
            hasLimit &&
            category.count >=
              category.limit
          ) {
            return;
          }

          category.count++;

          saveData();

          renderCategories();

        }
      );

    });

  document
    .querySelectorAll(".minus-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const sector =
            getSelectedSector();

          const category =
            sector.categories.find(
              c =>
                c.id ===
                button.dataset.id
            );

          if (
            category.count > 0
          ) {

            category.count--;

          }

          saveData();

          renderCategories();

        }
      );

    });

}

// ======================
// TOTAL
// ======================

function updateTotal() {

  const sector =
    getSelectedSector();

  if (!sector) {

    totalCount.textContent =
      "0";

    return;

  }

  totalCount.textContent =
    getTotal(sector);

}

// ======================
// PRÉVIA
// ======================

function updatePreview() {

  updateTotal();

  const sector =
    getSelectedSector();

  if (!sector) {

    previewText.textContent =
      "";

    return;

  }

  let message = "";

  message +=
    formatDate();

  message += "\n\n";

  message +=
    sector.name;

  message += "\n\n";

  sector.categories.forEach(
    category => {

      message +=
        `${category.name}: ${category.count}\n`;

    }
  );

  message +=
    `\nTotal: ${getTotal(sector)}`;

  previewText.textContent =
    message;

}

// ======================
// TROCA DE SETOR
// ======================

sectorSelect.addEventListener(
  "change",
  () => {

    appData.selectedSectorId =
      sectorSelect.value;

    saveData();

    renderCategories();

  }
);

// ======================
// MODAIS
// ======================

function openModal(modal) {

  modal.classList.remove(
    "hidden"
  );

}

function closeModal(modal) {

  modal.classList.add(
    "hidden"
  );

}

function openConfirm(
  text,
  callback
) {

  confirmText.textContent =
    text;

  confirmCallback =
    callback;

  openModal(
    confirmModal
  );

}

// ======================
// CONFIGURAÇÕES
// ======================

settingsBtn.addEventListener(
  "click",
  () => {

    renderSectorList();

    closeCategoryEditor();

    openModal(
      settingsModal
    );

  }
);

closeSettingsBtn.addEventListener(
  "click",
  () => {

    closeModal(
      settingsModal
    );

  }
);

// ======================
// LISTA DE SETORES
// ======================

function renderSectorList() {

  sectorList.innerHTML = "";

  appData.sectors.forEach(
    sector => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "setting-item";

      item.innerHTML = `
        <strong>
          ${sector.name}
        </strong>

        <div class="setting-actions">

          <button
            class="manage-btn"
            data-id="${sector.id}">

            📂 Categorias

          </button>

          <button
            class="edit-btn"
            data-id="${sector.id}">

            ✏️

          </button>

          <button
            class="delete-btn"
            data-id="${sector.id}">

            🗑️

          </button>

        </div>
      `;

      sectorList.appendChild(
        item
      );

    }
  );

  bindSectorButtons();

}

// ======================
// BOTÕES DOS SETORES
// ======================

function bindSectorButtons() {

  document
    .querySelectorAll(
      ".manage-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          currentManagingSectorId =
            btn.dataset.id;

          openCategoryEditor(
            btn.dataset.id
          );

        }
      );

    });

  document
    .querySelectorAll(
      ".edit-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const sector =
            appData.sectors.find(
              s =>
                s.id ===
                btn.dataset.id
            );

          currentEditingSectorId =
            sector.id;

          sectorNameInput.value =
            sector.name;

          openModal(
            sectorModal
          );

        }
      );

    });

  document
    .querySelectorAll(
      ".delete-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const sector =
            appData.sectors.find(
              s =>
                s.id ===
                btn.dataset.id
            );

          openConfirm(
            `Excluir o setor "${sector.name}"?`,
            () => {

              appData.sectors =
                appData.sectors.filter(
                  s =>
                    s.id !==
                    sector.id
                );

              if (
                appData.selectedSectorId ===
                sector.id
              ) {

                appData.selectedSectorId =
                  appData.sectors[0]
                    ?.id || null;

              }

              saveData();

              renderSectorList();
              renderSectorSelect();
              renderCategories();

              closeModal(
                confirmModal
              );

            }
          );

        }
      );

    });

}

// ======================
// NOVO SETOR
// ======================

addSectorBtn.addEventListener(
  "click",
  () => {

    currentEditingSectorId =
      null;

    sectorNameInput.value =
      "";

    openModal(
      sectorModal
    );

  }
);

createFirstSectorBtn.addEventListener(
  "click",
  () => {

    currentEditingSectorId =
      null;

    sectorNameInput.value =
      "";

    openModal(
      sectorModal
    );

  }
);

// ======================
// SALVAR SETOR
// ======================

saveSectorBtn.addEventListener(
  "click",
  () => {

    const name =
      sectorNameInput.value.trim();

    if (!name) return;

    if (
      currentEditingSectorId
    ) {

      const sector =
        appData.sectors.find(
          s =>
            s.id ===
            currentEditingSectorId
        );

      sector.name =
        name;

    } else {

      const sector = {

        id: generateId(),

        name,

        categories: []

      };

      appData.sectors.push(
        sector
      );

      if (
        !appData.selectedSectorId
      ) {

        appData.selectedSectorId =
          sector.id;

      }

    }

    saveData();

    renderSectorList();
    renderSectorSelect();
    renderCategories();

    closeModal(
      sectorModal
    );

  }
);

// ======================
// FECHAR EDITOR
// ======================

function closeCategoryEditor() {

  categoryEditor.classList.add(
    "hidden"
  );

}

// ======================
// ABRIR CATEGORIAS
// ======================

function openCategoryEditor(
  sectorId
) {

  currentManagingSectorId =
    sectorId;

  const sector =
    appData.sectors.find(
      s => s.id === sectorId
    );

  if (!sector) return;

  categoryEditor.classList.remove(
    "hidden"
  );

  categoryEditorTitle.textContent =
    `Categorias - ${sector.name}`;

  renderCategoryList();

}

// ======================
// LISTA DE CATEGORIAS
// ======================

function renderCategoryList() {

  categoryList.innerHTML = "";

  const sector =
    appData.sectors.find(
      s =>
        s.id ===
        currentManagingSectorId
    );

  if (!sector) return;

  sector.categories.forEach(
    category => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "setting-item";

      item.innerHTML = `
        <strong>
          ${category.name}
          ${
            category.limit !== null &&
            category.limit !== ""
              ? ` (${category.limit})`
              : ""
          }
        </strong>

        <div class="setting-actions">

          <button
            class="edit-category-btn edit-btn"
            data-id="${category.id}">

            ✏️

          </button>

          <button
            class="delete-category-btn delete-btn"
            data-id="${category.id}">

            🗑️

          </button>

        </div>
      `;

      categoryList.appendChild(
        item
      );

    }
  );

  bindCategoryButtons();

}

// ======================
// BOTÕES CATEGORIA
// ======================

function bindCategoryButtons() {

  document
    .querySelectorAll(
      ".edit-category-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const sector =
            appData.sectors.find(
              s =>
                s.id ===
                currentManagingSectorId
            );

          const category =
            sector.categories.find(
              c =>
                c.id ===
                btn.dataset.id
            );

          currentEditingCategoryId =
            category.id;

          categoryNameInput.value =
            category.name;

          categoryLimitInput.value =
            category.limit ?? "";

          openModal(
            categoryModal
          );

        }
      );

    });

  document
    .querySelectorAll(
      ".delete-category-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const sector =
            appData.sectors.find(
              s =>
                s.id ===
                currentManagingSectorId
            );

          const category =
            sector.categories.find(
              c =>
                c.id ===
                btn.dataset.id
            );

          openConfirm(
            `Excluir a categoria "${category.name}"?`,
            () => {

              sector.categories =
                sector.categories.filter(
                  c =>
                    c.id !==
                    category.id
                );

              saveData();

              renderCategoryList();
              renderCategories();

              closeModal(
                confirmModal
              );

            }
          );

        }
      );

    });

}

// ======================
// NOVA CATEGORIA
// ======================

addCategoryBtn.addEventListener(
  "click",
  () => {

    currentEditingCategoryId =
      null;

    categoryNameInput.value =
      "";

    categoryLimitInput.value =
      "";

    openModal(
      categoryModal
    );

  }
);

// ======================
// SALVAR CATEGORIA
// ======================

saveCategoryBtn.addEventListener(
  "click",
  () => {

    const sector =
      appData.sectors.find(
        s =>
          s.id ===
          currentManagingSectorId
      );

    if (!sector) return;

    const name =
      categoryNameInput.value.trim();

    if (!name) return;

    let limit =
      categoryLimitInput.value.trim();

    if (limit === "") {

      limit = null;

    } else {

      limit =
        parseInt(limit);

      if (
        Number.isNaN(limit)
      ) {

        limit = null;

      }

    }

    // ======================
    // EDITAR
    // ======================

    if (
      currentEditingCategoryId
    ) {

      const category =
        sector.categories.find(
          c =>
            c.id ===
            currentEditingCategoryId
        );

      category.name =
        name;

      category.limit =
        limit;

      if (
        limit !== null &&
        category.count >
          limit
      ) {

        category.count =
          limit;

      }

    }

    // ======================
    // NOVA
    // ======================

    else {

      sector.categories.push({

        id: generateId(),

        name,

        limit,

        count: 0

      });

    }

    saveData();

    renderCategoryList();
    renderCategories();

    closeModal(
      categoryModal
    );

  }
);

// ======================
// CONFIRMAÇÃO
// ======================

confirmBtn.addEventListener(
  "click",
  () => {

    if (confirmCallback) {

      confirmCallback();

      confirmCallback =
        null;

    }

    closeModal(
      confirmModal
    );

  }
);

cancelConfirmBtn.addEventListener(
  "click",
  () => {

    confirmCallback =
      null;

    closeModal(
      confirmModal
    );

  }
);

// ======================
// FECHAR MODAIS
// ======================

window.addEventListener(
  "click",
  e => {

    if (
      e.target === settingsModal
    ) {

      closeModal(
        settingsModal
      );

    }

    if (
      e.target === sectorModal
    ) {

      closeModal(
        sectorModal
      );

    }

    if (
      e.target === categoryModal
    ) {

      closeModal(
        categoryModal
      );

    }

    if (
      e.target === confirmModal
    ) {

      closeModal(
        confirmModal
      );

    }

  }
);

// ======================
// COPIAR MENSAGEM
// ======================

copyBtn.addEventListener(
  "click",
  async () => {

    try {

      await navigator.clipboard.writeText(
        previewText.textContent
      );

      const originalText =
        copyBtn.textContent;

      copyBtn.textContent =
        "✅ Mensagem copiada";

      setTimeout(
        () => {

          copyBtn.textContent =
            originalText;

        },
        2000
      );

    }

    catch {

      alert(
        "Não foi possível copiar a mensagem."
      );

    }

  }
);

// ======================
// RESETAR SETOR
// ======================

resetBtn.addEventListener(
  "click",
  () => {

    const sector =
      getSelectedSector();

    if (!sector) return;

    openConfirm(
      `Resetar todas as contagens do setor "${sector.name}"?`,
      () => {

        sector.categories.forEach(
          category => {

            category.count = 0;

          }
        );

        saveData();

        renderCategories();

      }
    );

  }
);

// ======================
// REGISTRAR SERVICE WORKER
// ======================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./service-worker.js"
        )
        .catch(
          error => {

            console.error(
              error
            );

          }
        );

    }
  );

}

// ======================
// PRIMEIRA EXECUÇÃO
// ======================

function initializeApp() {

  loadData();

  renderSectorSelect();

  renderCategories();

}

// ======================
// INICIAR
// ======================

initializeApp();
