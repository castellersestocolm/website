# Membership Form Implementation

## Overview

A complete membership registration form has been created for the frontend-org application with:

- ✅ **Zod validation** for type-safe form validation
- ✅ **React Hook Form** for efficient form handling
- ✅ **i18n support** with English, Catalan, and Swedish translations
- ✅ **Swish payment integration** with QR code generation
- ✅ **Family member support** (adults and children)
- ✅ **API integration** ready for backend communication

## Files Created

### 1. API Service Layer

**`lib/api/client.ts`**

- Axios instance with CSRF token handling
- Request/response interceptors
- Error handling utilities

**`lib/api/services/membership.ts`**

- `createMembership()` - Submit membership application
- TypeScript interfaces for request/response

**`lib/api/services/index.ts`**

- Central export for all API services

### 2. Validation Layer

**`lib/validations/membership.ts`**

- Zod schema for form validation
- Adult member schema (firstname, lastname, email, phone)
- Child member schema (firstname, lastname, birthday)
- Main membership form schema with custom validation rules
- TypeScript types exported from schemas

### 3. Form Component

**`app/[locale]/join/page.tsx`**

- Complete membership registration form
- Sections:
  - Primary adult (required)
  - Partner/second adult (optional, expandable)
  - Children (optional, expandable, max 10)
  - Consent checkbox
- Features:
  - Real-time validation with error messages
  - Dynamic field arrays for children
  - Swish payment QR code generation
  - Success state with payment instructions
  - Full i18n support

### 4. i18n Configuration

**`routing.ts`**

- Locale configuration (en, ca, sv)
- Default locale: en

**`i18n/request.ts`**

- next-intl request configuration
- Dynamic translation loading

**`middleware.ts`**

- next-intl middleware for locale routing
- Automatic locale detection

**`next.config.ts`**

- Updated with next-intl plugin

### 5. Translation Files

**`public/locales/en/common.json`**

- English translations for all form fields and messages

**`public/locales/ca/common.json`**

- Catalan translations (Català)

**`public/locales/sv/common.json`**

- Swedish translations (Svenska)

## Dependencies Installed

```json
{
  "dependencies": {
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "qrcode": "latest",
    "next-intl": "latest"
  },
  "devDependencies": {
    "@types/qrcode": "latest"
  }
}
```

## Form Validation Rules

### Adult Members

- **First Name**: 2-50 characters
- **Last Name**: 2-50 characters
- **Email**: Valid email format
- **Phone**: International format (e.g., +46XXXXXXXXX)

### Children

- **First Name**: 2-50 characters
- **Last Name**: 2-50 characters
- **Birthday**: Must be under 18 years old

### Additional Rules

- Primary adult is required
- Second adult: If any field is filled, all fields must be filled
- Children: Optional, maximum 10 children
- Consent checkbox must be checked

## Form Flow

1. **User fills form**
   - Primary adult information (required)
   - Optionally expand to add partner/second adult
   - Optionally expand to add children (up to 10)
   - Check consent checkbox

2. **Form validation**
   - Client-side validation using Zod schema
   - Real-time error messages
   - All validation rules enforced

3. **Form submission**
   - Data formatted according to API requirements
   - POST request to `/api/1.0/membership/create/`
   - Request includes:
     ```json
     {
       "adults": [
         {
           "firstname": "string",
           "lastname": "string",
           "email": "string",
           "phone": "string"
         }
       ],
       "children": [
         {
           "firstname": "string",
           "lastname": "string",
           "birthday": "YYYY-MM-DD"
         }
       ]
     }
     ```

4. **Payment display**
   - Success state shows:
     - Swish QR code for payment
     - Payment amount (150 SEK for individual, 250 SEK for family)
     - Payment reference
     - Step-by-step instructions
   - QR code format: `C<amount>;<reference>;<text>;0`

## Usage

### Access the form

Navigate to any of these URLs (depending on locale):

- `/en/join` - English
- `/ca/join` - Catalan
- `/sv/join` - Swedish

### Example: Adding validation to other forms

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 1. Define schema
const mySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

type MyFormData = z.infer<typeof mySchema>;

// 2. Use in component
function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
  });

  const onSubmit = (data: MyFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Backend API Requirements

The form expects the following backend endpoint:

**POST `/api/1.0/membership/create/`**

Request body:

```json
{
  "adults": [
    {
      "firstname": "string",
      "lastname": "string",
      "email": "string",
      "phone": "string"
    }
  ],
  "children": [
    {
      "firstname": "string",
      "lastname": "string",
      "birthday": "YYYY-MM-DD"
    }
  ]
}
```

Response (201 Created):

```json
{
  "success": true,
  "message": "Membership created successfully",
  "payment_amount": 250,
  "payment_reference": "2024-John-Doe"
}
```

Error response (400, 429, etc.):

```json
{
  "detail": "Error message"
}
```

## Testing

### Manual Testing Steps

1. **Start the dev server**

   ```bash
   npm run dev
   ```

2. **Navigate to the form**
   - Visit `http://localhost:3000/en/join`

3. **Test validation**
   - Try submitting empty form → See validation errors
   - Fill primary adult → Errors clear
   - Add second adult partially → See "all fields required" error
   - Add child with birthday > 18 years ago → See age validation error

4. **Test submission**
   - Fill valid data
   - Submit form
   - Should see payment screen with QR code (if backend is running)
   - If backend not running, will see API error

5. **Test i18n**
   - Change URL to `/ca/join` → See Catalan translations
   - Change URL to `/sv/join` → See Swedish translations
   - Use language switcher in header (if implemented)

### API Testing

To test with a mock backend response, you can temporarily modify the API service:

```typescript
// In lib/api/services/membership.ts
export async function createMembership(data: CreateMembershipRequest) {
  // Mock response for testing
  return new Promise<CreateMembershipResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Test membership created",
        payment_amount:
          data.adults.length === 1 && !data.children?.length ? 150 : 250,
        payment_reference: `2024-${data.adults[0].firstname}-${data.adults[0].lastname}`,
      });
    }, 1000);
  });
}
```

## Next Steps

1. **Backend Implementation**
   - Create Django endpoint at `/api/1.0/membership/create/`
   - Implement family member creation logic
   - Return payment information

2. **Form Enhancements**
   - Add loading spinner during submission
   - Add form field tooltips
   - Add phone number formatting
   - Add email verification

3. **Payment Integration**
   - Integrate with Swish API for real-time payment status
   - Add payment confirmation webhook
   - Send confirmation emails

4. **Testing**
   - Write unit tests for validation schema
   - Write integration tests for form submission
   - Add E2E tests with Playwright

## Troubleshooting

### Form validation not working

- Check that zod and @hookform/resolvers are installed
- Verify zodResolver is passed to useForm
- Check browser console for errors

### Translations not loading

- Verify next-intl is installed
- Check that locale files exist in `public/locales/{locale}/common.json`
- Verify middleware.ts is configured correctly
- Check next.config.ts has next-intl plugin

### API errors

- Check that API_BASE_URL is set in .env.local
- Verify backend is running
- Check browser Network tab for request/response
- Verify CSRF token is being sent (check request headers)

### QR code not generating

- Check that qrcode package is installed
- Verify payment data is being set correctly
- Check browser console for errors
