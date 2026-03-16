# Experimentos con IA

En este documento se documentan diferentes pruebas realizadas utilizando herramientas de inteligencia artificial para mejorar el proyecto.
Se describen los cambios realizados, los resultados obtenidos y las conclusiones de cada experimento.

## Experimentos realizados con IA

Durante el desarrollo del proyecto GymFlow he realizado varias pruebas utilizando herramientas de inteligencia artificial para mejorar diferentes partes del proyecto. Estas pruebas me han ayudado a entender mejor cómo la IA puede ayudar durante el proceso de programación.

### Experimento 1: Mejora del diseño de la interfaz
Uno de los primeros experimentos fue utilizar IA para obtener ideas sobre cómo organizar mejor la interfaz de la aplicación. Gracias a esto pude mejorar la estructura de la página, organizando mejor los elementos como el header y el contenido principal.

### Experimento 2: Uso de Tailwind CSS
También utilicé la IA para probar diferentes clases de Tailwind CSS que me ayudaran a mejorar el diseño visual de la aplicación. Esto me permitió conseguir un diseño más limpio, moderno y mejor organizado.

### Experimento 3: Mejora del código
En algunos momentos también utilicé la IA para revisar partes del código y ver si se podían mejorar. Esto me ayudó a simplificar algunas partes y entender mejor cómo organizar el código.

## Refactorización del proyecto con ayuda de IA

En esta fase se utilizó inteligencia artificial para revisar el código del proyecto GymFlow y detectar posibles mejoras. El objetivo fue hacer el código más claro, más organizado y más fácil de mantener.

### Mejora de funciones

Se revisaron varias funciones del archivo `app.js` y se refactorizaron para mejorar su estructura y hacer el código más limpio. Algunas de las funciones que se revisaron fueron:

- `loadTheme()`
- `updateThemeButton()`
- `getFilteredTasks()`
- `renderTasks()`
- `addTask()`

En varios casos se simplificó la lógica de las funciones y se reorganizó el código para que fuera más fácil de entender.

### Mejora de nombres de variables

También se revisaron algunos nombres de variables para que fueran más claros y descriptivos. Por ejemplo:

- `toggleButton` se cambió a `themeToggleButton`
- `deleteBtn` se cambió a `deleteButton`
- `leftSide` se cambió a `leftSection`

Esto ayuda a que el código sea más fácil de leer y entender.

### Validación del formulario

Se añadieron validaciones adicionales al formulario de tareas. Ahora el sistema comprueba que la tarea tenga un número mínimo de caracteres y muestra un mensaje de error si el texto no es válido.

### Simplificación del código

Algunas partes del código se reorganizaron para evitar repetir lógica. Por ejemplo, se separó la creación del elemento de cada tarea en una función llamada `createTaskElement()`, lo que hace que la función `renderTasks()` sea más sencilla.

### Comentarios en el código

También se añadieron comentarios en formato JSDoc en varias funciones para explicar mejor qué hace cada una y qué parámetros utilizan.

### Revisión final

Aunque se utilizó IA para proponer mejoras, todo el código fue revisado manualmente antes de aplicarlo al proyecto para asegurar que funcionaba correctamente.



## Conexión de servidores MCP

### Instalación del servidor MCP

Para permitir que la inteligencia artificial acceda al contexto del proyecto se configuró un servidor MCP en Cursor.

Primero se accedió al archivo de configuración ubicado en:

C:\Users\lili\.cursor\mcp.json

Después se añadió un servidor MCP de tipo filesystem que permite a la IA acceder a los archivos del proyecto.

Configuración utilizada:

{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:/Users/lili/Desktop/PROYYP"
      ]
    }
  }
}

Una vez guardado el archivo se reinició Cursor para aplicar los cambios.

### Pruebas realizadas

Después de la instalación se realizaron varias consultas a la IA:

- Buscar funciones largas en el archivo "app.js"
- Analizar la estructura del proyecto
- Refactorizar el código JavaScript
- Revisar validaciones del formulario
- Detectar posibles mejoras en el código

La IA pudo acceder correctamente a los archivos del proyecto gracias al servidor MCP.

### Utilidad de MCP en proyectos reales

El protocolo MCP permite que la IA acceda directamente al contexto del proyecto. Esto puede ser útil para analizar código, detectar errores, refactorizar funciones o entender la estructura de un proyecto. En proyectos reales ayuda a mejorar la productividad del desarrollo y facilita el trabajo con inteligencia artificial como asistente de programación.
