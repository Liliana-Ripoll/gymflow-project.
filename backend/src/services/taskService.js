const tasks = require("../data/tasks");

const getAllTasks = () => tasks;

const createTask = (taskData) => {
  const newTask = {
    id: Date.now().toString(),
    ...taskData,
  };

  tasks.push(newTask);
  return newTask;
};

const deleteTask = (id) => {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    throw new Error("NOT_FOUND");
  }

  return tasks.splice(index, 1)[0];
};

const updateTask = (id, data) => {
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    throw new Error("NOT_FOUND");
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...data,
  };

  return tasks[taskIndex];
};

module.exports = {
  getAllTasks,
  createTask,
  deleteTask,
  updateTask,
};