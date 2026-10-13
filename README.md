# JODDB — Job Order Tracking System

> **Team project.** This is a copy, with full history, of
> [Whatever42Amman/JODDB_system_track](https://github.com/Whatever42Amman/JODDB_system_track),
> built by the **Whatever42Amman** team at 42 Amman. All credit for the original work goes to the
> team:
>
> - [@VoidReg](https://github.com/VoidReg)
> - [@AyhamAbusninah](https://github.com/AyhamAbusninah)
> - [@man-Yocto](https://github.com/man-Yocto) (Ahmad Al-khasawneh)
>
> The original repository is archived; this copy is kept on my profile as part of my portfolio.

JODDB (Job Order Database) is a full-stack system for tracking job orders on a manufacturing /
assembly floor: who is working on which device, how efficiently, and whether the result passed
quality inspection.

## Features

- **Role-based access control** — six roles (technician, quality inspector, supervisor, planning,
  tester, admin) with JWT authentication
- **Task lifecycle** — from creation to completion, with automatic efficiency calculation
- **Quality-assurance workflow** — multi-level inspections with a supervisor review layer
- **Performance metrics** — technician efficiency, productivity, utilization, and job-order
  progress, with configurable alert thresholds
- **Import / export** — Excel/CSV job-order import, daily reports as CSV/Excel/PDF
- **Notifications** — task accept/reject, deadline warnings, quality and efficiency alerts

## Tech stack

| Layer | Technologies |
|---|---|
| Backend | Python, Django 5, Django REST Framework, JWT, SQLite (dev) / PostgreSQL |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS |
| Deployment | Nginx, HTTPS, shell provisioning scripts |

## Getting started

See the detailed guides in this repository:

- [BACKEND.md](BACKEND.md) — models, API endpoints, auth, setup
- [FRONTEND.md](FRONTEND.md) — architecture, pages, state, setup
- [SETUP_SUMMARY.md](SETUP_SUMMARY.md) and the `setup-*-prod.sh` / `run-*-prod.sh` scripts for a
  production-style deployment

## What I learned

<!-- TODO: write this section yourself -->
