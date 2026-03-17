(() => {
  const dom = {
    taskForm: document.querySelector("#taskForm"),
    taskInput: document.querySelector("#taskInput"),
    taskError: document.querySelector("#taskError"),
    taskList: document.querySelector("#taskList"),
    taskCounter: document.querySelector("#taskCounter"),
    searchInput: document.querySelector("#searchInput"),
    sortTasks: document.querySelector("#sortTasks"),
    themeToggleButton: document.querySelector("#themeToggle"),
    filterAllButton: document.querySelector("#filterAll"),
    filterPendingButton: document.querySelector("#filterPending"),
    filterCompletedButton: document.querySelector("#filterCompleted"),
  };

  const STORAGE_KEY = "gymflow_tasks";
  const THEME_KEY = "gymflow_theme";
  const MIN_TASK_LENGTH = 3;
  const MAX_TASK_LENGTH = 60;

  /** @type {{ id: string, text: string, completed: boolean, createdAt: string }[]} */
  let tasks = [];
  /** @type {"all" | "pending" | "completed"} */
  let currentFilter = "all";

  /**
   * Guarda las tareas en localStorage.
   */
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /**
   * Convierte JSON de forma segura.
   * @param {string | null} value
   * @param {Array} fallback
   * @returns {Array}
   */
  function safeJsonParse(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  /**
   * Carga las tareas guardadas desde localStorage.
   */
  function loadTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    const parsedTasks = safeJsonParse(savedTasks, []);

    tasks = parsedTasks.map((task) => ({
      id: task.id,
      text: task.text,
      completed: Boolean(task.completed),
      createdAt: task.createdAt || new Date().toLocaleDateString("es-ES"),
    }));
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
    if (!dom.themeToggleButton) return;

    const isDarkMode = document.documentElement.classList.contains("dark");
    dom.themeToggleButton.textContent = isDarkMode
      ? "☀️ Modo claro"
      : "🌙 Modo oscuro";
  }

  /**
   * Devuelve las tareas filtradas, buscadas y ordenadas.
   * @returns {Array}
   */
  function getFilteredTasks() {
    const searchQuery = dom.searchInput?.value.trim().toLowerCase() ?? "";
    const sortValue = dom.sortTasks?.value ?? "default";

    let filteredTasks = tasks.filter((task) => {
      const matchesFilter =
        currentFilter === "all" ||
        (currentFilter === "pending" && !task.completed) ||
        (currentFilter === "completed" && task.completed);

      const matchesSearch = task.text.toLowerCase().includes(searchQuery);

      return matchesFilter && matchesSearch;
    });

    if (sortValue === "az") {
      filteredTasks = [...filteredTasks].sort((a, b) =>
        a.text.localeCompare(b.text, "es", { sensitivity: "base" })
      );
    }

    if (sortValue === "za") {
      filteredTasks = [...filteredTasks].sort((a, b) =>
        b.text.localeCompare(a.text, "es", { sensitivity: "base" })
      );
    }

    return filteredTasks;
  }

  /**
   * Actualiza el contador de tareas.
   */
  function updateTaskCounter() {
    if (!dom.taskCounter) return;

    dom.taskCounter.textContent = `Total de tareas: ${tasks.length}`;
  }

  /**
   * Elimina una tarea por su id.
   * @param {string} taskId
   */
  function deleteTask(taskId) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta tarea?");
    if (!confirmed) return;

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
   * Edita el texto de una tarea.
   * @param {string} taskId
   */
  function editTask(taskId) {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (!taskToEdit) return;

    const newText = window.prompt("Editar tarea:", taskToEdit.text);
    if (newText === null) return;

    const trimmedText = newText.trim();

    if (!isValidTask(trimmedText)) {
      window.alert("La tarea debe tener entre 3 y 60 caracteres.");
      return;
    }

    taskToEdit.text = trimmedText;
    saveTasks();
    renderTasks();
  }

  /**
   * Aplica estilos al texto según el estado.
   * @param {HTMLElement} textElement
   * @param {boolean} isCompleted
   */
  function applyTaskTextStyle(textElement, isCompleted) {
    textElement.className = isCompleted
      ? "font-medium text-slate-400 line-through dark:text-slate-500"
      : "font-medium text-slate-800 dark:text-slate-100";
  }

  /**
   * Crea el elemento HTML de una tarea.
   * @param {{id: string, text: string, completed: boolean, createdAt: string}} task
   * @returns {HTMLLIElement}
   */
  function createTaskElement(task) {
    const listItem = document.createElement("li");
    listItem.dataset.id = task.id;
    listItem.className =
      "rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900";

    const contentWrapper = document.createElement("div");
    contentWrapper.className =
      "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between";

    const leftSection = document.createElement("div");
    leftSection.className = "flex items-start gap-3";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "mt-1 h-4 w-4 rounded accent-pink-500";

    const textGroup = document.createElement("div");
    textGroup.className = "flex flex-col gap-1";

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    applyTaskTextStyle(taskText, task.completed);

    const taskDate = document.createElement("span");
    taskDate.className = "text-xs text-slate-500 dark:text-slate-400";
    taskDate.textContent = `Creada: ${task.createdAt}`;

    checkbox.addEventListener("change", () => {
      toggleTaskCompletion(task.id, checkbox.checked);
    });

    textGroup.appendChild(taskText);
    textGroup.appendChild(taskDate);

    leftSection.appendChild(checkbox);
    leftSection.appendChild(textGroup);

    const actions = document.createElement("div");
    actions.className = "flex flex-wrap gap-2";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className =
      "rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";
    editButton.textContent = "Editar";

    editButton.addEventListener("click", () => {
      editTask(task.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
      "rounded-xl border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-pink-400/30 dark:text-pink-300 dark:hover:bg-slate-800";
    deleteButton.textContent = "Eliminar";

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    contentWrapper.appendChild(leftSection);
    contentWrapper.appendChild(actions);
    listItem.appendChild(contentWrapper);

    return listItem;
  }

  /**
   * Renderiza las tareas visibles en pantalla.
   */
  function renderTasks() {
    if (!dom.taskList) return;

    dom.taskList.innerHTML = "";
    const visibleTasks = getFilteredTasks();

    const fragment = document.createDocumentFragment();

    visibleTasks.forEach((task) => {
      fragment.appendChild(createTaskElement(task));
    });

    dom.taskList.appendChild(fragment);
    updateTaskCounter();
  }

  /**
   * Valida el texto de una tarea.
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
    if (!dom.taskError) return;
    dom.taskError.classList.toggle("hidden", !show);
  }

  /**
   * Genera un id único para cada tarea.
   * @returns {string}
   */
  function generateTaskId() {
    return (
      crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }

  /**
   * Añade una nueva tarea.
   * @param {string} text
   */
  function addTask(text) {
    const trimmedText = text.trim();

    if (!isValidTask(trimmedText)) {
      toggleTaskError(true);
      dom.taskInput?.focus();
      return;
    }

    toggleTaskError(false);

    const newTask = {
      id: generateTaskId(),
      text: trimmedText,
      completed: false,
      createdAt: new Date().toLocaleDateString("es-ES"),
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    if (dom.taskInput) {
      dom.taskInput.value = "";
      dom.taskInput.focus();
    }
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

  if (dom.taskForm) {
    dom.taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addTask(dom.taskInput?.value ?? "");
    });
  }

  if (dom.searchInput) {
    dom.searchInput.addEventListener("input", renderTasks);
  }

  if (dom.sortTasks) {
    dom.sortTasks.addEventListener("change", renderTasks);
  }

  if (dom.taskInput) {
    dom.taskInput.addEventListener("input", () => {
      const trimmedText = dom.taskInput.value.trim();
      const hasError =
        trimmedText !== "" &&
        (trimmedText.length < MIN_TASK_LENGTH ||
          trimmedText.length > MAX_TASK_LENGTH);

      toggleTaskError(hasError);
    });
  }

  const filterButtons = [
    { el: dom.filterAllButton, filter: "all" },
    { el: dom.filterPendingButton, filter: "pending" },
    { el: dom.filterCompletedButton, filter: "completed" },
  ];

  filterButtons.forEach(({ el, filter }) => {
    if (!el) return;
    el.addEventListener("click", () => setFilter(filter));
  });

  if (dom.themeToggleButton) {
    dom.themeToggleButton.addEventListener("click", toggleTheme);
  }

  loadTheme();
  updateThemeButton();
  loadTasks();
  renderTasks();
})();