# Explicación del Código Node.js paso a paso

Este código implementa un servidor HTTP básico en Node.js sin usar frameworks como Express. Vamos a desglosarlo paso a paso:

---

## 1. Importación de módulos

```typescript
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import fs from 'node:fs/promises';
import 'dotenv/config';
import createDebug from 'debug';
```

- **`createServer`**: Crea un servidor HTTP.
- **`IncomingMessage, ServerResponse`**: Tipos de TypeScript para definir las solicitudes y respuestas HTTP.
- **`resolve`**: Para manejar rutas de archivos.
- **`fs/promises`**: Acceso a operaciones de sistema de archivos de manera asíncrona.
- **`dotenv/config`**: Carga variables de entorno desde un archivo `.env`.
- **`createDebug`**: Permite registrar logs con diferentes niveles de depuración.

---

## 2. Generador de HTML

```typescript
const createHtmlString = (title: string, header: string, content?: string) => `
    <!DOCTYPE html>
    <html lang="es">
    ...
`;
```

- Función para generar una página HTML dinámica.
- Se usa para responder a las solicitudes con HTML preconstruido según la URL solicitada.

---

## 3. Controlador para solicitudes GET

```typescript
const getController = async (
    request: IncomingMessage,
    response: ServerResponse,
) => {
```

- Se obtiene la URL solicitada y se configura el directorio de archivos estáticos (`public`).
- Se establece un código de estado HTTP `200` por defecto.
- Si la URL es `/favicon.svg`, se lee el archivo desde `public/favicon.svg` y se envía como respuesta con `Content-Type: image/svg+xml`.
- Para otras rutas:
  - `/` → Página de inicio
  - `/about` → Página "Acerca de"
  - Otras rutas → Devuelven un error `404 Not Found`.

---

## 4. Controlador para solicitudes POST

```typescript
const postController = (request: IncomingMessage, response: ServerResponse) => {
    let body = '';

    request.on('data', (chunk) => {
        body += chunk.toString();
    });

    request.on('end', () => {
        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(
            JSON.stringify({
                message: 'Datos recibidos',
                data: JSON.parse(body),
            }),
        );
    });
};
```

- Captura los datos enviados en el cuerpo de la solicitud.
- Los almacena en `body` y, cuando termina la recepción (`'end'`), responde con `201 Created` y devuelve los datos en formato JSON.

---

## 5. Enrutador principal

```typescript
const appRouter = (request: IncomingMessage, response: ServerResponse) => {
    const { url, method } = request;

    if (!url) {
        response.statusCode = 404;
        response.end('Not found');
        return;
    }

    debug(method, url);

    switch (method) {
        case 'GET':
            getController(request, response);
            break;

        case 'POST':
            postController(request, response);
            break;
        default:
            response.statusCode = 405;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.end('Método no permitido');
    }
};
```

- Determina el tipo de solicitud (`GET`, `POST`, etc.).
- Redirige a los controladores adecuados (`getController` o `postController`).
- Responde con `405 Method Not Allowed` si el método no está soportado.

---

## 6. Manejador de eventos de servidor

```typescript
const listenManager = () => {
    const addr = server.address();
    if (addr === null) return;
    let bind: string;
    if (typeof addr === 'string') {
        bind = 'pipe ' + addr;
    } else {
        bind =
            addr.address === '::'
                ? `http://localhost:${addr?.port}`
                : `${addr.address}:${addr?.port}`;
    }
    console.log(`Server listening on ${bind}`);
    debug(`Servidor escuchando en ${bind}`);
};
```

- Obtiene la dirección donde está escuchando el servidor.
- Muestra un mensaje en la consola y lo registra con `debug`.

---

## 7. Creación del servidor y manejo de errores

```typescript
const debug = createDebug('app:server');
const PORT = process.env.PORT || 3000;

const server = createServer(appRouter);
server.listen(PORT);
server.on('listening', listenManager);
server.on('error', (error) => {
    console.error(error);
    debug(error);
});
```

- Se define el puerto (`PORT`) desde una variable de entorno o `3000` por defecto.
- Se crea el servidor con `createServer(appRouter)`.
- Se inician los listeners para manejar:
  - **Inicio del servidor** → `server.on('listening', listenManager);`
  - **Errores** → `server.on('error', (error) => { ... });`

---

## Resumen

1. Se crea un servidor HTTP con Node.js.
2. Soporta:
   - **GET** (devuelve páginas HTML).
   - **POST** (recibe datos en JSON y los devuelve).
   - Rutas no encontradas → `404 Not Found`.
   - Métodos no permitidos → `405 Method Not Allowed`.
3. Usa `debug` para registrar información de depuración.
4. Maneja errores y logs correctamente.

Es un código limpio y eficiente para un servidor básico sin usar Express.

