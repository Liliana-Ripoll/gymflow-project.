const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("input[type='search']");
const toggleButton = document.querySelector("#themeToggle");

const STORAGE_KEY = "gymflow_tasks";
const THEME_KEY = "gymflow_theme";
let tasks = [];

/* Guardar tareas en LocalStorage */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* Cargar tareas del LocalStorage */
function loadTasks() {
  const stored = localStorage.getItem(STORAGE_KEY);
  tasks = stored ? JSON.parse(stored) : [];
}

/* Guardar tema */
function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/* Cargar tema guardado */
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/* Cambiar texto del botón según el tema */
function updateThemeButton() {
  if (!toggleButton) return;

  const isDark = document.documentElement.classList.contains("dark");
  toggleButton.textContent = isDark ? "☀️ Modo claro" : "🌙 Modo oscuro";
}

/* Pintar una tarea en el DOM */
function renderTask(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.className =
    "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900";

  const span = document.createElement("span");
  span.className = "text-slate-800 dark:text-slate-100";
  span.textContent = task.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className =
    "rounded-xl border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-pink-400/30 dark:text-pink-300 dark:hover:bg-slate-800";
  deleteBtn.textContent = "Eliminar";

  deleteBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => t.id !== task.id);
    saveTasks();
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

/* Añadir tarea */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const task = {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    text: trimmed,
  };

  tasks.push(task);
  saveTasks();
  renderTask(task);

  taskInput.value = "";
  taskInput.focus();
}

/* Evento del formulario */
if (taskForm) {
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTask(taskInput.value);
  });
}

/* Buscador */
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const taskElements = document.querySelectorAll("#taskList li");

    taskElements.forEach((task) => {
      const text = task.textContent.toLowerCase();

      if (text.includes(query)) {
        task.style.display = "flex";
      } else {
        task.style.display = "none";
      }
    });
  });
}

/* Botón modo oscuro */
if (toggleButton) {
  toggleButton.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");

    const isDark = document.documentElement.classList.contains("dark");
    saveTheme(isDark ? "dark" : "light");
    updateThemeButton();
  });
}

/* Al iniciar */
loadTheme();
updateThemeButton();
loadTasks();
tasks.forEach(renderTask);