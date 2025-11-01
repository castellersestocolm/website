# ComuniCAT Project Context & Architecture Guide

**Last Updated:** November 1, 2025  
**Repository:** castellersestocolm/website  
**Current Branch:** test-nextjs-frontend-org

---

## 🎯 Project Overview

**ComuniCAT** is a comprehensive web platform for the Catalan association in Stockholm (Castellers d'Estocolm). It manages memberships, events, payments, human towers (castells), and community resources.

### Organization Structure

The project serves **two main organizations**:

1. **Castellers d'Estocolm (Towers)** - Human towers team
2. **Casal català Les Quatre Barres (Org)** - General Catalan cultural association

---

## 🏗️ Architecture Overview

### Multi-Service Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HAProxy / Nginx                        │
└────────┬────────────┬────────────┬────────────┬──────────────┘
         │            │            │            │
    ┌────▼────┐  ┌───▼───┐   ┌───▼────┐  ┌────▼─────┐
    │ Backend │  │ FE-Org│   │FE-Towers│  │ Pinyator │
    │ Django  │  │Next.js│   │ React   │  │   PHP    │
    └────┬────┘  └───────┘   └────────┘  └────┬─────┘
         │                                      │
    ┌────▼──────┐                          ┌───▼────┐
    │PostgreSQL │                          │ MySQL  │
    │ (main DB) │                          │ (pins) │
    └───────────┘                          └────────┘
         │
    ┌────▼────┐
    │  Redis  │
    │ (cache) │
    └─────────┘
```

---

## 📦 Service Breakdown

### 1. Backend (Django REST API)

**Location:** `/backend/`  
**Tech Stack:**

- **Framework:** Django 5.1.13
- **Database:** PostgreSQL 17.2 + MySQL 8.4 (for Pinyator)
- **Cache/Queue:** Redis 7 + Celery 5.4
- **API:** Django REST Framework 3.15
- **Documentation:** drf-yasg (Swagger/OpenAPI)
- **Image Processing:** Pillow 12.0, django-versatileimagefield
- **Payments:** PayPal SDK, django-money
- **Auth:** Django Sessions + Google OAuth2 (social-auth)
- **Task Queue:** Celery with beat scheduler
- **Monitoring:** Sentry SDK, Django Silk (dev)

**Key Features:**

- Multi-module architecture (Org/Towers separation)
- RESTful API with versioning (1.0)
- Session-based authentication with OAuth2 support
- File storage with signed URLs for private media
- Background task processing (emails, notifications)
- Internationalization (English, Swedish, Catalan)
- Throttling and rate limiting on sensitive endpoints

**Django Apps Structure:**

```
backend/src/
├── comunicat/         # Core settings, middleware, utils
├── user/              # User management, authentication
├── membership/        # Membership management
├── event/             # Event scheduling and registration
├── order/             # Order processing
├── payment/           # Payment integration (PayPal)
├── product/           # Product catalog
├── legal/             # Teams, bylaws, legal documents
├── document/          # Document management
├── media/             # Media file handling
├── notify/            # Notifications (email, Slack)
├── pinyator/          # Human towers (castells) integration
├── data/              # Data models and migrations
└── integration/       # Third-party integrations (Google)
```

**Environment Configuration:**

- Module-based configuration (ORG vs TOWERS)
- Dynamic domain/cookie handling for multi-frontend
- Configurable membership periods and pricing
- Google Calendar/Photos integration flags
- Slack notifications for orders

**API Endpoints:** `http://localhost:8000/api/1.0/`

---

### 2. Frontend-Org (Next.js - NEW)

**Location:** `/frontend-org/`  
**Status:** 🚧 **In Development** (Your current work)  
**Tech Stack:**

- **Framework:** Next.js 16.0.0 (App Router)
- **React:** 19.2.0
- **Styling:** Tailwind CSS 4 + tw-animate-css
- **UI Components:** shadcn/ui with Radix UI
- **Icons:** lucide-react
- **TypeScript:** 5.x (Strict mode)
- **Dev Tools:**
  - Husky 9.1.7 (Git hooks)
  - Prettier 3.6.2 (Code formatting)
  - ESLint 9 (Linting)
  - lint-staged (Pre-commit checks)

**Project Structure:**

```
frontend-org/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (Geist fonts)
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── favicon.ico
├── components/
│   └── ui/                # shadcn/ui components
├── library/               # Shared utilities
├── stories/               # Storybook stories
├── .storybook/            # Storybook config
├── .husky/                # Git hooks
│   └── pre-push          # Runs build before push
├── next.config.ts         # Next.js config (standalone output)
├── tsconfig.json          # TypeScript config
└── package.json
```

**Configuration:**

- **Output:** Standalone (optimized for Docker)
- **Fonts:** Geist Sans + Geist Mono (Google Fonts)
- **Path Aliases:** `@/*` maps to root directory
- **Build Target:** ES2017

**Development Ports:**

- Dev Server: `http://localhost:3100` (mapped from container port 3000)
- Storybook: Port 6006

**Current Features:**

- Basic Next.js setup with App Router
- shadcn/ui component library integrated
- Tailwind CSS with animations
- TypeScript strict mode
- Git pre-push hook for builds
- Storybook for component development

---

### 3. Frontend-Towers (React CRA)

**Location:** `/frontend-towers/app/`  
**Status:** ✅ **Production** (Existing application)  
**Tech Stack:**

- **Framework:** Create React App (react-scripts 5.0.1)
- **React:** 19.0.0
- **UI Library:** Material-UI (MUI) 7.1.0
- **Routing:** React Router DOM 7.1.3
- **Charts:** MUI X-Charts 8.7.0
- **Data Grid:** MUI X-Data Grid 8.5.2
- **Maps:** Leaflet 1.9.4 + react-leaflet 5.0.0
- **i18n:** react-i18next 15.4.0
- **HTTP:** Axios 1.8.2
- **Payments:** PayPal React SDK 8.8.3
- **Styling:** Emotion + DM Sans/Mono fonts
- **Date Handling:** date-fns 3.6.0
- **TypeScript:** 5.7.3

**Project Structure:**

```
frontend-towers/app/src/
├── pages/                 # Page components
│   ├── home.tsx
│   ├── calendar.tsx
│   ├── user-login.tsx
│   ├── user-dashboard.tsx
│   ├── admin.tsx
│   └── ...
├── components/           # Reusable components
│   ├── NavBar/
│   ├── Footer/
│   └── AppContext/
├── api/                  # API client functions
├── themes/               # MUI theme configuration
├── translations/         # i18n JSON files (en, sv, ca)
├── utils/                # Utility functions
├── routes.ts             # Route definitions
├── App.tsx               # Main app component
└── index.js              # Entry point
```

**Key Features:**

- Comprehensive member management
- Event calendar with registration
- Admin panels for attendance and equipment
- Order/payment flow with cart
- Press releases and documentation
- QR code generation
- Responsive design with Material-UI
- Multi-language support (EN, SV, CA)

**Development Port:** `http://localhost:3200`

---

### 4. Pinyator (PHP Legacy)

**Location:** `/pinyator/src/`  
**Tech Stack:**

- **Language:** PHP 8.x
- **Database:** MySQL 8.4.4
- **Server:** Nginx + PHP-FPM
- **Legacy:** Classic PHP (no framework)

**Purpose:**

- Legacy system for managing human tower (castell) formations
- Stores position data, statistics, and historical records
- Integrated with main backend via MySQL database connection
- Used by the Towers organization

**Development Port:** `http://localhost:8100`

---

## 🗄️ Database Architecture

### PostgreSQL (Main Database)

**Container:** `database`  
**Version:** 17.2  
**Port:** 5432  
**Database Name:** `comunicat`

**Managed by Django Apps:**

- Users and authentication
- Memberships and payments
- Events and registrations
- Orders and products
- Documents and media
- Teams and legal entities
- Notifications

### MySQL (Pinyator Database)

**Container:** `mysql`  
**Version:** 8.4.4  
**Port:** 3306  
**Database Name:** `pinyator`

**Purpose:** Legacy castell (human tower) data

### Redis

**Container:** `redis`  
**Version:** 7-alpine  
**Port:** 6390 (mapped from 6379)

**Usage:**

- Session storage
- Celery message broker
- Cache backend
- Real-time data

---

## 🔧 Development Setup

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js v21.6.2+ (for frontend development)

### Quick Start

```bash
# 1. Build all containers
docker-compose build backend frontend-towers frontend-org

# 2. Start services
docker-compose up -d

# 3. Run database migrations
docker exec -it website_backend_1 python manage.py migrate

# 4. Create superuser (optional)
docker exec -it website_backend_1 python manage.py createsuperuser

# 5. Access services
# Backend API:      http://localhost:8000
# Frontend Org:     http://localhost:3100
# Frontend Towers:  http://localhost:3200
# Pinyator:         http://localhost:8100
# PostgreSQL:       localhost:5432
# MySQL:            localhost:3306
# Redis:            localhost:6390
```

### Frontend-Org Development (Your Work)

```bash
cd frontend-org

# Install dependencies
npm install

# Run development server
npm run dev              # Starts on port 3000 (or PORT env var)

# Code quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript check without emit

# Build
npm run build           # Production build
npm start               # Serve production build

# Storybook (if configured)
npm run storybook       # Component documentation
```

### Environment Variables

See `/envs/local.env` for local development configuration

Key variables:

- `DEBUG=True`
- `ALLOWED_HOSTS=localhost`
- `CORS_ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3100,http://localhost:3200`
- `MODULE_ORG_ENABLED=true`
- `MODULE_TOWERS_ENABLED=true`
- API URLs for React apps

---

## 🔌 API Integration

### Backend API Base

```
http://localhost:8000/api/1.0/
```

### Key Endpoints

- `/user/` - User management
- `/membership/` - Membership CRUD
- `/event/` - Event management
- `/order/` - Order processing
- `/payment/` - Payment handling
- `/document/` - Document access
- `/legal/` - Teams and bylaws

### Authentication

- **Method:** Session-based (CSRF tokens required)
- **Cookies:** `sessionid`, `csrftoken`
- **OAuth2:** Google Sign-In available
- **CORS:** Enabled for configured origins

### Request Headers

```
X-CSRFToken: <token>
Content-Type: application/json
```

---

## 🎨 Frontend-Org Design System

### Styling Approach

- **Framework:** Tailwind CSS 4
- **Components:** shadcn/ui (Radix UI primitives)
- **Animations:** tw-animate-css
- **Typography:** Geist Sans (body), Geist Mono (code)

### Component Library

Located in `/frontend-org/components/ui/`:

- Built on Radix UI primitives
- Fully accessible (WCAG compliant)
- Customizable with Tailwind
- Type-safe with TypeScript

### File Structure Convention

```
components/
├── ui/                  # Base UI components (shadcn)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── [feature]/          # Feature-specific components
│   ├── Header.tsx
│   └── Footer.tsx
└── shared/             # Shared utilities
```

---

## 🧪 Testing & Quality

### Frontend-Org

- **Git Hooks:** Husky pre-push runs build
- **Linting:** ESLint 9 with Next.js config
- **Formatting:** Prettier with lint-staged
- **Type Checking:** TypeScript strict mode
- **Storybook:** Component documentation (in setup)

### Backend

- **Testing:** Django test framework
- **Debugging:** Django Debug Toolbar (dev)
- **Profiling:** Django Silk (dev)
- **Monitoring:** Sentry SDK (production)

---

## 📊 Module System

The backend uses a **modular architecture** to separate ORG and TOWERS organizations:

### Module Configuration (Environment Variables)

```bash
MODULE_DEFAULT=org                          # Default module
MODULE_ORG_ENABLED=true                     # Enable Org module
MODULE_TOWERS_ENABLED=true                  # Enable Towers module

# Org-specific
MODULE_ORG_NAME="Casal català Les Quatre Barres"
MODULE_ORG_DOMAIN=localhost:3100
MODULE_ORG_MEMBERSHIP_CONFIG=1-150,2-250    # Pricing tiers

# Towers-specific
MODULE_TOWERS_NAME="Castellers d'Estocolm"
MODULE_TOWERS_DOMAIN=localhost:3200
MODULE_TOWERS_USER_FIELDS=alias,height_shoulders,height_arms
MODULE_TOWERS_MEMBERSHIP_CONFIG=1-250,2-450
```

### Module Features

- Separate domains and branding
- Different user field requirements
- Custom membership pricing
- Organization-specific notifications
- Module-based feature flags

---

## 🐳 Docker Configuration

### Services Overview

| Service         | Image         | Ports | Purpose               |
| --------------- | ------------- | ----- | --------------------- |
| backend         | Django        | 8000  | REST API              |
| frontend-org    | Next.js       | 3100  | Org frontend (NEW)    |
| frontend-towers | React         | 3200  | Towers frontend       |
| pinyator        | PHP/Nginx     | 8100  | Legacy castell system |
| database        | PostgreSQL 17 | 5432  | Main DB               |
| mysql           | MySQL 8.4     | 3306  | Pinyator DB           |
| redis           | Redis 7       | 6390  | Cache/Queue           |
| worker          | Celery        | -     | Background tasks      |
| beat            | Celery Beat   | -     | Scheduled tasks       |

### Volume Mounts

```yaml
backend:
  - ./backend/src:/backend/src
  - ./backend/media:/backend/media
  - ./backend/media-private:/backend/media-private

frontend-org:
  - ./frontend-org:/app
  - /app/node_modules # Anonymous volume
  - /app/.next # Anonymous volume

frontend-towers:
  - ./frontend-towers/app:/frontend-towers
```

---

## 🌐 Internationalization

### Supported Languages

1. **English (en)** - Default
2. **Swedish (sv)** - Primary for Swedish users
3. **Catalan (ca)** - For Catalan community

### Backend i18n

- Django translation framework
- Locale files in `/backend/src/locale/`
- Translation strings with `gettext_lazy`

### Frontend i18n

- **Towers:** react-i18next with JSON translation files
- **Org:** TBD (likely Next.js i18n or react-i18next)

---

## 🔐 Security Considerations

### Backend

- CSRF protection enabled
- Session cookies with `HttpOnly` and `Secure` flags (production)
- Dynamic cookie domains for multi-frontend setup
- CORS configured for specific origins
- Rate limiting on sensitive endpoints (login, registration, password reset)
- Signed URLs for private media access

### Frontend

- TypeScript strict mode for type safety
- ESLint security rules
- Environment variable validation
- CSP headers (to be configured)

---

## 📝 Important File Locations

### Configuration Files

- `/docker-compose.yml` - Local development services
- `/docker-compose-prod.yml` - Production deployment
- `/envs/local.env` - Environment variables
- `/backend/src/comunicat/settings.py` - Django settings
- `/frontend-org/next.config.ts` - Next.js config
- `/frontend-towers/app/src/consts.tsx` - React constants

### Documentation

- `/README.md` - Project README
- `/LICENSE` - License information
- `/Makefile` - Build automation

---

## 🚀 Deployment

### Production Stack

- Docker Swarm
- GitHub Container Registry (ghcr.io)
- HAProxy load balancer
- PostgreSQL with persistent volumes
- Redis for caching
- Postfix for email relay (Gmail SMTP)

### Build & Deploy

```bash
# Build images
docker-compose -f docker-compose-prod.yml build

# Tag and push to registry
docker tag backend ghcr.io/castellersestocolm/backend:latest
docker push ghcr.io/castellersestocolm/backend:latest

# Deploy stack
docker stack deploy --compose-file docker-compose-prod.yml comunicat
```

---

## 🎯 Your Current Work (Frontend-Org)

### Status

✅ Next.js 16 with App Router  
✅ Tailwind CSS 4 configured  
✅ shadcn/ui component library  
✅ TypeScript strict mode  
✅ Husky pre-push hooks  
✅ Basic page structure  
🚧 Storybook setup in progress  
🚧 Component library expansion  
🚧 API integration  
🚧 Authentication flow  
🚧 Feature pages

### Next Steps Recommendations

1. **API Client Setup** - Create axios instance with CSRF handling
2. **Authentication** - Implement login/logout with session management
3. **Layout Components** - Header, Footer, Navigation
4. **Page Templates** - Create reusable page layouts
5. **State Management** - Consider React Context or Zustand
6. **Form Handling** - react-hook-form integration
7. **Data Fetching** - Implement Next.js data fetching patterns
8. **Testing** - Add Jest/Vitest and React Testing Library

### Tech Decisions to Consider

- **State Management:** React Context vs. Zustand vs. Redux Toolkit
- **Forms:** react-hook-form vs. Formik
- **Data Fetching:** Next.js native vs. React Query/SWR
- **Animation:** Framer Motion vs. React Spring
- **Charts:** Recharts vs. Chart.js vs. MUI X-Charts (for consistency with Towers)

---

## 📚 Key Dependencies Reference

### Backend (Python)

```python
Django==5.1.13
djangorestframework==3.15.2
psycopg2-binary==2.9.11      # PostgreSQL
mysqlclient==2.2.7            # MySQL
celery==5.4.0                 # Task queue
redis==5.2.1                  # Cache
django-cors-headers==4.6.0    # CORS
drf-yasg==1.21.11            # API docs
social-auth-app-django==5.4.3 # OAuth2
paypal-server-sdk==1.1.0      # Payments
sentry-sdk==2.25.1            # Monitoring
```

### Frontend-Org (npm)

```json
{
  "next": "16.0.0",
  "react": "19.2.0",
  "tailwindcss": "^4",
  "@radix-ui/react-slot": "^1.2.3",
  "lucide-react": "^0.548.0",
  "typescript": "^5"
}
```

### Frontend-Towers (npm)

```json
{
  "react": "19.0.0",
  "@mui/material": "^7.1.0",
  "react-router-dom": "7.1.3",
  "axios": "1.8.2",
  "react-i18next": "^15.4.0",
  "leaflet": "^1.9.4"
}
```

---

## 🤝 Contribution Guidelines

### Branch Strategy

- `main` - Production-ready code
- `test-nextjs-frontend-org` - Your current development branch for Next.js frontend
- Feature branches: `feature/[feature-name]`

### Commit Conventions

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tool changes

### Code Review

- Ensure all tests pass
- Run linting and formatting
- Update documentation if needed
- Check for TypeScript errors

---

## 🆘 Common Issues & Solutions

### Docker Issues

**Issue:** Containers won't start  
**Solution:** Check ports aren't already in use: `docker-compose down && docker-compose up -d`

**Issue:** Database connection errors  
**Solution:** Ensure database container is fully started before backend

### Frontend-Org Issues

**Issue:** TypeScript errors  
**Solution:** Run `npm run type-check` and fix errors. Check `tsconfig.json` settings.

**Issue:** Tailwind classes not working  
**Solution:** Check `globals.css` imports Tailwind directives. Restart dev server.

**Issue:** Module not found  
**Solution:** Verify path aliases in `tsconfig.json`. Check file extensions (.ts, .tsx, .js).

### Backend Issues

**Issue:** CSRF token errors  
**Solution:** Ensure `csrftoken` cookie is sent with requests. Check CORS settings.

**Issue:** Migration conflicts  
**Solution:** `docker exec -it website_backend_1 python manage.py migrate`

---

## 📞 Resources & Links

### Documentation

- **Django:** https://docs.djangoproject.com/en/5.1/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **React:** https://react.dev/
- **Material-UI:** https://mui.com/

### Project Repositories

- Main Repo: castellersestocolm/website
- Container Registry: ghcr.io/castellersestocolm

---

## 📅 Version History

### Current Version (November 2025)

- ✅ Backend: Django 5.1.13 stable
- ✅ Frontend-Towers: React 19 with MUI 7
- 🚧 Frontend-Org: Next.js 16 in development
- ✅ Pinyator: PHP legacy system maintained

### Recent Updates

- Migrated Frontend-Org from React CRA to Next.js 16
- Upgraded Material-UI to v7 in Towers frontend
- PostgreSQL upgraded to 17.2
- Added Storybook support for component documentation
- Implemented Husky git hooks for code quality

---

**End of Document**

This guide should be referenced whenever you need to understand the project structure, tech stack, or make architectural decisions. Update this document as the project evolves.
