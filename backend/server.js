const express = require("express");
const cors = require("cors");
const taskRoutes = require("./src/routes/taskRoutes");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const { PORT } = require("./src/config/env");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.use("/api/v1/tasks", taskRoutes);

// 👉 Middleware de errores SIEMPRE antes del listen
app.use(errorMiddleware);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});