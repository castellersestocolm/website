# API Integration Guide

This document describes the API integration architecture for the frontend-org Next.js application.

## Architecture Overview

The API integration follows a three-layer architecture:

1. **API Client Layer** (`lib/api/client.ts`)
   - Configured axios instance
   - CSRF token handling
   - Request/response interceptors
   - Error handling

2. **API Services Layer** (`lib/api/services/`)
   - Typed API functions
   - Organized by domain (auth, user, event, etc.)
   - Type-safe request/response handling

3. **React Context/Hooks Layer** (`app/src/contexts/`, `app/src/hooks/`)
   - AuthContext for global authentication state
   - useAuth hook for components
   - useApi hook for generic API calls

## Directory Structure

```
frontend-org/
├── lib/
│   └── api/
│       ├── client.ts              # Axios instance with interceptors
│       └── services/
│           ├── index.ts           # Central export
│           ├── auth.ts            # Authentication endpoints
│           ├── user.ts            # User profile endpoints
│           └── event.ts           # Event endpoints
├── types/
│   └── api.ts                     # TypeScript type definitions
└── app/
    └── src/
        ├── contexts/
        │   └── AuthContext.tsx    # Authentication context
        └── hooks/
            └── useApi.ts          # Generic API hook
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/1.0
```

### Authentication

The application uses **session-based authentication** with CSRF protection:

- Cookies are sent automatically with `withCredentials: true`
- CSRF tokens are extracted from cookies and sent in `X-CSRFToken` header
- Session is restored automatically on page load

## Usage Examples

### 1. Authentication with useAuth

```tsx
"use client";

import { useAuth } from "@/app/src/contexts/AuthContext";

export default function MyComponent() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: "user@example.com", password: "password" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={handleLogin}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.first_name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. API Calls with useApi Hook

```tsx
"use client";

import { useEffect } from "react";
import { useApi } from "@/app/src/hooks/useApi";
import { getEvents } from "@/lib/api/services";

export default function EventsList() {
  const { data, loading, error, execute } = useApi(getEvents);

  useEffect(() => {
    execute({ page: 1, page_size: 10 });
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <ul>
      {data.results.map((event) => (
        <li key={event.id}>{event.title}</li>
      ))}
    </ul>
  );
}
```

### 3. Direct API Service Calls

```tsx
import { getCurrentUser, updateUserProfile } from "@/lib/api/services";

async function updateProfile() {
  try {
    const user = await getCurrentUser();
    const updated = await updateUserProfile(user.id, {
      first_name: "John",
      last_name: "Doe",
    });
    console.log("Profile updated:", updated);
  } catch (error) {
    console.error("Update failed:", error);
  }
}
```

### 4. File Upload

```tsx
import { uploadProfilePicture } from "@/lib/api/services";

async function handleFileUpload(file: File, userId: number) {
  try {
    const updatedUser = await uploadProfilePicture(userId, file);
    console.log("Profile picture updated:", updatedUser.profile_picture);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

## API Services

### Authentication (`lib/api/services/auth.ts`)

- `loginUser(credentials)` - Login with username/password
- `logoutUser()` - Logout current user
- `getCurrentUser()` - Get current authenticated user
- `registerUser(data)` - Register new user
- `requestPasswordReset(data)` - Request password reset email
- `confirmPasswordReset(data)` - Confirm password reset with token
- `loginWithGoogle()` - Redirect to Google OAuth2

### User (`lib/api/services/user.ts`)

- `getUserProfile(userId)` - Get user profile by ID
- `updateUserProfile(userId, data)` - Update user profile
- `uploadProfilePicture(userId, file)` - Upload profile picture
- `changePassword(data)` - Change user password

### Events (`lib/api/services/event.ts`)

- `getEvents(params)` - Get paginated list of events
- `getEvent(id)` - Get single event
- `createEvent(data)` - Create new event
- `updateEvent(id, data)` - Update event
- `deleteEvent(id)` - Delete event
- `registerForEvent(eventId)` - Register for event
- `unregisterFromEvent(eventId)` - Unregister from event

## Type Definitions

All API types are defined in `types/api.ts`:

- `User` - User model
- `Event` - Event model
- `Membership` - Membership model
- `Order` - Order model
- `Product` - Product model
- `Document` - Document model
- `PaginatedResponse<T>` - Generic paginated response
- `ApiResponse<T>` - Generic API response wrapper

## Error Handling

Errors are handled at multiple levels:

1. **Axios Interceptor** - Logs errors and handles common HTTP status codes
2. **Service Functions** - Catch and throw formatted error messages
3. **React Hooks** - Store error state for component display

```tsx
// Error handling in components
const { error } = useAuth();

if (error) {
  return <div className="error">{error}</div>;
}
```

## Adding New API Endpoints

To add new endpoints:

1. **Add types** to `types/api.ts`:

```typescript
export interface NewModel {
  id: number;
  name: string;
  // ...
}
```

2. **Create service file** `lib/api/services/newmodel.ts`:

```typescript
import { apiClient, getApiErrorMessage } from "../client";
import type { NewModel } from "@/types/api";

export async function getNewModels(): Promise<NewModel[]> {
  try {
    const response = await apiClient.get<NewModel[]>("/newmodels/");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
```

3. **Export from index** `lib/api/services/index.ts`:

```typescript
export * from "./newmodel";
```

4. **Use in components**:

```tsx
import { getNewModels } from "@/lib/api/services";
```

## Testing the Integration

### 1. Start the Backend

```bash
cd /Users/david/Documents/website
docker-compose up backend
```

Backend will be available at `http://localhost:8000`

### 2. Start the Frontend

```bash
cd /Users/david/Documents/website/frontend-org
npm run dev
```

Frontend will be available at `http://localhost:3100`

### 3. Test Login

Visit `http://localhost:3100/login` and use backend credentials to test authentication.

### 4. Check Network Tab

Open browser DevTools > Network tab to verify:

- API calls go to `http://localhost:8000/api/1.0/`
- Cookies are sent with requests
- CSRF token is included in POST/PUT/PATCH/DELETE requests

## Troubleshooting

### CSRF Token Issues

If you get 403 Forbidden errors:

1. Check that cookies are being set by the backend
2. Verify `withCredentials: true` in axios config
3. Ensure CSRF token is being extracted from cookies

### CORS Issues

If you get CORS errors:

1. Verify backend CORS settings allow frontend origin
2. Check that credentials are allowed in CORS config
3. Ensure cookies are sent with requests

### Authentication Not Persisting

If user is logged out on page refresh:

1. Check that session cookies have correct domain/path
2. Verify cookies are not being blocked by browser
3. Ensure backend session middleware is configured

## Next Steps

- Add remaining API services (membership, order, payment, etc.)
- Implement request caching/deduplication
- Add retry logic for failed requests
- Create React Query integration for advanced caching
- Add request/response logging in development
- Implement refresh token mechanism if needed
