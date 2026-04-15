const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = ["PORT"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Falta la variable de entorno obligatoria: ${envVar}`);
  }
});

module.exports = {
  PORT: process.env.PORT,
};