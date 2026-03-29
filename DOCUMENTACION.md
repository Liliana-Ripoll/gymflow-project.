# GymFlow

GymFlow es una aplicación web para la gestión de rutinas de entrenamiento. El proyecto está dividido en dos partes principales: un frontend desarrollado con HTML, 
CSS y JavaScript, y un backend construido con Node.js y Express que expone una API REST para gestionar las tareas.

## Objetivo del proyecto

El objetivo de esta fase ha sido sustituir la persistencia local del frontend por una arquitectura cliente-servidor real, conectando la interfaz con una API 
REST desarrollada en Node.js. Además, se ha trabajado con una organización por capas, validación en la frontera de red, manejo global de errores y configuración 
mediante variables de entorno.


## Arquitectura de carpetas
La estructura del proyecto está organizada de la siguiente forma:
GYMFLOW/
├── api/
│   └── client.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   └── taskController.js
│   │   ├── data/
│   │   │   └── tasks.js
│   │   ├── middlewares/
│   │   │   └── errorMiddleware.js
│   │   ├── routes/
│   │   │   └── taskRoutes.js
│   │   └── services/
│   │       └── taskService.js
│   ├── .env
│   ├── package.lock.json
│   ├── package.json
│   └── server.js
├── .gitignore
├── app.js
├── index.html
├── input.css
├── output.css
├── styles.css
└── tailwind.config.js

## Explicación de la arquitectura
El proyecto sigue una separación clara entre frontend y backend.

Frontend: se encarga de la interfaz de usuario, la interacción con el DOM y el consumo de la API.
api/client.js: actúa como capa de red en el cliente. Centraliza las peticiones HTTP al backend mediante fetch.
Backend: implementa la lógica del servidor con una arquitectura por capas.

Dentro del backend se han separado las responsabilidades en distintas capas:
routes: definen los endpoints y los verbos HTTP.
controllers: reciben la petición, validan los datos de entrada y construyen la respuesta HTTP.
services: contienen la lógica de negocio y manipulan los datos.
middlewares: encapsulan lógica transversal como la gestión global de errores.
config: gestiona la carga y validación de variables de entorno.
data: contiene la persistencia simulada en memoria.

Esta organización facilita la mantenibilidad, la escalabilidad y la claridad del código.

## Tecnologías utilizadas
### Frontend
HTML
CSS
Tailwind CSS
JavaScript
### Backend
Node.js
Express
CORS
dotenv
Pruebas
Thunder Client


## Instalación y ejecución
1. Clonar el proyecto (git bash):
  git clone <url-del-repositorio>
  
2. Instalar dependencias del backend
Entrar en la carpeta backend e instalar dependencias (git bash):
cd backend 
npm install

4. Configurar variables de entorno
Crear un archivo .env dentro de backend con el contenido:
PORT=3000
El servidor quedará disponible en:
http://localhost:3000

5. Ejecutar el frontend
Abrir index.html con Live Server o en un entorno local compatible con módulos ES.


## Arquitectura backend por capas
### 1. Capa de enrutamiento
La capa de rutas define los endpoints de la API y delega el procesamiento a los controladores.

Ejemplo:

GET /api/v1/tasks
POST /api/v1/tasks
PATCH /api/v1/tasks/:id
DELETE /api/v1/tasks/:id

Esta capa no contiene lógica de negocio.

### 2. Capa de controladores
Los controladores actúan como intermediarios entre la red y la lógica interna de la aplicación. Sus funciones principales son:

leer req.body y req.params
validar los datos de entrada
invocar a la capa de servicios
devolver respuestas HTTP con res.json() o res.status(...).json()
propagar errores al middleware global usando next(error)

### 3. Capa de servicios
La capa de servicios contiene la lógica de negocio. En este proyecto:

obtiene la lista de tareas
crea nuevas tareas
actualiza tareas existentes
elimina tareas
lanza errores semánticos como NOT_FOUND cuando el recurso no existe

Esta capa no depende de Express, por lo que resulta más limpia y fácil de mantener.

## Middlewares utilizados
### express.json()
Este middleware transforma automáticamente el cuerpo de una petición JSON en un objeto JavaScript accesible desde req.body.

Sin este middleware, el servidor no podría leer correctamente los datos enviados en peticiones POST o PATCH.

### cors()
Este middleware habilita el intercambio de recursos entre distintos orígenes. En este proyecto es necesario para permitir la comunicación entre el frontend y el backend durante el desarrollo.

### errorMiddleware
Se ha implementado un middleware global de gestión de errores. Su función es capturar excepciones no manejadas en controladores o servicios y transformarlas en respuestas HTTP coherentes.

### Funcionamiento técnico
- Recibe cuatro parámetros: (err, req, res, next)
- Registra el error en consola mediante console.error(err)
- Comprueba el tipo de error
- Si el mensaje es NOT_FOUND, devuelve un 404 Not Found
- En cualquier otro caso devuelve un 500 Internal Server Error

### Ventajas
- Centraliza el manejo de errores
- Evita duplicar lógica en cada controlador
- Mejora la robustez de la aplicación
- Impide exponer detalles técnicos sensibles al cliente

## API REST
La API sigue un diseño REST basado en recursos, utilizando el recurso principal:
/api/v1/tasks

### Ejemplos prácticos de uso de la API
1. Obtener tareas
   GET http://localhost:3000/api/v1/tasks
RESPUESTA ESPERADA:
   [
  {
    "id": "1774643319735",
    "text": "Ir al gym",
    "completed": false,
    "createdAt": "27/3/2026"
  }
]

2. Crear una tarea
POST http://localhost:3000/api/v1/tasks
Content-Type: application/json

{
  "text": "Hacer cardio"
}
RESPUESTA ESPERADA: 
{
  "id": "1774643319735",
  "text": "Hacer cardio",
  "completed": false,
  "createdAt": "27/3/2026"
}
