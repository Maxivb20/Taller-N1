# Parte 2 — Módulos "Control", Inscripciones/Cupos, Bitácora NoSQL y Documentación (Responsable: Maxi)

Esta carpeta contiene los archivos que completan el 50% restante del Hito 3 sobre la base subida en la Parte 1:
- **Módulos React (`frontend/src/pages/`)**:
  - `Socios.jsx` (`/socios`): Padrón y CRUD de socios conectado a PostgreSQL y auditoría MongoDB.
  - `SocioHistorial.jsx` (`/socios/:id`): Ficha consolidada (membresías, inscripciones, pagos/comprobantes y logs de acceso NoSQL).
  - `Inscripciones.jsx` (`/inscripciones`): Inscripción de socios a actividades con validación de vigencia y control estricto de cupos (`HTTP 409 / 422`).
  - `Pagos.jsx` (`/pagos`): Recaudación, morosidad y visor de comprobantes (`BOL-2026-XXXX`).
  - `Vencimientos.jsx` (`/vencimientos`): Alertas de membresías por vencer, vencidas y pagos pendientes.
  - `Bitacora.jsx` (`/bitacora`): Explorador de colecciones MongoDB (`audit_events` y `access_logs`) con inspector de documentos JSON/BSON.
- **Documentación e Infraestructura**:
  - `README.md` completo del Hito 3.
  - `docs/diseno.md`, `docs/defensa.md`, `docs/git-flow.md`.
  - `docker-compose.yml` y `.env.example`.

## Cómo aplicar y subir esta Parte 2 al repositorio

> **Importante**: Primero debe estar fusionado en `develop` el Pull Request de la Parte 1 (`feature/fullstack-club`).

```bash
git checkout develop
git pull origin develop
git checkout -b feature/fullstack-control-docs

# Copiar el contenido de parte2-maxi/ sobre la raíz del repositorio (reemplazando los placeholders)
git add -A
git commit -m "feat(control): modulos socios, inscripciones/cupos, pagos/comprobantes, vencimientos, bitacora NoSQL + docker y docs"
git push -u origin feature/fullstack-control-docs
```
Luego abre el **Pull Request** de `feature/fullstack-control-docs` → `develop` y haz merge.
