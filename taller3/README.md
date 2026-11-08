# ClubTrack — Plataforma Web Full Stack (Hito 3)

Aplicación web para la gestión de un club deportivo o gimnasio. Permite administrar socios, instructores, planes, membresías, actividades, inscripciones con control de cupos, pagos con comprobantes y asistencia (manual y por código QR).

Este proyecto corresponde al **Hito 3** de **Desarrollo Web y Móvil** y es la continuación directa del prototipo React realizado en el Taller Evaluado N°2, incorporando ahora un backend propio con API REST, base de datos relacional (**PostgreSQL**) y base de datos documental (**MongoDB**).

---

## Problemática y usuarios objetivo

Muchos clubes y gimnasios pequeños llevan su control en planillas sueltas o cuadernos. Eso dificulta saber rápido quién tiene la membresía al día, provoca sobrecupo en las clases, hace perder seguimiento de los pagos pendientes y demora el ingreso en recepción.

**ClubTrack** centraliza la operación en una sola plataforma y suma un lector de check-in con QR para agilizar la entrada.

- **Administrador**: configura planes, actividades e instructores, revisa métricas en el Dashboard, controla pagos/morosidad y consulta la bitácora de actividad.
- **Recepción / Staff**: registra socios, inscribe alumnos verificando que queden cupos, confirma pagos pendientes y valida los ingresos diarios por QR o de forma manual.

---

## Continuidad con el Taller 2 y mejoras en el Hito 3

Se mantuvo el mismo caso, identidad visual (*"pizarra de marcador"*) y estructura de componentes de React del Taller 2, reemplazando los datos simulados en `localStorage` por persistencia real en servidor y ampliando el alcance del sistema:

1. **Eliminación de datos locales**: el frontend ya no lee `iniciales.json` ni guarda en `localStorage`; todas las vistas consumen nuestra API REST mediante `fetch` (`src/services/apiClient.js`).
2. **Perfiles de Instructores (`/instructores`)**: se incorporó el CRUD de entrenadores/organizadores con su especialidad, contacto y actividades asignadas.
3. **Inscripciones y control de cupos (`/inscripciones`)**: permite inscribir socios en actividades validando en el backend que el socio tenga membresía vigente, que no esté inscrito dos veces y que no se supere el cupo máximo de la clase.
4. **Comprobantes de pago (`/pagos`)**: cada cobro o renovación genera automáticamente un folio de comprobante único (`BOL-2026-XXXX`) que se puede revisar en pantalla.
5. **Registro de accesos y bitácora en MongoDB (`/bitacora` y `/asistencia`)**: además de los check-in válidos, ahora quedan guardados en MongoDB los intentos de ingreso rechazados (por ejemplo, cuando un socio con membresía vencida pasa su QR) junto con la bitácora de eventos del sistema.

---

## Arquitectura del sistema

```
React Web (Vite) ── HTTP / JSON ──► Backend API REST (Node.js + Express)
                                              │
                                ┌─────────────┴─────────────┐
                                ▼                           ▼
                          PostgreSQL                     MongoDB
                     (Datos relacionales)        (Logs de acceso y bitácora)
```

| Componente | Responsabilidad |
| ---------- | --------------- |
| **Frontend (React + Vite)** | Interfaz de usuario, rutas con React Router, formularios y manejo de estados de carga/error. |
| **Backend (Node.js + Express)** | Reglas de negocio, validaciones de datos, coordinación entre bases de datos y respuestas HTTP. |
| **PostgreSQL** | Datos transaccionales y relacionales: socios, instructores, planes, actividades, membresías, inscripciones y pagos. |
| **MongoDB** | Colecciones documentales: historial de check-in (`access_logs`) y bitácora de eventos (`audit_events`). |
| **Swagger / OpenAPI** | Documentación interactiva para explorar y probar los endpoints en `/api/docs`. |
| **Docker Compose** | Levanta las dos bases de datos, el backend y el frontend de forma reproducible. |

---

## Tecnologías utilizadas

- **Frontend**: React 19, Vite 8, React Router DOM 7, Bootstrap 5.3 + Bootstrap Icons, Chart.js (`react-chartjs-2`), `qrcode.react`.
- **Backend**: Node.js 22, Express 4, `pg` (PostgreSQL), `mongoose` (MongoDB), `swagger-ui-express`, `cors`, `dotenv`.
- **Bases de datos**: PostgreSQL 16 y MongoDB 7.
- **API pública complementaria**: Open-Meteo API (clima del campus en Viña del Mar).

---

## Modelo de datos: SQL y NoSQL

### 1. Base de datos relacional — PostgreSQL (`backend/src/db/schema.sql`)

Se utilizan 7 tablas relacionadas mediante claves foráneas (`FOREIGN KEY`) y restricciones `CHECK`:

- **`instructores`**: `id (PK)`, `nombre`, `especialidad`, `email (UNIQUE)`, `telefono`, `bio`, `activo`.
- **`socios`**: `id (PK)`, `nombre`, `email (UNIQUE)`, `telefono`, `fecha_ingreso`.
- **`planes`**: `id (PK)`, `nombre`, `descripcion`, `precio`, `duracion_dias`, `actividades (JSONB)`.
- **`actividades`**: `id (PK)`, `nombre`, `categoria`, `instructor_id (FK → instructores)`, `instructor`, `horario`, `ubicacion`, `cupo`, `exterior`, `publicada`.
- **`membresias`**: `id (PK)`, `socio_id (FK → socios ON DELETE CASCADE)`, `plan_id (FK → planes ON DELETE RESTRICT)`, `fecha_inicio`, `fecha_fin`, `actividad_preferida (FK → actividades)`.
- **`inscripciones`**: `id (PK)`, `socio_id (FK → socios CASCADE)`, `actividad_id (FK → actividades CASCADE)`, `fecha_inscripcion`, `estado`, `notas`.
- **`pagos`**: `id (PK)`, `socio_id (FK → socios CASCADE)`, `membresia_id (FK → membresias SET NULL)`, `monto`, `fecha`, `metodo`, `estado`, `comprobante (UNIQUE)`.

### 2. Base de datos documental — MongoDB (`backend/src/models/`)

Se implementaron dos colecciones conectadas al backend:
- **`access_logs`** (`AccessLog.js`): registra cada pasada por el control de acceso (QR o manual), guardando si fue autorizada o denegada, el motivo y un subdocumento `metadata` con los días restantes de membresía, el dispositivo y la ubicación.
- **`audit_events`** (`AuditEvent.js`): bitácora de eventos del sistema (creación de socios, renovaciones, pagos confirmados, inscripciones, rechazos de acceso) con un campo `payload` flexible.

**Justificación de NoSQL**: PostgreSQL guarda el estado actual del negocio que requiere integridad referencial y transacciones (por ejemplo, crear una membresía junto con su pago pendiente). En cambio, los registros de acceso por QR y los eventos de auditoría son históricos de solo inserción (*append-only*) donde cada tipo de evento tiene datos distintos en su `payload` y donde también interesa guardar los intentos rechazados sin mezclarlos con las tablas relacionales.

---

## Descripción de la API y acceso a Swagger

Con el backend encendido, la documentación interactiva **Swagger / OpenAPI** se puede abrir y probar en:
- **URL Swagger**: `http://localhost:4000/api/docs`

### Resumen de endpoints (`/api`)

- `GET /api/health` — Estado del servidor y conexión a PostgreSQL y MongoDB.
- `GET /api/bootstrap` — Carga inicial de datos para el frontend.
- `POST /api/reset` — Restaura los datos de prueba en PostgreSQL y MongoDB.
- `GET, POST /api/socios` y `GET, PUT, DELETE /api/socios/:id` — CRUD de socios e historial completo.
- `GET, POST, PUT, DELETE /api/instructores` — CRUD de instructores.
- `GET, POST, PUT, DELETE /api/planes` — CRUD de planes (no permite borrar planes con membresías asociadas).
- `GET, POST, PUT, DELETE /api/actividades` — CRUD de actividades y cupos.
- `GET, POST /api/membresias` y `POST /api/membresias/:id/renovar` — Alta y renovación transaccional de membresías.
- `GET, POST /api/inscripciones`, `PATCH /api/inscripciones/:id/estado` y `DELETE /api/inscripciones/:id` — Inscripciones con validación de vigencia y cupos.
- `GET, POST /api/pagos` y `PATCH /api/pagos/:id/pagar` — Registro y confirmación de pagos con comprobante.
- `GET /api/asistencias` y `POST /api/asistencias/checkin` — Consulta de ingresos y validación de check-in QR/manual en MongoDB.
- `GET /api/bitacora` — Consulta de eventos de auditoría en MongoDB.

---

## API pública utilizada (Open-Meteo)

Se mantiene del Taller 2 la integración con **Open-Meteo** (`GET https://api.open-meteo.com/v1/forecast?latitude=-33.0246&longitude=-71.5518&current_weather=true&timezone=auto`), consumida desde el frontend (`src/services/weatherApi.js` y `src/hooks/useWeather.js`) y mostrada en el widget del Dashboard.

- **Aporte al problema**: el club tiene actividades al aire libre (*Funcional HIIT* y *Yoga*). El widget indica según la temperatura y el código climático si se pueden realizar en el exterior o si conviene pasarlas a sala techada.
- **Manejo de estados**: muestra spinner mientras carga y, si falla la red, presenta un mensaje de error con botón **Reintentar**. No utiliza API key.

---

## Configuración y ejecución con Docker Compose

### Requisitos
- **Docker** y **Docker Compose** (o Node.js 20+ si se ejecuta de forma local).

### 1. Levantar todo con Docker Compose (recomendado)

```bash
# 1. Opcional: crear archivo .env a partir de la plantilla
cp .env.example .env

# 2. Construir y levantar postgres, mongodb, backend y frontend
docker compose up --build
```

Servicios disponibles al iniciar:
- **Frontend React**: http://localhost:5173
- **Backend API**: http://localhost:4000/api/health
- **Swagger UI**: http://localhost:4000/api/docs
- **PostgreSQL**: puerto `5432`
- **MongoDB**: puerto `27017`

*(Al levantar por primera vez, el backend crea las tablas de PostgreSQL y carga automáticamente los datos de prueba en PostgreSQL y MongoDB).*

### 2. Ejecución en modo desarrollo local

Si prefieres correr solo las bases de datos en Docker y levantar Node y Vite en tu terminal:

```bash
# Levantar solo PostgreSQL y MongoDB
docker compose up -d postgres mongodb

# Terminal 1 — Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Variables de entorno (`.env.example`)

En la raíz del proyecto, en `backend/` y en `frontend/` se incluyen archivos `.env.example` sin credenciales reales:

```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=clubtrack
PG_PASSWORD=clubtrack_pass
PG_DATABASE=clubtrack_db
MONGO_URI=mongodb://localhost:27017/clubtrack_nosql
PORT=4000
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:4000/api
```

---

## Pruebas realizadas y limitaciones conocidas

### Pruebas automatizadas y funcionales
- **Suite de pruebas automatizadas en el backend (`npm test`)**: en `backend/src/tests/validators.test.js` se incluyen pruebas con `node:test` para verificar las validaciones de entrada (socios, planes, actividades, instructores, inscripciones, pagos y check-in) y las reglas de vigencia (`activa`, `por_vencer`, `vencida`). Se ejecutan con:
  ```bash
  cd backend
  npm test
  ```
- **Flujo completo en PostgreSQL**: registro de un nuevo socio → alta de membresía (crea membresía y pago pendiente con comprobante en una transacción SQL) → confirmación del pago → recarga del navegador (F5) verificando que los cambios persisten.
- **Validaciones y reglas de negocio**:
  - Inscribir en una actividad a un socio con membresía vencida (`S003` — Valentina Soto) devuelve `HTTP 422` y muestra la alerta en el modal.
  - Inscribir al mismo socio dos veces en la misma clase devuelve `HTTP 409`.
  - Eliminar un plan que tiene membresías asociadas se bloquea con `HTTP 409`.
- **Persistencia en MongoDB**:
  - Al validar un código QR vigente en `/qr`, se inserta el documento autorizado en `access_logs`.
  - Al validar un código QR con membresía vencida (`S003`), el backend rechaza el ingreso (`HTTP 422`) y deja registrado el intento fallido en `access_logs` y `audit_events`, visible en `/asistencia` y `/bitacora`.

### Limitaciones conocidas
- **Sin login ni sesiones**: la aplicación funciona como un panel único de administración y recepción para facilitar la demostración de todos los módulos.
- **Pagos simulados**: los cobros y comprobantes se registran en PostgreSQL pero no conectan con medios de pago reales.
- **Lector QR simulado**: el escaneo en recepción se prueba ingresando el código del socio o con los botones de acceso rápido, sin requerir cámara física.

---

## Uso de Inteligencia Artificial

| Herramienta | Propósito | Prompt representativo | Resultado | Validación humana | Aprendizaje |
| ----------- | --------- | --------------------- | --------- | ----------------- | ----------- |
| Asistente de IA (modelo de lenguaje) | Diseño de base de datos | *"Propón las tablas SQL en PostgreSQL y una colección en MongoDB para llevar ClubTrack del Taller 2 a Full Stack sin duplicar datos entre las dos bases."* | Sugirió las tablas relacionales para socios, planes, membresías, actividades, inscripciones y pagos, dejando en MongoDB los logs de check-in y eventos. | Ajustamos los nombres de columnas, agregamos el campo `comprobante` en `pagos` y definimos las reglas `ON DELETE CASCADE` y `RESTRICT`. | A separar datos transaccionales (SQL) de registros históricos de eventos y auditoría (NoSQL). |
| Asistente de IA (modelo de lenguaje) | Backend y transacciones SQL | *"Cómo hacer en Node con pg que al crear una membresía también se inserte su pago pendiente en una misma transacción y que valide el cupo al inscribir."* | Generó el código base usando `pool.connect()` con `BEGIN`, `COMMIT` y `ROLLBACK`, más las consultas previas de conteo de cupos. | Probamos los endpoints desde Swagger forzando errores (socios vencidos y cupos llenos) para comprobar que respondiera con códigos 409 y 422. | A manejar transacciones en PostgreSQL desde Node y devolver códigos de estado HTTP acordes a cada regla de negocio. |
| Asistente de IA (modelo de lenguaje) | Conexión de React a la API | *"Ayúdanos a cambiar el ClubContext que usaba localStorage para que ahora llame a los endpoints del backend con fetch."* | Propuso crear un cliente `apiClient.js` y convertir las funciones del contexto en `async/await` antes de hacer `dispatch`. | Revisamos cada página de React para manejar errores del servidor en los formularios y probamos el build con `npm run lint` y `npm run build`. | A sincronizar el estado global de React con respuestas asíncronas de una API REST. |
| Asistente de IA (modelo de lenguaje) | Docker y Swagger | *"Genera un docker-compose.yml para levantar Postgres, Mongo, el backend Express y el frontend Vite, y la configuración básica de swagger-ui-express."* | Entregó el archivo `docker-compose.yml` con healthchecks y la estructura del objeto OpenAPI 3.0. | Revisamos que las variables de entorno coincidieran con `.env.example` y que todos los endpoints se pudieran ejecutar desde `/api/docs`. | A configurar contenedores dependientes entre sí con Docker Compose y documentar contratos de API con Swagger. |

---

## Integrantes y reparto de trabajo

| Integrante | Módulos y aportes | Rama Git Flow |
| ---------- | ----------------- | ------------- |
| **Jorge**  | Base del backend (Express, conexión PostgreSQL/MongoDB, `schema.sql`, seed, Swagger) + conexión del contexto React + módulos **Club**: Dashboard, Planes, Membresías, Actividades, Instructores, Asistencia y Check-in QR. | `feature/fullstack-club` |
| **Maxi**   | Módulos **Control** y expansión: Socios, Historial del socio, Inscripciones y control de cupos, Pagos con comprobantes, Vencimientos y Bitácora NoSQL + `docker-compose.yml` y documentación (`README.md` y `docs/`). | `feature/fullstack-control-docs` |

El detalle del diseño, modelo de datos y endpoints está en [`docs/diseno.md`](docs/diseno.md), el flujo de ramas en [`docs/git-flow.md`](docs/git-flow.md) y la guía para la presentación en [`docs/defensa.md`](docs/defensa.md).
