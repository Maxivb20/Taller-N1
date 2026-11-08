# Guía de demostración y defensa técnica — Hito 3

Apunte práctico para presentar la aplicación en vivo y responder las preguntas individuales del profesor.

---

## 1. Guion para la demostración en vivo (7–8 minutos)

El enunciado pide demostrar 7 puntos obligatorios (§8). Siguiendo este recorrido se muestran todos en orden:

1. **Docker Compose y Swagger**:
   - Mostrar que los contenedores están corriendo (`docker compose ps`).
   - Abrir `http://localhost:4000/api/docs` (Swagger) y probar el endpoint `GET /api/health` o `GET /api/socios` con **"Try it out" → "Execute"**.
2. **Flujo completo persistido en PostgreSQL**:
   - En `http://localhost:5173`, entrar a **Socios (`/socios`) → "Nuevo socio"**. Intentar guardar vacío primero para mostrar la validación, y luego registrar un socio nuevo.
   - Ir a **Membresías (`/membresias`) → "Nueva membresía"**, asignarle un plan al socio recién creado y guardar. Comentar que el backend crea en una misma transacción SQL la membresía y su pago pendiente con comprobante.
   - Ir a **Pagos (`/pagos`)**, abrir el ícono del comprobante (<i class="bi bi-receipt"></i>) y luego marcar el pago como **Pagado**.
   - **Recargar la página (F5)** para demostrar que todo sigue ahí porque viene de PostgreSQL.
3. **Regla de negocio y caso de validación/error (Control de cupos y vigencia)**:
   - Ir a **Inscripciones (`/inscripciones`) → "Inscribir socio"**.
   - Elegir a **Valentina Soto (`S003`)**, que tiene su membresía vencida, e intentar inscribirla en una clase → el backend devuelve error `422` y bloquea la inscripción.
   - Luego inscribir a un socio activo (como Camila Reyes) y mostrar cómo sube el contador de cupos ocupados.
4. **Funcionalidad en MongoDB (Check-in QR y Bitácora)**:
   - Ir a **Check-in QR (`/qr`)**. Probar con un socio activo (`Camila`) → da bienvenida y guarda el ingreso en MongoDB (`access_logs`).
   - Probar con un socio vencido (`Valentina`) → deniega el acceso (`422`), pero también guarda el intento fallido en MongoDB.
   - Ir a **Bitácora (`/bitacora`)**, mostrar las pestañas de eventos y accesos, y abrir el botón `{ }` de una fila para ver el documento JSON guardado en MongoDB.

---

## 2. Preguntas frecuentes para la defensa individual

**¿Cómo se conecta React con el backend ahora que no usan `localStorage`?**
En `src/services/apiClient.js` centralizamos las llamadas `fetch` apuntando a `http://localhost:4000/api`. Al abrir la app, `ClubContext.jsx` pide los datos iniciales a `GET /api/bootstrap` y cada acción (crear socio, renovar membresía, inscribir, hacer check-in) hace una petición `POST`, `PUT`, `PATCH` o `DELETE` al servidor y actualiza el estado con la respuesta.

**¿Por qué tienen PostgreSQL y MongoDB a la vez?**
En **PostgreSQL** guardamos los datos estructurados del club que tienen relaciones entre sí y necesitan transacciones (socios, instructores, planes, actividades, membresías, inscripciones y pagos). En **MongoDB** guardamos los registros de entrada del lector QR (`access_logs`, incluyendo rechazos) y la bitácora de actividad (`audit_events`), que son eventos históricos donde cada documento puede tener campos distintos en `payload` o `metadata`.

**¿Dónde se aplica una transacción en PostgreSQL?**
En `backend/src/services/clubService.js`, dentro de `crearMembresia` y `renovarMembresiaPorId`. Usamos `BEGIN`, insertamos la membresía, insertamos el pago pendiente con su número de comprobante y cerramos con `COMMIT` (o `ROLLBACK` si algo falla), para que nunca quede una membresía creada sin su cobro asociado.

**¿Cómo validan los datos y manejan los errores en el backend?**
En `backend/src/schemas/validators.js` validamos cada cuerpo de petición antes de consultar la base de datos. Si falta un dato o es inválido, lanzamos `AppError` con código `400`. Si se infringe una regla de negocio (como inscribir a un socio con membresía vencida o en una actividad sin cupo), respondemos `422` o `409`. Todo pasa por el middleware `errorHandler.js` para devolver siempre un JSON limpio sin exponer errores internos del motor de base de datos.

**¿Cómo funciona la API pública de clima?**
Se consulta **Open-Meteo** desde el frontend (`src/services/weatherApi.js` y `src/hooks/useWeather.js`) para mostrar el clima de Viña del Mar en el Dashboard. Sirve para saber si las clases marcadas como *Exterior* (*Funcional HIIT* y *Yoga*) se pueden hacer al aire libre. Maneja los estados de carga, éxito y error con botón para reintentar.
