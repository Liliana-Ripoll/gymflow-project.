import {
  fetchTasks as fetchTasksApi,
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  updateTask as updateTaskApi,
} from "./api/client.js";

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
    programLinks: document.querySelectorAll(".program-link"),
    routineTitle: document.querySelector("#routineTitle"),
    routineList: document.querySelector("#routineList"),
    calendarToggleButton: document.querySelector("#calendarToggle"),
    calendarModal: document.querySelector("#calendarModal"),
    closeCalendarButton: document.querySelector("#closeCalendar"),
  };

  const MIN_TASK_LENGTH = 3;
  const MAX_TASK_LENGTH = 60;

  let tasks = [];
  let currentFilter = "all";
  let currentProgram = "fuerza";
  let isLoading = false;
  let networkErrorMessage = "";

  const routinesByProgram = {
    fuerza: [
      {
        name: "Sentadillas",
        category: "Pierna",
        level: "Alta",
        detail: "4x10",
        description: "Descanso: 90s · Técnica controlada",
      },
      {
        name: "Peso muerto rumano",
        category: "Fuerza",
        level: "Media",
        detail: "4x12",
        description: "Descanso: 60–90s · Mantén espalda neutra",
      },
      {
        name: "Press militar",
        category: "Hombro",
        level: "Media",
        detail: "3x10",
        description: "Descanso: 60s · Controla la bajada",
      },
    ],
    cardio: [
      {
        name: "Cinta (intervalos)",
        category: "Cardio",
        level: "Suave",
        detail: "20 min",
        description: "5 min rápido + 10 min suave (x3)",
      },
      {
        name: "Bicicleta estática",
        category: "Cardio",
        level: "Media",
        detail: "25 min",
        description: "Ritmo constante con resistencia moderada",
      },
      {
        name: "Elíptica",
        category: "Resistencia",
        level: "Media",
        detail: "15 min",
        description: "Mantén un ritmo cómodo y continuo",
      },
    ],
    movilidad: [
      {
        name: "Movilidad de cadera",
        category: "Movilidad",
        level: "Suave",
        detail: "10 min",
        description: "Aperturas y rotaciones controladas",
      },
      {
        name: "Movilidad de hombros",
        category: "Movilidad",
        level: "Suave",
        detail: "8 min",
        description: "Círculos y estiramientos suaves",
      },
      {
        name: "Estiramiento de espalda",
        category: "Recuperación",
        level: "Suave",
        detail: "12 min",
        description: "Respiración profunda y control postural",
      },
    ],
    fullbody: [
      {
        name: "Burpees",
        category: "Full Body",
        level: "Alta",
        detail: "3x12",
        description: "Explosividad y control del ritmo",
      },
      {
        name: "Zancadas con mancuernas",
        category: "Full Body",
        level: "Media",
        detail: "3x10",
        description: "Alterna pierna derecha e izquierda",
      },
      {
        name: "Plancha con toque de hombro",
        category: "Core",
        level: "Media",
        detail: "3x30s",
        description: "Activa abdomen y evita balanceo",
      },
    ],
  };

  function setLoading(value) {
    isLoading = value;
    renderTasks();
  }

  function setNetworkError(message = "") {
    networkErrorMessage = message;
    renderTasks();
  }

  function updateThemeButton() {
    if (!dom.themeToggleButton) return;

    const isDarkMode = document.documentElement.classList.contains("dark");
    dom.themeToggleButton.textContent = isDarkMode
      ? "☀️ Modo claro"
      : "🌙 Modo oscuro";
  }

  function loadTheme() {
    updateThemeButton();
  }

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    updateThemeButton();
  }

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

  function updateTaskCounter() {
    if (!dom.taskCounter) return;
    dom.taskCounter.textContent = `Total de tareas: ${tasks.length}`;
  }

  function isValidTask(text) {
    const trimmedText = text.trim();
    return (
      trimmedText.length >= MIN_TASK_LENGTH &&
      trimmedText.length <= MAX_TASK_LENGTH
    );
  }

  function toggleTaskError(show) {
    if (!dom.taskError) return;
    dom.taskError.classList.toggle("hidden", !show);
  }

  async function loadTasks() {
    try {
      setLoading(true);
      setNetworkError("");

      const data = await fetchTasksApi();
      tasks = data;

      renderTasks();
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      setNetworkError("No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }

  async function addTask(text) {
    const trimmedText = text.trim();

    if (!isValidTask(trimmedText)) {
      toggleTaskError(true);
      dom.taskInput?.focus();
      return;
    }

    toggleTaskError(false);
    setNetworkError("");

    const newTask = {
      text: trimmedText,
      completed: false,
      createdAt: new Date().toLocaleDateString("es-ES"),
    };

    try {
      setLoading(true);
      const createdTask = await createTaskApi(newTask);
      tasks.push(createdTask);
      renderTasks();

      if (dom.taskInput) {
        dom.taskInput.value = "";
        dom.taskInput.focus();
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setNetworkError("No se pudo crear la tarea.");
    } finally {
      setLoading(false);
    }
  }

  async function removeTask(taskId) {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta tarea?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setNetworkError("");

      await deleteTaskApi(taskId);
      tasks = tasks.filter((task) => task.id !== taskId);
      renderTasks();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      setNetworkError("No se pudo eliminar la tarea.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTaskCompletion(taskId, isCompleted) {
    try {
      setLoading(true);
      setNetworkError("");

      const updatedTask = await updateTaskApi(taskId, { completed: isCompleted });

      tasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      );

      renderTasks();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      setNetworkError("No se pudo actualizar el estado de la tarea.");
    } finally {
      setLoading(false);
    }
  }

  async function editTask(taskId) {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (!taskToEdit) return;

    const newText = window.prompt("Editar tarea:", taskToEdit.text);
    if (newText === null) return;

    const trimmedText = newText.trim();

    if (!isValidTask(trimmedText)) {
      window.alert("La tarea debe tener entre 3 y 60 caracteres.");
      return;
    }

    try {
      setLoading(true);
      setNetworkError("");

      const updatedTask = await updateTaskApi(taskId, { text: trimmedText });

      tasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      );

      renderTasks();
    } catch (error) {
      console.error("Error al editar tarea:", error);
      setNetworkError("No se pudo editar la tarea.");
    } finally {
      setLoading(false);
    }
  }

  function applyTaskTextStyle(textElement, isCompleted) {
    textElement.className = isCompleted
      ? "font-medium text-slate-400 line-through dark:text-slate-500"
      : "font-medium text-slate-800 dark:text-slate-100";
  }

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
    checkbox.disabled = isLoading;

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
    editButton.disabled = isLoading;

    editButton.addEventListener("click", () => {
      editTask(task.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className =
      "rounded-xl border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50 dark:border-pink-400/30 dark:text-pink-300 dark:hover:bg-slate-800";
    deleteButton.textContent = "Eliminar";
    deleteButton.disabled = isLoading;

    deleteButton.addEventListener("click", () => {
      removeTask(task.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    contentWrapper.appendChild(leftSection);
    contentWrapper.appendChild(actions);
    listItem.appendChild(contentWrapper);

    return listItem;
  }

  function createRoutineElement(routine) {
    const article = document.createElement("article");
    article.className =
      "rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950";

    article.innerHTML = `
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            class="h-4 w-4 cursor-pointer accent-pink-500 transition-all duration-200 focus:ring-2 focus:ring-pink-500"
          />
          <p class="font-medium">${routine.name}</p>
        </div>

        <div class="flex flex-wrap gap-2 text-xs">
          <span class="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">${routine.category}</span>
          <span class="rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-1">${routine.level}</span>
          <span class="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">${routine.detail}</span>
        </div>
      </div>

      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        ${routine.description}
      </p>
    `;

    return article;
  }

  function renderRoutines() {
    if (!dom.routineList || !dom.routineTitle) return;

    const routines = routinesByProgram[currentProgram] ?? [];
    const titles = {
      fuerza: "Rutinas de Fuerza",
      cardio: "Rutinas de Cardio",
      movilidad: "Rutinas de Movilidad",
      fullbody: "Rutinas de Full Body",
    };

    dom.routineTitle.textContent = titles[currentProgram];
    dom.routineList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    routines.forEach((routine) => {
      fragment.appendChild(createRoutineElement(routine));
    });

    dom.routineList.appendChild(fragment);
  }

  function updateActiveProgram(selectedProgram) {
    dom.programLinks.forEach((link) => {
      const isActive = link.dataset.program === selectedProgram;

      if (isActive) {
        link.className =
          "program-link flex items-center justify-between rounded-xl border border-pink-500/40 bg-pink-500/10 px-3 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm";
      } else {
        link.className =
          "program-link flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800";
      }
    });
  }

  function setProgram(program) {
    currentProgram = program;
    updateActiveProgram(program);
    renderRoutines();
  }

  function renderTasks() {
    if (!dom.taskList) return;

    dom.taskList.innerHTML = "";

    if (isLoading) {
      const loadingItem = document.createElement("li");
      loadingItem.className =
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
      loadingItem.textContent = "Cargando tareas...";
      dom.taskList.appendChild(loadingItem);
      updateTaskCounter();
      return;
    }

    if (networkErrorMessage) {
      const errorItem = document.createElement("li");
      errorItem.className =
        "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-400/30 dark:bg-slate-900 dark:text-red-300";
      errorItem.textContent = networkErrorMessage;
      dom.taskList.appendChild(errorItem);
      updateTaskCounter();
      return;
    }

    const visibleTasks = getFilteredTasks();

    if (visibleTasks.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className =
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
      emptyItem.textContent = "No hay tareas disponibles.";
      dom.taskList.appendChild(emptyItem);
      updateTaskCounter();
      return;
    }

    const fragment = document.createDocumentFragment();

    visibleTasks.forEach((task) => {
      fragment.appendChild(createTaskElement(task));
    });

    dom.taskList.appendChild(fragment);
    updateTaskCounter();
  }

  function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
  }

  function openCalendar() {
    if (!dom.calendarModal) return;
    dom.calendarModal.classList.remove("hidden");
    dom.calendarModal.classList.add("flex");
  }

  function closeCalendar() {
    if (!dom.calendarModal) return;
    dom.calendarModal.classList.add("hidden");
    dom.calendarModal.classList.remove("flex");
  }

  if (dom.taskForm) {
    dom.taskForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await addTask(dom.taskInput?.value ?? "");
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

  dom.programLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const selectedProgram = link.dataset.program;
      setProgram(selectedProgram);
    });
  });

  if (dom.calendarToggleButton) {
    dom.calendarToggleButton.addEventListener("click", openCalendar);
  }

  if (dom.closeCalendarButton) {
    dom.closeCalendarButton.addEventListener("click", closeCalendar);
  }

  if (dom.calendarModal) {
    dom.calendarModal.addEventListener("click", (event) => {
      if (event.target === dom.calendarModal) {
        closeCalendar();
      }
    });
  }

  loadTheme();
  renderRoutines();
  loadTasks();
})();