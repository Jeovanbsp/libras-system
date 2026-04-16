# Libras System - Sistema de Gestão Libras Salvador

A comprehensive management and educational platform for Libras (Brazilian Sign Language) instruction. Features dual-dashboard interfaces for administrators and students.

## Architecture

- **Frontend**: Vue.js 3 + Vite (port 5000)
- **Backend**: Node.js + Express.js (port 3000)
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Socket.io for admin notifications
- **Auth**: JWT-based authentication

## Project Layout

```
/
├── frontend/          # Vue.js 3 app (Vite)
│   ├── src/
│   │   ├── views/     # Admin and student page components
│   │   ├── components/ # Reusable UI components
│   │   ├── services/api.js  # Axios HTTP client
│   │   └── router/    # Vue Router config
│   └── vite.config.js # Dev server: port 5000, proxy /api → localhost:3000
├── backend/           # Express.js API
│   └── src/
│       ├── app.js     # Entry point, Express + Socket.io setup
│       ├── config/    # DB and mailer config
│       ├── controllers/ # Business logic
│       ├── models/    # Mongoose schemas
│       ├── routes/    # API route definitions
│       └── middlewares/ # Auth (JWT) and upload (Multer)
└── uploads/           # File storage for materials
```

## Workflows

- **Start application**: `cd frontend && npm run dev` → serves on port 5000 (webview)
- **Backend API**: `cd backend && npm start` → serves on port 3000 (console)

## Required Secrets

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `EMAIL_USER` (optional) - SMTP email user for Nodemailer
- `EMAIL_PASS` (optional) - SMTP email password

## Deployment

Configured as autoscale deployment:
- Build: installs deps, builds Vue frontend
- Run: starts Node.js backend (serves API)

## Dev Notes

- Frontend Vite dev server proxies `/api` requests to backend at localhost:3000
- CORS allows localhost:5000 and localhost:5173 for development
- Socket.io is used for real-time admin notifications
