# Guía Git — ClubTrack (Git Flow)

Flujo de trabajo con **Git Flow** usado para desarrollar la Entrega 2.
Repositorio: **https://github.com/Maxivb20/Taller-N1**

---

## 0. Ramas del proyecto

| Rama                   | Contenido                                      | Responsable |
| ---------------------- | ---------------------------------------------- | ----------- |
| `main`                 | Versión estable (Actividad 1)                  | —           |
| `develop`              | Integración de la Entrega 2                    | Ambos       |
| `feature/base-club`    | Fundamentos + módulos "Club" (Parte 1)         | Jorge       |
| `feature/control-docs` | Módulos "Control" + documentación (Parte 2)    | Maxi        |

Flujo: `feature/*` → **Pull Request** → `develop` → (release) → `main`.

---

## 1. Preparación del repositorio (una sola vez)

```bash
git clone https://github.com/Maxivb20/Taller-N1.git
cd Taller-N1

git checkout develop
git pull origin develop
```

> Si `develop` no existe todavía en el remoto, créala desde `main`:
> ```bash
> git checkout -b develop
> git push -u origin develop
> ```

---

## 2. PARTE 1 — `feature/base-club` (Jorge)

```bash
git checkout develop
git pull origin develop
git checkout -b feature/base-club

# Copiar el contenido del proyecto base en la raíz del repo
# (package.json, src/, index.html, vite.config.js, eslint.config.js, .gitignore)

npm install
npm run lint
npm run build
npm run dev

git add -A
git status
git commit -m "feat(base): fundamentos React + módulos Club (dashboard, planes, membresías, actividades, asistencia, QR)"
git push -u origin feature/base-club
```

**Abrir Pull Request** `feature/base-club` → `develop` y mergear tras la revisión.

```bash
git checkout develop
git pull origin develop
```

---

## 3. PARTE 2 — `feature/control-docs` (Maxi)

> Requisito: el PR de la Parte 1 ya está mergeado en `develop`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/control-docs

# Copiar:
#   src/pages/{Socios,SocioHistorial,Pagos,Vencimientos}.jsx -> src/pages/
#   docs/{diseno.md,defensa.md,git-flow.md}                  -> docs/
#   README.md                                                -> raíz del repo

npm install
npm run lint
npm run build
npm run dev

git add -A
git status
git commit -m "feat(control): módulos socios, pagos, vencimientos e historial + documentación"
git push -u origin feature/control-docs
```

**Abrir Pull Request** `feature/control-docs` → `develop` y mergear tras la revisión.

---

## 4. Cierre: release de `develop` a `main`

```bash
git checkout develop
git pull origin develop

git checkout main
git pull origin main
git merge --no-ff develop -m "release: Entrega 2 ClubTrack (React)"
git push origin main
```

(Opcional) etiquetar la versión:

```bash
git tag -a v2.0.0 -m "Entrega 2 - ClubTrack React"
git push origin v2.0.0
```

---

## 5. Reglas y recomendaciones

- **Nunca** subir `node_modules/` ni `dist/` (ya están en `.gitignore`).
- Un `commit` por avance lógico; mensajes con prefijo (`feat:`, `fix:`, `docs:`).
- Antes de cada `push`, correr `npm run lint` y `npm run build`.
- Resolver los Pull Requests con revisión cruzada.
- No trabajar directamente sobre `main` ni `develop`: usar ramas `feature/*` + PR.

### Problemas comunes (Windows)

- **`npm.ps1` bloqueado por ExecutionPolicy**: usar `npm.cmd` (ej. `npm.cmd install`).
- **Datos "raros" en el navegador**: la app guarda en `localStorage`; usar el botón
  *"Reiniciar datos de ejemplo"* del Dashboard o borrar el almacenamiento del sitio.
