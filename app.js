const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskError = document.querySelector("#taskError");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("input[type='search']");
const themeToggleButton = document.querySelector("#themeToggle");

const filterAllButton = document.querySelector("#filterAll");
const filterPendingButton = document.querySelector("#filterPending");
const filterCompletedButton = document.querySelector("#filterCompleted");

const STORAGE_KEY = "gymflow_tasks";
const THEME_KEY = "gymflow_theme";
const MIN_TASK_LENGTH = 3;
const MAX_TASK_LENGTH = 60;

let tasks = [];
let currentFilter = "all";

/**
 * Guarda las tareas en localStorage.
 */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Carga las tareas guardadas desde localStorage.
 */
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  tasks = savedTasks ? JSON.parse(savedTasks) : [];
}

/**
 * Guarda el tema actual en localStorage.
 * @param {"light" | "dark"} theme
 */
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Aplica el tema guardado al documento.
 */
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const isDarkMode = savedTheme === "dark";
  document.documentElement.classList.toggle("dark", isDarkMode);
}

/**
 * Actualiza el texto del botón del tema.
 */
function updateThemeButton() {
  if (!themeToggleButton) return;

  const isDarkMode = document.documentElement.classList.contains("dark");
  themeToggleButton.textContent = isDarkMode
    ? "☀️ Modo claro"
    : "🌙 Modo oscuro";
}

/**
 * Devuelve las tareas filtradas según el estado y la búsqueda.
 * @returns {Array}
 */
function getFilteredTasks() {
  const searchQuery = searchInput?.value.trim().toLowerCase() ?? "";

  return tasks.filter((task) => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch = task.text.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });
}

/**
 * Elimina una tarea por su id.
 * @param {string} taskId
 */
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

/**
 * Cambia el estado completado de una tarea.
 * @param {string} taskId
 * @param {boolean} isCompleted
 */
function toggleTaskCompletion(taskId, isCompleted) {
  const taskToUpdate = tasks.find((task) => task.id === taskId);

  if (!taskToUpdate) return;

  taskToUpdate.completed = isCompleted;
  saveTasks();
  renderTasks();
}

/**
 * Crea el elemento HTML de una tarea.
 * @param {{id: string, text: string, completed: boolean}} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const listItem = document.createElement("li");
  listItem.dataset.id = task.id;
  listItem.className =
    "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900";

  const leftSection = document.createElement("div");
  leftSection.className = "flex items-center gap-3";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.className = "h-4 w-4 rounded accent-pink-500";

  const taskText = document.createElement("span");
  taskText.textContent = task.text;
  taskText.className = task.completed
    ? "text-slate-400 line-through dark:text-slate-500"
    : "text-slate-800 dark:text-slate-100";

  checkbox.addEventListener("change", () => {
    toggleTaskCompletion(task.id, checkbox.checked);
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className =
    "rounded-xl border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-pink-400/30 dark:text-pink-300 dark:hover:bg-slate-800";
  deleteButton.textContent = "Eliminar";

  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });

  leftSection.appendChild(checkbox);
  leftSection.appendChild(taskText);

  listItem.appendChild(leftSection);
  listItem.appendChild(deleteButton);

  return listItem;
}

/**
 * Renderiza las tareas visibles en pantalla.
 */
function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

/**
 * Valida el texto de una nueva tarea.
 * @param {string} text
 * @returns {boolean}
 */
function isValidTask(text) {
  const trimmedText = text.trim();
  return (
    trimmedText.length >= MIN_TASK_LENGTH &&
    trimmedText.length <= MAX_TASK_LENGTH
  );
}

/**
 * Muestra u oculta el mensaje de error del formulario.
 * @param {boolean} show
 */
function toggleTaskError(show) {
  if (!taskError) return;
  taskError.classList.toggle("hidden", !show);
}

/**
 * Añade una nueva tarea.
 * @param {string} text
 */
function addTask(text) {
  const trimmedText = text.trim();

  if (!isValidTask(trimmedText)) {
    toggleTaskError(true);
    taskInput.focus();
    return;
  }

  toggleTaskError(false);

  const newTask = {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    text: trimmedText,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

/**
 * Cambia el filtro actual y vuelve a renderizar.
 * @param {"all" | "pending" | "completed"} filter
 */
function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

/**
 * Cambia entre modo claro y oscuro.
 */
function toggleTheme() {
  document.documentElement.classList.toggle("dark");

  const isDarkMode = document.documentElement.classList.contains("dark");
  saveTheme(isDarkMode ? "dark" : "light");
  updateThemeButton();
}

if (taskForm) {
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask(taskInput.value);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderTasks);
}

if (taskInput) {
  taskInput.addEventListener("input", () => {
    const trimmedText = taskInput.value.trim();
    const hasError =
      trimmedText !== "" &&
      (trimmedText.length < MIN_TASK_LENGTH ||
        trimmedText.length > MAX_TASK_LENGTH);

    toggleTaskError(hasError);
  });
}

if (filterAllButton) {
  filterAllButton.addEventListener("click", () => setFilter("all"));
}

if (filterPendingButton) {
  filterPendingButton.addEventListener("click", () => setFilter("pending"));
}

if (filterCompletedButton) {
  filterCompletedButton.addEventListener("click", () => setFilter("completed"));
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}

loadTheme();
updateThemeButton();
loadTasks();
renderTasks();
