# Documento de Diseño — ClubTrack (Hito 3)

Este documento describe el diagnóstico del Taller 2, las funcionalidades agregadas para el Hito 3, el modelo de datos en PostgreSQL y MongoDB, la arquitectura y los endpoints de la API REST.

---

## 1. Diagnóstico del Taller 2

En el Taller 2 construimos el prototipo frontend de ClubTrack en React. Al revisarlo para pasar a una plataforma Full Stack identificamos los siguientes puntos:

- **Qué se reutilizó**: la identidad visual (*"pizarra de marcador"* en `tokens.css` y `styles.css`), los componentes base de `src/components/ui/` (`DataTable`, `Modal`, `StatCard`, `EstadoBadge`, `BarTrack`, `PageHeader`, `EmptyState`, `Loading`, `ErrorState`) y el widget de clima con Open-Meteo.
- **Limitaciones que tenía el prototipo**:
  1. Todos los datos salían de `iniciales.json` y se guardaban en `localStorage`, por lo que cada navegador veía datos distintos y no existía persistencia compartida.
  2. El instructor de cada actividad era solo un texto libre, sin una ficha de entrenadores.
  3. La ocupación de las actividades se estimaba por la "actividad preferida" de la membresía, sin un registro real de inscripciones que controlara el cupo máximo.
  4. Los pagos no generaban número de comprobante.
  5. Cuando un socio con membresía vencida intentaba hacer check-in por QR, el rechazo se mostraba en pantalla pero no quedaba guardado en ningún historial.

---

## 2. Alcance ampliado en el Hito 3

Para resolver esas brechas mantuvimos el mismo problema y usuarios (Administrador y Recepción/Staff), sumando los siguientes procesos:

1. **Gestión de Instructores (`/instructores`)**: catálogo de profesores/organizadores con especialidad, correo, teléfono, biografía y estado activo, vinculados a las actividades.
2. **Inscripciones y control de cupos (`/inscripciones`)**: registro formal de socios en actividades. El backend verifica tres reglas antes de inscribir:
   - Que el socio tenga una membresía vigente (no vencida).
   - Que no tenga ya una inscripción activa en esa misma actividad.
   - Que todavía queden cupos disponibles según el límite de la clase.
3. **Emisión de comprobantes de pago (`/pagos`)**: al registrar una membresía, renovarla o cargar un pago manual, el backend genera un folio único (`BOL-2026-XXXX`) consultable en un modal de comprobante.
4. **Historial de accesos y bitácora en MongoDB (`/asistencia` y `/bitacora`)**: cada validación de ingreso (QR o manual) escribe un documento en `access_logs` indicando si fue autorizado o rechazado, y las operaciones principales del sistema dejan registro en `audit_events`.

### Historias de usuario principales
- **HU-1**: Como recepcionista, quiero dar de alta o renovar la membresía de un socio para que el sistema calcule su vigencia y deje creado su pago pendiente con comprobante en PostgreSQL.
- **HU-2**: Como administrador, quiero registrar a los instructores del club y asignarlos a las actividades indicando categoría, ubicación, horario y cupo máximo.
- **HU-3**: Como recepcionista, quiero inscribir a un socio en una actividad asegurándome de que esté al día y de que no se supere el cupo de la sala.
- **HU-4**: Como recepcionista, quiero validar el código QR de un socio en la entrada para autorizar o denegar el paso y que el intento quede guardado en MongoDB.
- **HU-5**: Como administrador, quiero revisar la bitácora de eventos y los intentos de acceso rechazados para tener trazabilidad de lo que ocurre en recepción.

---

## 3. Modelo Entidad-Relación SQL (PostgreSQL)

El esquema relacional está definido en `backend/src/db/schema.sql` y cuenta con 7 tablas:

```
instructores (1) ────── (0..N) actividades (1) ────── (0..N) inscripciones
                                    ▲                              │
                                    │ (0..1)                       │ (0..N)
planes (1) ──────────── (0..N) membresias (0..N) ──── (1) socios ◄─┘
                                    │                      │
                                    └── (0..1) pagos (0..N)┘
```

- **`instructores`**: `id` (PK), `nombre`, `especialidad`, `email` (UNIQUE), `telefono`, `bio`, `activo`.
- **`socios`**: `id` (PK), `nombre`, `email` (UNIQUE), `telefono`, `fecha_ingreso`.
- **`planes`**: `id` (PK), `nombre`, `descripcion`, `precio` (`CHECK > 0`), `duracion_dias` (`CHECK > 0`), `actividades` (JSONB).
- **`actividades`**: `id` (PK), `nombre`, `categoria`, `instructor_id` (FK a `instructores` con `ON DELETE SET NULL`), `instructor`, `horario`, `ubicacion`, `cupo` (`CHECK > 0`), `exterior`, `publicada`.
- **`membresias`**: `id` (PK), `socio_id` (FK a `socios` con `ON DELETE CASCADE`), `plan_id` (FK a `planes` con `ON DELETE RESTRICT`), `fecha_inicio`, `fecha_fin`, `actividad_preferida` (FK a `actividades`).
- **`inscripciones`**: `id` (PK), `socio_id` (FK a `socios` con `ON DELETE CASCADE`), `actividad_id` (FK a `actividades` con `ON DELETE CASCADE`), `fecha_inscripcion`, `estado` (`confirmada`, `en_espera`, `cancelada`), `notas`.
- **`pagos`**: `id` (PK), `socio_id` (FK a `socios` con `ON DELETE CASCADE`), `membresia_id` (FK a `membresias` con `ON DELETE SET NULL`), `monto` (`CHECK > 0`), `fecha`, `metodo`, `estado` (`pendiente`, `pagado`), `comprobante` (UNIQUE).

---

## 4. Diseño de colecciones NoSQL (MongoDB) y justificación

En MongoDB se manejan dos colecciones definidas con Mongoose en `backend/src/models/`:

### 1. Colección `access_logs` (`AccessLog.js`)
Guarda cada lectura de check-in en recepción (exitosa o rechazada):
```json
{
  "codigo": "AS0012",
  "socioId": "S001",
  "socioNombre": "Camila Reyes",
  "actividadId": "A02",
  "actividadNombre": "Funcional HIIT",
  "fecha": "2026-11-05",
  "hora": "19:10",
  "metodo": "QR",
  "autorizado": true,
  "motivo": "Ingreso autorizado (Membresía activa)",
  "metadata": {
    "estadoMembresia": "activa",
    "diasRestantes": 20,
    "dispositivo": "Lector QR Recepción",
    "ubicacion": "Cancha Exterior Norte"
  }
}
```

### 2. Colección `audit_events` (`AuditEvent.js`)
Bitácora de eventos del sistema donde el campo `payload` cambia según la acción realizada:
```json
{
  "tipo": "INSCRIPCION_CONFIRMADA",
  "modulo": "inscripciones",
  "descripcion": "Inscripción confirmada de Camila Reyes en \"Yoga\" (Cupo 4/15).",
  "actor": "Recepción",
  "entidadId": "IN008",
  "socioId": "S001",
  "payload": {
    "actividadId": "A04",
    "actividadNombre": "Yoga",
    "cupoOcupado": 4,
    "cupoMax": 15
  },
  "fecha": "2026-11-05",
  "hora": "19:15"
}
```

**¿Por qué usar MongoDB aquí?**: porque tanto los registros del lector QR como la bitácora de actividad son eventos históricos que se insertan continuamente y tienen metadatos variables (`metadata` y `payload`) que no requieren relaciones con claves foráneas ni transacciones SQL.

---

## 5. Diseño de endpoints de la API REST

Todos los endpoints cuelgan de `/api` y están documentados en Swagger (`/api/docs`):

| Método | Ruta | Propósito | Entrada principal | Respuesta / Códigos |
| ------ | ---- | --------- | ----------------- | ------------------- |
| `GET` | `/api/health` | Estado del backend y conexión a Postgres y Mongo | — | `200` |
| `GET` | `/api/bootstrap` | Obtiene los datos iniciales del club | — | `200` |
| `POST` | `/api/reset` | Restaura los datos de ejemplo en ambas bases | — | `200` |
| `GET` | `/api/socios` | Lista todos los socios | — | `200` |
| `GET` | `/api/socios/:id` | Detalle e historial de un socio | `id` (path) | `200`, `404` |
| `POST` | `/api/socios` | Crea un socio nuevo | `{ nombre, email, telefono }` | `201`, `400`, `409` |
| `PUT` | `/api/socios/:id` | Actualiza un socio | `{ nombre, email, telefono }` | `200`, `400`, `404` |
| `DELETE` | `/api/socios/:id` | Elimina un socio y sus registros asociados | `id` (path) | `200`, `404` |
| `GET, POST, PUT, DELETE` | `/api/instructores` | CRUD de instructores | `{ nombre, especialidad, email, telefono, bio, activo }` | `200`, `201`, `400`, `404` |
| `GET, POST, PUT, DELETE` | `/api/planes` | CRUD de planes de membresía | `{ nombre, descripcion, precio, duracionDias, actividades }` | `200`, `201`, `400`, `409` |
| `GET, POST, PUT, DELETE` | `/api/actividades` | CRUD de actividades | `{ nombre, categoria, instructorId, horario, ubicacion, cupo, exterior }` | `200`, `201`, `400`, `404` |
| `GET, POST` | `/api/membresias` | Lista o crea membresía + pago pendiente | `{ socioId, planId, inicio, actividadPreferida }` | `200`, `201`, `400`, `404` |
| `POST` | `/api/membresias/:id/renovar` | Renueva membresía y genera nuevo pago pendiente | `id` (path) | `201`, `404` |
| `GET, POST` | `/api/inscripciones` | Lista o inscribe socio validando vigencia y cupo | `{ socioId, actividadId, notas }` | `200`, `201`, `409`, `422` |
| `PATCH, DELETE` | `/api/inscripciones/:id/estado` | Cambia estado (`confirmada` / `cancelada`) o elimina | `{ estado }` | `200`, `400`, `404` |
| `GET, POST` | `/api/pagos` | Lista o registra un pago con comprobante | `{ socioId, membresiaId, monto, metodo }` | `200`, `201`, `400` |
| `PATCH` | `/api/pagos/:id/pagar` | Marca un pago pendiente como pagado | `{ metodo }` | `200`, `404` |
| `GET` | `/api/asistencias` | Lista registros de acceso desde MongoDB | `?fecha=YYYY-MM-DD&incluirRechazos=true` | `200` |
| `POST` | `/api/asistencias/checkin` | Valida vigencia en SQL y guarda el acceso en MongoDB | `{ codigo, actividadId, metodo }` | `201`, `404`, `422` |
| `GET` | `/api/bitacora` | Lista eventos de auditoría desde MongoDB | `?modulo=...&limite=100` | `200` |

---

## 6. Mapa de navegación actualizado

```
Dashboard (/) ─┬─ Check-in QR (/qr)
               ├─ Socios (/socios) ── Historial del socio (/socios/:id)
               ├─ Planes (/planes)
               ├─ Membresías (/membresias)
               ├─ Actividades (/actividades)
               ├─ Instructores (/instructores)          [Nuevo en Hito 3]
               ├─ Inscripciones (/inscripciones)        [Nuevo en Hito 3]
               ├─ Asistencia (/asistencia)
               ├─ Pagos (/pagos)
               ├─ Vencimientos (/vencimientos)
               └─ Bitácora (/bitacora)                  [Nuevo en Hito 3]
```
