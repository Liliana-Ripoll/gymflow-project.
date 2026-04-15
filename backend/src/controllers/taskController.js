const taskService = require("../services/taskService");

const getTasks = (req, res) => {
  const tasks = taskService.getAllTasks();
  res.json(tasks);
};

const createTask = (req, res) => {
  const { text, completed, createdAt } = req.body;

  if (!text || text.trim().length < 3) {
    return res.status(400).json({
      message: "La tarea debe tener al menos 3 caracteres"
    });
  }

  const newTask = taskService.createTask({
    text,
    completed: completed ?? false,
    createdAt: createdAt || new Date().toLocaleDateString("es-ES"),
  });

  res.status(201).json(newTask);
};

const deleteTask = (req, res, next) => {
  try {
    taskService.deleteTask(req.params.id);
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

const updateTask = (req, res, next) => {
  const { text, completed } = req.body;

  if (text !== undefined) {
    if (typeof text !== "string" || text.trim().length < 3) {
      return res.status(400).json({
        message: "El texto debe tener al menos 3 caracteres"
      });
    }
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "El campo completed debe ser true o false"
      });
    }
  }

  try {
    const updatedTask = taskService.updateTask(req.params.id, req.body);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
};