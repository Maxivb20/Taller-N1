# Parte 1 — Base + módulos "Club" (responsable: Jorge)

Esta carpeta contiene **el proyecto React completo** con los fundamentos y los módulos "Club".
Es la **base** sobre la que tu compañero aplicará la Parte 2.

## ¿Qué incluye?

- Configuración del proyecto (Vite + React, `package.json`, ESLint, `index.html`).
- Datos semilla (`src/data/iniciales.json`), utilidades, servicios y **estado global**
  (`ClubContext` con `useReducer`) persistido en `localStorage`.
- Identidad visual completa (`src/styles/`), componentes `ui` reutilizables y layout con
  navegación (`react-router-dom`).
- Módulos **Club**: Dashboard, Planes, Actividades, Membresías, Asistencia y Check-in QR.
- El widget de clima conectado a la **API pública Open-Meteo** (URL corregida).
- **Placeholders** de los módulos "Control" (Socios, Pagos, Vencimientos, Historial):
  se ven como "módulo en construcción" y serán reemplazados por la Parte 2.

## Cómo trabajar esta parte

1. Clona el repositorio y sitúate en la rama `develop`:

   ```bash
   git clone https://github.com/Maxivb20/Taller-N1.git
   cd Taller-N1
   git checkout develop
   ```

2. Copia **el contenido** de esta carpeta dentro del repositorio, reemplazando lo que exista
   (debe quedar `package.json`, `src/`, `index.html`, etc. en la raíz del repo).

3. Crea la rama de esta parte, verifica y sube:

   ```bash
   git checkout -b feature/base-club
   npm install
   npm run lint
   npm run build
   npm run dev
   ```

4. Cuando todo funcione, haz commit y push:

   ```bash
   git add -A
   git commit -m "feat(base): fundamentos React + módulos Club (dashboard, planes, membresías, actividades, asistencia, QR)"
   git push -u origin feature/base-club
   ```

5. Abre un **Pull Request** de `feature/base-club` → `develop` en GitHub.

> ⚠️ **Orden importante**: la Parte 2 depende de esta base. Primero integra `feature/base-club`
> en `develop`; luego tu compañero trabaja sobre `develop` actualizado.

El paso a paso completo (con el flujo Git Flow y el reparto) está en
[`../GUIA-GIT.md`](../GUIA-GIT.md).
