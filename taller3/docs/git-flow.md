# Guía Git — ClubTrack (Git Flow · Hito 3)

Flujo de ramas utilizado para dividir e integrar el desarrollo del Hito 3 entre los dos integrantes del equipo.
Repositorio: **https://github.com/Maxivb20/Taller-N1**

---

## 1. Ramas del proyecto

| Rama | Contenido | Responsable |
| ---- | --------- | ----------- |
| `main` | Versión de entrega final | Ambos |
| `develop` | Rama de integración del Hito 3 | Ambos |
| `feature/fullstack-club` | Parte 1: Backend (Express + PostgreSQL + MongoDB + Swagger) + contexto React + módulos *Club* | Jorge |
| `feature/fullstack-control-docs` | Parte 2: Módulos *Control* (Socios, Historial, Inscripciones, Pagos, Vencimientos, Bitácora) + Docker Compose y documentación | Maxi |

---

## 2. Parte 1 — `feature/fullstack-club` (Jorge)

```bash
git checkout develop
git pull origin develop
git checkout -b feature/fullstack-club

# Copiar el contenido de parte1-jorge/ en la raíz del repositorio

cd frontend
npm install
npm run lint
npm run build
cd ..

git add -A
git commit -m "feat(club): backend Express + PostgreSQL/MongoDB y modulos Club en React"
git push -u origin feature/fullstack-club
```

Abrir **Pull Request** de `feature/fullstack-club` hacia `develop` en GitHub y hacer merge.

---

## 3. Parte 2 — `feature/fullstack-control-docs` (Maxi)

> Importante: hacer esto después de que el PR de la Parte 1 ya esté integrado en `develop`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/fullstack-control-docs

# Copiar el contenido de parte2-maxi/ sobre la raíz del repositorio

cd frontend
npm install
npm run lint
npm run build
cd ..

git add -A
git commit -m "feat(control): modulos socios, inscripciones, pagos, vencimientos, bitacora y documentacion"
git push -u origin feature/fullstack-control-docs
```

Abrir **Pull Request** de `feature/fullstack-control-docs` hacia `develop` y hacer merge.

---

## 4. Cierre de la entrega en `main`

```bash
git checkout develop
git pull origin develop

git checkout main
git pull origin main
git merge --no-ff develop -m "release: Hito 3 ClubTrack Full Stack"
git push origin main
```
