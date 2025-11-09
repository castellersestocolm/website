# ComuniCAT AI Coding Agent Instructions

## Project Overview

Multi-tenant platform for two Catalan associations in Stockholm: **Casal català Les Quatre Barres (Org)** and **Castellers d'Estocolm (Towers)**. Manages memberships, events, payments, and human tower formations via a Django REST API backend with separate Next.js/React frontends.

## Architecture at a Glance

```
Backend (Django 5.1) → PostgreSQL/MySQL/Redis
├── REST API at /api/1.0/
├── Module system: ORG (10) vs TOWERS (20)
└── Session auth + CSRF tokens

Frontend-Org (Next.js 16 App Router) → Port 3100 [IN DEVELOPMENT]
Frontend-Towers (React/MUI) → Port 3200 [PRODUCTION]
Pinyator (PHP legacy) → MySQL → Port 8100
```

**Critical**: The codebase serves TWO organizations with shared backend logic but separate domains, branding, and configurations controlled via `MODULE_*` environment variables.

## Development Workflow

### Starting Services

```bash
# Build and start (from project root)
docker-compose build backend frontend-org frontend-towers
docker-compose up -d

# Backend migrations
docker exec -it website_backend_1 python manage.py migrate

# Check logs
docker-compose logs -f backend
```

**Ports**: Backend (8000), Frontend-Org (3100), Frontend-Towers (3200), Pinyator (8100), PostgreSQL (5432), MySQL (3306), Redis (6390)

### Frontend-Org Development (Current Focus)

```bash
cd frontend-org
npm install
npm run dev          # Local dev server on port 3000
npm run type-check   # TypeScript validation
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting
npm run build        # Production build (triggers in git pre-push hook)
```

**Key**: Frontend-Org uses Next.js 16 App Router with `next-intl` for i18n. Default locale is `sv` (Swedish). All pages use `app/[locale]/` structure.

## Critical Patterns & Conventions

### 1. Module-Based Multi-Tenancy

The backend uses an enum-based module system (`comunicat/enums.py`):

```python
class Module(IntEnum):
    ORG = 10      # Casal català Les Quatre Barres
    TOWERS = 20   # Castellers d'Estocolm
```

**Middleware** (`SessionMiddlewareDynamicDomain`) detects module from request `Origin` header:

- If `MODULE_ORG_DOMAIN` in origin → `request.module = Module.ORG`
- Else → `request.module = Module.TOWERS`

**Environment variables** control per-module behavior:

- `MODULE_ORG_DOMAIN=localhost:3100`
- `MODULE_TOWERS_DOMAIN=localhost:3200`
- `MODULE_ORG_MEMBERSHIP_CONFIG=1-150,2-250` (pricing tiers)
- `MODULE_ALL_CURRENCY=SEK`

**When writing backend code**: Always consider module context. Check `request.module` for conditional logic.

### 2. Session-Based Authentication + CSRF

**NOT JWT-based**. Uses Django sessions with cookies:

1. Login creates session → `sessionid` cookie set
2. Frontend sends credentials to `/api/1.0/user/login/` (note: endpoint is `user/login/`, not `auth/login/`)
3. Login payload must use field name `username` with the email value: `{ username: email, password }`
4. All subsequent requests include `sessionid` cookie + `X-CSRFToken` header
5. CSRF token extracted from `csrftoken` cookie (see `frontend-org/library/api/client.ts`)

**axios config** (`apiClient`):

```typescript
withCredentials: true  // Send cookies
headers: { 'X-CSRFToken': getCsrfToken() }  // For POST/PUT/PATCH/DELETE
```

**Dynamic cookie domains**: Backend middleware adjusts `sessionid` and `csrftoken` cookie domains based on request host (see `middleware.py` lines 24-62).

### 3. API Structure & Endpoints

Base URL: `http://localhost:8000/api/1.0/`

**Key endpoints** (from `backend/src/comunicat/rest/urls.py`):

- `user/` - User CRUD, profile pictures
- `user/family/` - Family management
- `membership/` - Membership subscriptions
- `event/` - Events with registration
- `payment/` - Payments & expenses
- `order/` - Order processing
- `legal/team/`, `legal/bylaws/` - Teams and legal docs
- `towers/castle/` - Human tower formations (Towers module only)

**Django apps** in `backend/src/`:

- `user/` - Auth, profiles, families
- `membership/` - Subscription management
- `event/` - Event scheduling & RSVP
- `payment/` - PayPal integration, expenses
- `order/` - Shopping cart & orders
- `legal/` - Teams, bylaws, documents
- `pinyator/` - Human towers integration
- `notify/` - Email & Slack notifications

### 4. Frontend-Org Technology Stack

**Framework**: Next.js 16.0.0 with App Router  
**React**: 19.2.0  
**Styling**: Tailwind CSS 4 + `tw-animate-css`  
**UI Components**: shadcn/ui (Radix UI primitives) in `components/ui/`  
**Forms**: `react-hook-form` + `@hookform/resolvers` + Zod validation  
**i18n**: `next-intl` with locale files in `public/locales/{en,sv,ca}/common.json`  
**Icons**: `lucide-react`  
**API Client**: axios in `library/api/client.ts`

**Path aliases**: `@/*` maps to project root (see `tsconfig.json`)

**Code quality enforcement**:

- Husky pre-push hook runs `npm run build`
- `lint-staged` runs Prettier + ESLint + TypeScript on commit

### 5. Form Validation Pattern (Frontend-Org)

Use Zod schemas in `library/validations/` + `react-hook-form`:

```typescript
// library/validations/membership.ts
export const registrationFormSchema = z.object({
  adult1: z.object({ firstname: z.string().min(1), ... }),
  password: z.string().min(8),
  ...
});

// In component
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(registrationFormSchema),
});
```

**See**: `app/[locale]/join/page.tsx` for full example with dynamic fields (partner, children).

### 6. API Service Layer (Frontend-Org)

Three-layer architecture:

1. **Client** (`library/api/client.ts`): Configured axios instance with CSRF interceptors
2. **Services** (`library/api/services/`): Typed functions per domain (auth, user, event, membership)
3. **Hooks/Context** (future): `useAuth`, `useApi` for React components

**Adding new endpoints**:

```typescript
// library/api/services/newfeature.ts
export async function getNewFeature(id: number): Promise<NewFeature> {
  const response = await apiClient.get<NewFeature>(`/newfeature/${id}/`);
  return response.data;
}

// Export from library/api/services/index.ts
export * from "./newfeature";
```

### 7. Internationalization (i18n)

**Backend**: Django's `gettext_lazy` with locale files in `backend/src/locale/{en,sv,ca}/`  
**Frontend-Org**: `next-intl` with default locale `sv` (Swedish)

**Usage in Next.js**:

```typescript
import { useTranslations } from "next-intl";

const t = useTranslations("membership");
return <h1>{t("title")}</h1>;
```

**Translation files**: `public/locales/{locale}/common.json`

**Locale routing**: All pages under `app/[locale]/` with locale parameter

### 8. Docker Development Environment

**Volume mounts** enable hot-reload:

```yaml
backend:
  volumes:
    - ./backend/src:/backend/src:cached

frontend-org:
  volumes:
    - ./frontend-org:/app:cached
    - /app/node_modules # Anonymous volume
    - /app/.next # Anonymous volume
```

**Environment file**: `envs/local.env` (shared by all services)

**CORS config**: `CORS_ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3100,http://localhost:3200`

### 9. Frontend-Towers vs Frontend-Org

**Towers (Production)**: Material-UI, React Router, CRA, established patterns  
**Org (In Development)**: Next.js, shadcn/ui, App Router, TypeScript strict mode

**DO NOT** mix patterns. When working on Frontend-Org:

- Use Next.js conventions (Server Components, `use client`, App Router)
- Use shadcn/ui components (not MUI)
- Use `next-intl` for translations (not `react-i18next`)

### 10. Unified Registration, Payment & Membership Flow

**Swedish currency**: SEK (kronor)  
**Payment method**: Swish QR codes (`qrcode` package in `join/page.tsx`)  
**Membership tiers**: From `MODULE_*_MEMBERSHIP_CONFIG` (e.g., `1-150,2-250`)

There is a SINGLE full registration form implemented in the reusable `JoinForm` component (`app/src/components/membership/JoinForm.tsx`), used on the `/join` page (`app/[locale]/join/page.tsx`). The old `RegisterForm` component has been removed; do NOT reintroduce it.

The authentication page `/[locale]/auth` renders the combined `AuthSwitchPanel` with two tabs: Login | Join. The Join tab embeds the full `JoinForm` (no separate quick registration path). This avoids duplicate logic while allowing users on the auth page to switch directly to the full membership form. All strings in `AuthSwitchPanel` and `JoinForm` must use `next-intl` translation keys under `membership.*` — avoid hard-coded text.

**Required backend user creation fields (CreateSerializer)**:

```
email, firstname, lastname, phone, birthday (YYYY-MM-DD), password, password2,
consent_pictures (boolean), preferred_language (default "sv"), organisation {}, towers {}
```

**Frontend service call (`registerUserWithFamily`) must send:**

```
{
  firstname, lastname, email, phone, birthday,
  password, password2,
  consent_pictures: consentPictures,
  module, partner?, children?
}
```

**Flow:**

1. User completes the `/join` form (adult1 mandatory; optional adult2 + children).
2. Form validation via Zod ensures birthdays, phone format, and consent.
3. `registerUserWithFamily` posts to `/user/` with all required fields.
4. On success, immediate login call to `/user/login/` using `{ username: email, password }`.
5. Partner and children are added via `/user/family/member/` endpoints.
6. A Swish payment QR code is generated client-side with amount derived from tier (individual vs family) and a reference.
7. User pays; backend (future webhook/integration) confirms and activates membership.

**Do NOT:**

- Omit required fields (especially `birthday`, `phone`, `consent_pictures`).
- Use `email` instead of `username` in login payload.
- Recreate or reuse the deprecated `RegisterForm` component.
- Add new hard-coded English strings to auth/registration flows without corresponding locale entries.
- Reintroduce a separate "Quick Join" flow duplicating the full form logic.

**Extending:** If adding new membership options (e.g. student tier), extend backend config & adjust payment calculation logic in `/join` page; keep service contract unchanged unless serializers change.

## Common Tasks

### Adding a New Page (Frontend-Org)

```bash
# Create page file
touch frontend-org/app/[locale]/newpage/page.tsx

# Add translations to public/locales/{en,sv,ca}/common.json
# Use "use client" directive if using React hooks
# Import translations: const t = useTranslations('newpage')
```

### Creating a shadcn/ui Component

```bash
cd frontend-org
npx shadcn@latest add button  # Installs to components/ui/button.tsx
```

### Adding Backend API Endpoint

1. Create serializer in app's `serializers.py`
2. Create viewset in app's `views.py`
3. Register in `comunicat/rest/urls.py` → `router.register(...)`
4. Add to frontend service layer (`library/api/services/`)

### Database Migrations

```bash
# Create migration
docker exec -it website_backend_1 python manage.py makemigrations

# Apply migrations
docker exec -it website_backend_1 python manage.py migrate

# Check migration status
docker exec -it website_backend_1 python manage.py showmigrations
```

### Debugging Backend

```bash
# Shell access
docker exec -it website_backend_1 python manage.py shell

# Django admin
# Navigate to http://localhost:8000/admin/
# Create superuser: docker exec -it website_backend_1 python manage.py createsuperuser
```

## Important Files Reference

- **Backend settings**: `backend/src/comunicat/settings.py`
- **API routes**: `backend/src/comunicat/rest/urls.py`
- **Middleware**: `backend/src/comunicat/middleware.py`
- **Module detection**: `backend/src/comunicat/utils/request.py`
- **Frontend-Org config**: `frontend-org/next.config.ts`, `frontend-org/tsconfig.json`
- **API client**: `frontend-org/library/api/client.ts`
- **Environment vars**: `envs/local.env`
- **Docker services**: `docker-compose.yml`
- **Project context**: `PROJECT_CONTEXT.md` (comprehensive architecture doc)

## Anti-Patterns to Avoid

❌ Hardcoding localhost URLs (use env vars: `NEXT_PUBLIC_API_BASE_URL`)  
❌ Mixing JWT auth patterns (this project uses sessions)  
❌ Using MUI components in Frontend-Org (use shadcn/ui)  
❌ Ignoring module context in backend logic  
❌ Skipping CSRF tokens on mutating requests  
❌ Creating migrations without testing rollback  
❌ Committing without running `npm run type-check` and linters

## Testing Strategy

**Backend**: Django test framework (not yet extensively implemented)  
**Frontend-Org**: Type-checking via TypeScript strict mode + ESLint. No test framework configured yet.

**Before committing**:

```bash
cd frontend-org
npm run type-check  # Must pass
npm run lint        # Must pass
npm run build       # Auto-runs on git pre-push
```

## Deployment Notes

**Production stack**: Docker Swarm with HAProxy load balancer  
**Container registry**: GitHub Container Registry (`ghcr.io/castellersestocolm`)  
**Email**: Postfix relay via Gmail SMTP  
**Build command**: `docker-compose -f docker-compose-prod.yml build`

See `docker-compose-prod.yml` and `PROJECT_CONTEXT.md` deployment section.

## Additional Resources

- **Full architecture**: See `PROJECT_CONTEXT.md` (~750 lines, last updated Nov 2025)
- **API integration guide**: `frontend-org/API_INTEGRATION.md`
- **Membership form specs**: `frontend-org/MEMBERSHIP_FORM.md`
- **Django docs**: https://docs.djangoproject.com/en/5.1/
- **Next.js docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com/
