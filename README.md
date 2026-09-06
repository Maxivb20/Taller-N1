# ClubTrack — Gestión de Membresías y Asistencia

Proyecto frontend desarrollado para la Actividad Evaluada 1 (Desarrollo de Interfaz
Frontend). Es una interfaz web funcional dirigida a academias, gimnasios pequeños,
clubes y escuelas deportivas, que resuelve la gestión de socios, planes,
membresías, pagos, actividades y control de asistencia mediante check-in (manual
y por QR).

No existe backend: todos los datos se simulan en el navegador con `localStorage`,
tal como permiten las bases de la actividad. Al abrir la aplicación por primera
vez se cargan datos de ejemplo (socios, planes, membresías, pagos y asistencias)
para poder demostrar el flujo completo sin configuración previa.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 (sistema de diseño propio en `css/styles.css`)
- Bootstrap 5.3 (grillas, modales, formularios, componentes)
- JavaScript (ES6+, sin frameworks) para toda la lógica e interacción
- Chart.js para el gráfico de asistencia del dashboard
- QRCode.js para la generación de credenciales QR
- Git, GitHub y Git Flow para el control de versiones

## Estructura del proyecto

```
gestion-membresias/
├── index.html               Dashboard: KPIs, gráfico de asistencia, estado general
├── socios.html               Listado y CRUD de socios
├── socio-historial.html      Ficha con historial de membresías, pagos y asistencia
├── planes.html                CRUD de planes de membresía
├── membresias.html            Control de vigencia, renovación y alta de membresías
├── pagos.html                  Registro de pagos y morosidad
├── actividades.html           CRUD de actividades/clases del club
├── asistencia.html            Check-in manual + historial diario
├── qr.html                     Credencial QR por socio + lector de check-in
├── vencimientos.html          Vista consolidada de por vencer / vencidas / morosidad
├── css/
│   └── styles.css             Sistema de diseño (tokens, componentes)
├── js/
│   ├── data.js                 Datos simulados + acceso a localStorage + reglas de negocio
│   ├── main.js                  Utilidades comunes (toasts, sidebar activo, helpers)
│   └── *.js                     Lógica específica de cada página
└── README.md
```

## Módulos y funciones cubiertas

| Módulo        | Dónde                               |
|---------------|--------------------------------------|
| Socios        | `socios.html`, `socio-historial.html` |
| Planes        | `planes.html`                        |
| Membresías    | `membresias.html`                    |
| Pagos         | `pagos.html`                         |
| Actividades   | `actividades.html`                   |
| Asistencia    | `asistencia.html`                    |
| QR            | `qr.html`                             |
| Vencimientos  | `vencimientos.html`                  |

Funciones de profundidad implementadas:

- **Check-in móvil**: `qr.html` genera una credencial QR por socio y simula el
  lector de recepción (valida el código, revisa vigencia y registra la asistencia).
- **Estado de membresía**: badges de *Activa / Por vencer / Vencida* calculados
  en tiempo real según la fecha de término (`estadoMembresia()` en `data.js`).
- **Control de vigencia**: el check-in manual y por QR bloquea el ingreso si la
  membresía está vencida.
- **Dashboard de asistencia**: gráfico de los últimos 7 días y distribución de
  estados de membresía en `index.html`.
- **Listado de morosidad/vencimientos**: `vencimientos.html` concentra próximos
  a vencer, vencidas y pagos pendientes.
- **Historial del socio**: `socio-historial.html` reúne membresías, pagos y
  asistencia de un socio específico.

## Cómo ejecutar el proyecto

No requiere instalación ni servidor. Basta con abrir `index.html` en el
navegador. Para evitar restricciones de algunos navegadores con `localStorage`
al abrir archivos directamente, se recomienda servirlo con un servidor
estático simple, por ejemplo:

```bash
# Con Python 3
python3 -m http.server 8080

# Luego visitar
http://localhost:8080/index.html
```

Desde el Dashboard existe un botón **"Reiniciar datos de ejemplo"** para volver
al estado inicial en cualquier momento durante la demostración.

## Flujo de trabajo con Git y Git Flow

El proyecto sigue el modelo Git Flow para el trabajo colaborativo:

- `main`: versión estable, lista para presentar/entregar.
- `develop`: integración de las funcionalidades terminadas.
- `feature/<nombre>`: una rama por módulo o funcionalidad
  (por ejemplo `feature/socios`, `feature/qr-checkin`, `feature/dashboard`).
- `release/<version>`: estabilización previa a fusionar a `main`.
- `hotfix/<nombre>`: correcciones urgentes sobre `main`.

Ejemplo de flujo para una nueva funcionalidad:

```bash
git flow init                       # una sola vez, al iniciar el repositorio
git flow feature start qr-checkin   # crea y cambia a feature/qr-checkin
# ... desarrollo y commits ...
git add .
git commit -m "feat(qr): generar credencial QR y validar check-in"
git flow feature finish qr-checkin  # fusiona a develop
git push origin develop
```

Al cerrar el semestre/entrega:

```bash
git flow release start 1.0.0
git flow release finish 1.0.0
git push origin main develop --tags
```

### Convención de commits sugerida

```
feat(socios): agregar formulario de alta de socio
fix(membresias): corregir cálculo de días restantes
style(css): ajustar paleta de badges de estado
docs(readme): documentar estructura del proyecto
```

## Posibles extensiones futuras

- Reemplazar `localStorage` por una API real (backend) para persistencia
  multiusuario.
- Escaneo de QR con cámara real (por ejemplo con la librería `html5-qrcode`)
  en lugar de la entrada simulada.
- Notificaciones automáticas (correo/WhatsApp) a socios próximos a vencer.
- Roles de usuario (administrador / recepción) con inicio de sesión.
