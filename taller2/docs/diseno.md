# Documento de Diseño — ClubTrack

Este documento describe **qué** construimos y **cómo** lo diseñamos antes de programar:
problemática, usuarios, módulos, modelo de datos, arquitectura y guía visual.

---

## 1. Problemática

Muchos clubes y gimnasios pequeños administran su operación con planillas sueltas o cuadernos.
Esto provoca:

- Dificultad para saber **quién está al día** y quién tiene la membresía vencida.
- **Pérdida de control de la morosidad** (pagos pendientes sin seguimiento).
- Registro de asistencia **manual y poco confiable**.
- Sobrecarga en recepción al validar el ingreso de cada socio.

**ClubTrack** centraliza la gestión y entrega, además, un check-in por QR para agilizar el acceso.

---

## 2. Usuarios

| Rol                     | Necesidad principal                                                    |
| ----------------------- | ---------------------------------------------------------------------- |
| **Administrador**       | Gestionar socios, planes, membresías, pagos y ver métricas del club.   |
| **Recepción / Staff**   | Registrar ingresos (QR o manual) y confirmar pagos rápidamente.        |

---

## 3. Objetivos

1. Una única fuente de verdad para socios, membresías y pagos.
2. Visualizar de un vistazo el estado del club (activos, por vencer, vencidos, morosidad).
3. Reducir el tiempo de check-in con una credencial QR.
4. Sentar la base de una app **React** mantenible (componentes reutilizables y estado central).

---

## 4. Módulos

| Módulo          | Descripción breve                                                        |
| --------------- | ------------------------------------------------------------------------ |
| Dashboard       | Métricas y gráfico de asistencia de los últimos 7 días + clima.          |
| Socios          | CRUD de socios, búsqueda y filtro por estado de membresía.               |
| Historial socio | Ficha con membresías, pagos y asistencias de un socio.                   |
| Planes          | Catálogo de planes (precio, duración, beneficios).                       |
| Membresías      | Alta y renovación de membresías con control de vigencia.                 |
| Actividades     | Catálogo de clases/disciplinas del club.                                 |
| Asistencia      | Check-in manual con validación de vigencia + historial del día.          |
| Check-in QR     | Credencial QR por socio y lector simulado de recepción.                  |
| Pagos           | Registro de pagos, recaudación y confirmación de pendientes.             |
| Vencimientos    | Por vencer, vencidas y morosidad, con acciones rápidas.                  |

---

## 5. Modelo de datos

Los datos viven en un objeto en memoria (`ClubContext`) que se persiste en `localStorage`.
Todas las fechas son strings `YYYY-MM-DD`; los ids son strings (ej. `S001`, `P02`, `M004`).

### `socios`
```json
{ "id": "S001", "nombre": "Camila Reyes", "email": "…", "telefono": "+56 9 …", "fechaIngreso": "2026-03-05" }
```

### `planes`
```json
{ "id": "P02", "nombre": "Plan Full", "descripcion": "…", "precio": 39990, "duracionDias": 30, "actividades": ["Musculación", "Yoga"] }
```

### `actividades`
```json
{ "id": "A02", "nombre": "Funcional HIIT", "instructor": "…", "horario": "Lun / Mié / Vie · 19:00", "cupo": 18, "exterior": true }
```

### `membresias`
```json
{ "id": "M001", "socioId": "S001", "planId": "P02", "fechaInicio": "2026-09-11", "fechaFin": "2026-10-11", "actividadPreferida": "A02" }
```

### `pagos`
```json
{ "id": "PG001", "socioId": "S001", "membresiaId": "M001", "monto": 39990, "fecha": "2026-09-11", "metodo": "Transferencia", "estado": "pagado" }
```

### `asistencias`
```json
{ "id": "AS0001", "socioId": "S001", "actividadId": "A02", "fecha": "2026-10-11", "hora": "19:50", "metodo": "QR" }
```

### Reglas de negocio
- **Vigencia**: la membresía vigente de un socio es la de `fechaFin` más reciente
  (`membresiaVigenteDe`).
- **Estado** (`estadoMembresia`), con umbral `UMBRAL_POR_VENCER = 7` días:
  - `vencida` → `díasRestantes < 0`
  - `por_vencer` → `0 ≤ díasRestantes ≤ 7`
  - `activa` → `díasRestantes > 7`
- **Alta/renovación**: se crea la membresía **y** un pago `pendiente` por el precio del plan.
- **Check-in**: solo se permite si la membresía vigente **no** está vencida.
- **Borrado de socio**: elimina en cascada sus membresías, pagos y asistencias.

---

## 6. Arquitectura

```
        ┌─────────────────────────────┐
        │            UI               │  components/ + pages/
        └──────────────▲──────────────┘
                       │ useClub()
        ┌──────────────┴──────────────┐
        │   ClubContext (useReducer)  │  estado global + acciones
        └──────────────▲──────────────┘
                       │
        ┌──────────────┴──────────────┐
        │ clubService / storage       │  localStorage (sin backend)
        └─────────────────────────────┘
```

- **Patrón contenedor/presentacional**: las páginas consumen el estado; los componentes `ui/`
  son presentacionales y reutilizables.
- **Acciones centralizadas**: toda mutación pasa por `acciones` (`agregarSocio`, `renovarMembresia`,
  `marcarPagado`, `registrarAsistencia`, …) y se resuelve en un `reducer`.
- **Persistencia automática**: un `useEffect` guarda el estado en `localStorage` en cada cambio.

### Mapa de navegación
```
Dashboard(/) ─┬─ Socios(/socios) ─ Historial(/socios/:id)
              ├─ Planes(/planes)
              ├─ Membresías(/membresias)
              ├─ Actividades(/actividades)
              ├─ Asistencia(/asistencia)
              ├─ Check-in QR(/qr)
              ├─ Pagos(/pagos)
              └─ Vencimientos(/vencimientos)
```

---

## 7. Guía visual (identidad "pizarra de marcador")

Idea: transmitir la estética de una **pizarra de marcador** deportiva (tiza, marcador,
verde cancha), en línea con la Actividad 1.

### Paleta
| Token            | Hex       | Uso                                  |
| ---------------- | --------- | ------------------------------------ |
| `--court`        | `#2F6844` | Verde cancha (acciones primarias)    |
| `--court-dark`   | `#1F4A31` | Hover / énfasis                      |
| `--ink`          | `#14181C` | Texto principal                      |
| `--chalk`        | `#F4F1EA` | Fondo tipo tiza                      |
| `--amber`        | `#E0932F` | "Por vencer" / advertencias          |
| `--alert`        | `#BD4438` | Vencido / error / morosidad          |
| `--steel`        | `#6B7280` | Texto secundario                     |

### Tipografía
- **Bebas Neue**: títulos y números de marcador (`scoreboard-num`).
- **Inter**: texto general.

### Componentes base
`PageHeader`, `StatCard`, `EstadoBadge`, `BarTrack`, `DataTable`, `Modal`, `EmptyState`,
`Loading`, `ErrorState`, `EnConstruccion`.

### Estados de interfaz
- **Vacíos**: `EmptyState` con ícono y mensaje.
- **Carga**: `Loading` (spinner) en el widget de clima.
- **Error**: `ErrorState` con acción de reintento.
- **Feedback**: notificaciones *toast* (`ToastContext`).

---

## 8. Wireframes (bocetos)

**Dashboard**
```
┌ Header: Dashboard ──────────────[ Reiniciar datos ]┐
│ [Activos] [Por vencer] [Morosidad] [Check-ins hoy] │
│ ┌ Barras asistencia 7d ┐ ┌ Distribución estados ┐ │
│ ┌ Clima (Open-Meteo)  ┐                             │
│ ┌ Últimos check-in ──────────────────────────────┐ │
└────────────────────────────────────────────────────┘
```

**Check-in QR**
```
┌ Credencial del socio ┐   ┌ Lector de recepción ──────────┐
│  ▓▓ QR ▓▓           │   │ [código] [actividad] [Validar]│
│  Código: S001        │   │ Accesos rápidos: [Camila] …    │
│  Camila Reyes        │   │ ✅ Bienvenido/a, Camila …      │
└──────────────────────┘   └───────────────────────────────┘
```

**Vencimientos**
```
[ Por vencer ] [ Vencidas ] [ Morosidad ]
─ Por vencer (≤7 días) ──────────────
─ Vencidas ─────────────────────────
─ Morosidad (pagos) [Marcar pagado] ─
```

---

## 9. Integración con API pública

Se eligió **Open-Meteo** por ser pública, sin API key y con datos útiles para el club
(por ejemplo, para decidir si una actividad al aire libre se realiza). El detalle técnico del
consumo está en el [README](../README.md).

---

## 10. Flujos de usuario

Los tres flujos principales del sistema:

**Flujo A — Alta de socio y asignación de membresía**
```
Socios → "Nuevo socio" → completar nombre/correo/teléfono (validación) →
Guardar (toast "Socio registrado") → Membresías → "Nueva membresía" →
elegir socio + plan + fecha → se crea la membresía y un pago PENDIENTE → confirmación
```

**Flujo B — Acceso al club (check-in)**
```
Recepción → Check-in QR → mostrar credencial (o ingresar código) →
Validar → si la membresía está vigente: "Bienvenido/a" + se registra la asistencia;
si está vencida: "Acceso denegado" (según regla de negocio) → historial del día se actualiza
```

**Flujo C — Control de morosidad y vencimientos**
```
Vencimientos → revisar "Por vencer (≤7 días)" y "Vencidas" →
ir a Morosidad → "Marcar pagado" (toast) → Pagos/Estado del socio se actualiza en cascada
```

Regla transversal: toda acción de escritura muestra confirmación (toast) y se refleja de
inmediato en el resto de las vistas, porque el estado es global y persistente.

---

## 11. Decisiones técnicas

- **Enrutado**: `react-router-dom` con un `Layout` compartido (`<Outlet />`) y rutas por vista,
  en lugar de un simple estado que alterna pantallas.
- **Estado global**: `Context` + `useReducer` (`ClubContext`). Toda mutación pasa por acciones
  (`agregarSocio`, `renovarMembresia`, `marcarPagado`, `registrarAsistencia`, …); un `useEffect`
  persiste el estado en `localStorage`.
- **Componentes reutilizables**: los `ui/` (`DataTable`, `Modal`, `EstadoBadge`, `StatCard`,
  `BarTrack`, `PageHeader`, `EmptyState`, `Loading`, `ErrorState`) separan presentación de lógica.
- **Reglas de negocio aisladas**: `utils/business.js` (`estadoMembresia`, `diasRestantes`,
  `membresiaVigenteDe`) reutilizadas por todas las vistas.
- **Datos semilla deterministas**: `clubService.buildSeed()` genera membresías, pagos y
  asistencias por *offsets* de fecha para garantizar estados demostrables.
- **Estilos**: Bootstrap para grilla/utilidades/formularios + CSS propio con variables
  (`tokens.css`) para la identidad "pizarra de marcador" y el comportamiento responsive.
- **Ante errores de la API**: estados de carga/error en `useWeather` con acción de reintento.
