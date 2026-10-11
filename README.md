# ClubTrack — Frontend (React + Vite)

Aplicación web de gestión para un club/gimnasio. Permite administrar socios, planes,
membresías, pagos, actividades y asistencia, con un check-in por código QR y un tablero
general con métricas.

Proyecto de **Taller Evaluado N°2 (Desarrollo Web II)**. Es la migración a **React** de la
Actividad 1 (que estaba hecha con HTML, CSS, Bootstrap y JavaScript vanilla).

---

## 📌 Problemática

Muchos clubes y gimnasios pequeños administran su operación con planillas sueltas o cuadernos.
Esto provoca dificultad para saber **quién está al día**, **pérdida de control de la morosidad**,
registro de asistencia **manual y poco confiable** y demoras en recepción al validar cada ingreso.

**ClubTrack** centraliza la gestión y agrega un **check-in por QR** para agilizar el acceso.

## 👤 Usuarios objetivo

- **Administrador**: gestiona socios, planes, membresías y pagos, y revisa las métricas del club.
- **Recepción / Staff**: registra ingresos (QR o manual) y confirma pagos rápidamente.

## ✅ Funcionalidades principales

- **Dashboard**: métricas (activos, por vencer, morosidad, check-ins del día), gráfico de
  asistencia de los últimos 7 días y widget de clima.
- **Socios**: padrón con búsqueda, filtro por estado, alta/edición/baja y ficha de historial.
- **Planes** y **Actividades**: catálogo con CRUD y ocupación por actividad.
- **Membresías**: alta y renovación con control de vigencia y generación de pago pendiente.
- **Asistencia**: check-in manual con validación de vigencia e historial por día.
- **Check-in QR**: credencial QR por socio y lector simulado de recepción.
- **Pagos** y **Vencimientos**: recaudación, morosidad, próximos vencimientos y acciones rápidas.

---

## 🚀 Puesta en marcha

Requisitos: **Node.js 18+** y npm.

```bash
npm install      # instalar dependencias
npm run dev      # entorno de desarrollo  → http://localhost:5173
npm run build    # compilar para producción (carpeta dist/)
npm run preview  # previsualizar el build de producción
npm run lint     # revisar el estilo del código (ESLint)
```

---

## 🧱 Tecnologías

| Tecnología           | Uso                                                        |
| -------------------- | ---------------------------------------------------------- |
| React 19             | Librería de UI (componentes + hooks)                       |
| Vite                 | Empaquetador y servidor de desarrollo                      |
| React Router DOM 7   | Enrutado de la SPA (10 rutas)                              |
| Context API + useReducer | Estado global del "club" (patrón tipo store)           |
| Bootstrap 5 + bootstrap-icons | Grilla, utilidades, formularios y tipografía de iconos |
| Chart.js + react-chartjs-2 | Gráfico de asistencia en el Dashboard                |
| qrcode.react         | Generación de credenciales QR                              |
| Open-Meteo API       | API pública para el clima (sin API key)                    |

**No hay backend**: los datos se guardan en el `localStorage` del navegador y se "siembran"
con datos de ejemplo la primera vez que se abre la app (ver `src/services/clubService.js`).

---

## 🗂️ Estructura del proyecto

```
src/
├── components/
│   ├── layout/          # Layout general y Sidebar (navegación)
│   ├── ui/              # Componentes reutilizables (tabla, modal, tarjetas…)
│   └── WeatherWidget.jsx
├── context/
│   ├── ClubContext.jsx  # Estado global (useReducer) + acciones
│   └── ToastContext.jsx # Notificaciones
├── data/
│   └── iniciales.json   # Datos semilla de ejemplo
├── hooks/
│   └── useWeather.js
├── pages/               # Una página por ruta
├── services/
│   ├── clubService.js   # Carga/guardado de datos (localStorage)
│   ├── storage.js
│   └── weatherApi.js    # Cliente de la API Open-Meteo
├── styles/              # tokens.css + styles.css (identidad visual)
└── utils/               # fechas, formato, reglas de negocio, ids
```

---

## 🧭 Rutas

| Ruta            | Módulo                     |
| --------------- | -------------------------- |
| `/`             | Dashboard (resumen general) |
| `/socios`       | Socios (padrón + CRUD)      |
| `/socios/:id`   | Historial de un socio       |
| `/planes`       | Planes                      |
| `/membresias`   | Membresías                  |
| `/actividades`  | Actividades                 |
| `/asistencia`   | Asistencia (check-in manual)|
| `/qr`           | Check-in QR                 |
| `/pagos`        | Pagos                       |
| `/vencimientos` | Vencimientos                |

---

## 🎨 Identidad visual

La interfaz usa el concepto de **"pizarra de marcador"** (tiza sobre pizarra). Los tokens de
color y tipografía están en `src/styles/tokens.css` y se detallan en
[`docs/diseno.md`](docs/diseno.md):

- Verde cancha `#2F6844`, tinta `#14181C`, tiza `#F4F1EA`, ámbar `#E0932F`, alerta `#BD4438`,
  acero `#6B7280`.
- Tipografías: **Bebas Neue** (títulos, estilo marcador) e **Inter** (texto).

---

## 🌦️ API pública utilizada (Open-Meteo)

| Ítem | Detalle |
| ---- | ------- |
| **Nombre** | Open-Meteo |
| **Documentación oficial** | https://open-meteo.com/en/docs |
| **Endpoint** | `https://api.open-meteo.com/v1/forecast` |
| **Método HTTP** | `GET` |
| **Parámetros** | `latitude`, `longitude`, `current_weather=true`, `timezone=auto` |
| **Datos usados** | `current_weather.temperature`, `current_weather.windspeed`, `current_weather.weathercode`, `current_weather.time` |
| **Dónde se muestra** | Widget **"Clima del campus"** en el Dashboard (`src/components/WeatherWidget.jsx`) |
| **Autenticación / límites** | No requiere API key. Uso gratuito para fines no comerciales / bajo volumen |
| **Licencia** | Datos bajo **CC-BY 4.0**; se da atribución a Open-Meteo en el widget |
| **Cliente / Hook** | `src/services/weatherApi.js` · `src/hooks/useWeather.js` |

Coordenadas configuradas: **Viña del Mar, Chile** (`-33.0246, -71.5518`).

```
https://api.open-meteo.com/v1/forecast?latitude=-33.0246&longitude=-71.5518&current_weather=true&timezone=auto
```

Respuesta (resumida):

```json
{
  "latitude": -33.0246,
  "longitude": -71.5518,
  "current_weather": {
    "temperature": 15.4,
    "windspeed": 9.1,
    "weathercode": 3,
    "time": "2026-10-11T14:00"
  }
}
```

**Manejo de la respuesta y de errores**: el `weathercode` se traduce a un ícono y texto con
`describirClima()`. La consulta usa `fetch` dentro de un `useEffect` y contempla tres estados:
**cargando** (spinner), **error** (mensaje con **botón "Reintentar"** que vuelve a llamar a la
API) y **listo**. Si `response.ok` es falso o falta `current_weather`, se lanza un error que se
muestra en el widget.

**Justificación funcional**: el club tiene actividades al aire libre (Funcional HIIT, Yoga).
El clima permite mostrar en el Dashboard si conviene realizarlas o priorizar infraestructura
techada, aportando una decisión operativa real y no un adorno.

---

## 🤖 Uso de Inteligencia Artificial

### Reporte de IA

| Herramienta | Propósito | Prompt representativo | Resultado | Modificación humana | Aprendizaje |
| ----------- | --------- | --------------------- | --------- | ------------------- | ----------- |
| Asistente de IA (modelo de lenguaje) | Andamiaje y planificación | *"Propón la estructura de carpetas, el modelo de datos y un reparto de módulos para migrar una app vanilla de gestión de club a React."* | Propuso la arquitectura por `components/pages/services/context` y el esquema de entidades | El equipo ajustó nombres, ids y decidió qué módulos asumía cada integrante | A organizar un proyecto por responsabilidades antes de escribir código |
| Asistente de IA (modelo de lenguaje) | Redacción de código base | *"Genera utilidades para manejar fechas `YYYY-MM-DD` y una función que determine el estado de una membresía según los días restantes."* | `utils/dates.js` y `utils/business.js` con `estadoMembresia`, `diasRestantes` | Se fijó el umbral en 7 días y se probó con datos semilla | A traducir reglas de negocio a funciones puras y testeables |
| Asistente de IA (modelo de lenguaje) | Debugging | *"Esta URL de fetch falla siempre, ¿qué está mal?"* | Detectó una URL mal formada (`open-meteo.com{LAT}` sin `api.`, `/v1/forecast` ni `latitude=`) | Se reescribió con `URLSearchParams` y se verificó en el navegador | A leer mensajes de error de red y a construir URLs con parámetros |
| Asistente de IA (modelo de lenguaje) | Documentación | *"Redacta el README y un documento de diseño a partir de estas decisiones del equipo."* | Borradores que el equipo revisó y corrigió | Se completaron datos reales (colores, endpoints, integrantes) | A documentar un proyecto para terceros |

**Control de calidad humano**: cada integrante revisó, ejecutó y validó el código
(`npm run lint`, `npm run build` y pruebas manuales en el navegador), ajustó los datos de
ejemplo y verificó que la lógica de negocio reflejara los requisitos del taller. Las decisiones
de arquitectura (React Router, Context + useReducer, API de clima) fueron acordadas por el equipo.

---

## 🧠 Decisiones técnicas

- **React Router** en lugar de un `useState('vistaActual')`: cada vista es una ruta real,
  navegable y enlazable, con un `Layout` compartido.
- **Context + useReducer** para el estado del club: centraliza las mutaciones en acciones y
  evita "prop drilling"; un `useEffect` persiste cada cambio en `localStorage`.
- **Componentes `ui/` presentacionales** (tabla, modal, tarjeta, badges) reutilizados por todas
  las páginas, para evitar duplicación y mantener consistencia.
- **Datos semilla deterministas**: las membresías/pagos/asistencias se generan por *offsets* de
  fecha desde `iniciales.json`, así los estados activa/por vencer/vencida se demuestran siempre.
- **Identidad visual propia** (CSS con variables) sobre Bootstrap, para no depender solo de
  componentes prediseñados.

---

## ⚠️ Limitaciones conocidas

- **Sin backend**: los datos viven en `localStorage`; no hay sincronización entre dispositivos
  ni usuarios. "Reiniciar datos de ejemplo" en el Dashboard borra los cambios locales.
- El **check-in QR es simulado** (lector por código/atajos), ya que no hay hardware ni servidor.
- El **clima** corresponde a una ubicación fija (Viña del Mar), no a geolocalización del usuario.
- No hay autenticación ni roles: la app asume un único entorno de administración.

---

## 👥 Integrantes y reparto

| Integrante | Módulos / aportes                                                              |
| ---------- | ------------------------------------------------------------------------------ |
| Jorge      | Fundamentos (datos, contexto, router, estilos, UI base) + módulos "Club": Dashboard, Planes, Membresías, Actividades, Asistencia y Check-in QR |
| Maxi       | Módulos "Control": Socios, Pagos, Vencimientos e Historial del socio + documentación |

---

## 🌿 Flujo de trabajo con Git (Git Flow)

- `main`: versión estable (Actividad 1).
- `develop`: rama de integración de la Entrega 2.
- `feature/base-club`: fundamentos + módulos Club.
- `feature/control-docs`: módulos Control + documentación.

Los detalles de ramas, commits y Pull Requests están en [`docs/git-flow.md`](docs/git-flow.md).
La guía de demostración y defensa técnica está en [`docs/defensa.md`](docs/defensa.md).
