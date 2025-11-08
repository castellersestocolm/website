# Join Page API Implementation Analysis

**Date:** 2025-01-22  
**Status:** ❌ **CRITICAL ISSUES FOUND**

---

## 🎯 Executive Summary

The `/join` page registration flow has **critical missing fields** that will cause API errors. The backend expects more fields than the frontend currently collects.

### ✅ **RegisterForm Component: CONFIRMED REDUNDANT**

The `RegisterForm` component should be **removed** because:

1. ❌ Sends wrong field names (`first_name`/`last_name` instead of `firstname`/`lastname`)
2. ❌ Missing required backend fields (`phone`, `birthday`, `consent_pictures`)
3. ❌ Incomplete registration flow (doesn't handle family members)
4. ✅ Join page implements complete family + membership registration
5. ✅ Auth page already updated to link to `/join` instead of using RegisterForm tabs

**Recommendation:** Delete `/app/src/components/auth/RegisterForm.tsx` completely.

---

## 🔴 Critical Issues in Join Page

### **Issue 1: Missing Birthday Field for Adult1**

**Backend Requirement:**

```python
# backend/src/user/api/serializers.py (line 345-365)
class CreateSerializer(BaseSerializer):
    birthday = s.DateField(required=True)  # ❌ REQUIRED
```

**Current Frontend:**

- ✅ Validation schema NOW includes `birthday` (just fixed)
- ❌ Join page UI has NO birthday input field for adult1
- ❌ registerUserWithFamily API call does NOT send adult1 birthday

**Impact:** Registration will **fail with 400 Bad Request** - "This field is required"

---

### **Issue 2: Missing Consent Pictures Checkbox**

**Backend Requirement:**

```python
# backend/src/user/api/serializers.py (line 345-365)
class CreateSerializer(BaseSerializer):
    consent_pictures = s.BooleanField(required=True)  # ❌ REQUIRED
```

**Current Frontend:**

- ✅ Validation schema NOW includes `consentPictures` (just fixed)
- ❌ Join page UI has NO consent pictures checkbox
- ❌ registerUserWithFamily API call does NOT send consent_pictures

**Impact:** Registration will **fail with 400 Bad Request** - "This field is required"

---

### **Issue 3: Hardcoded Birthday for Partner**

**Current Code** (`app/[locale]/join/page.tsx` line 74):

```typescript
const partner = data.adult2 && (...) ? {
  firstname: data.adult2.firstname!,
  lastname: data.adult2.lastname!,
  birthday: "1990-01-01", // ❌ TODO: collect birthday for adults
  consent_pictures: true,
} : undefined;
```

**Problems:**

- ❌ Partner birthday is hardcoded to `1990-01-01`
- ❌ Join page UI has NO birthday field for adult2/partner
- ❌ Validation schema NOW requires birthday for adult2 (just fixed)

---

## ✅ What Was Fixed

### **1. API Service Layer** (`library/api/services/auth.ts`)

**Before:**

```typescript
export interface RegisterWithFamilyRequest {
  email: string;
  password: string;
  password2: string;
  module: string;
  // Missing: firstname, lastname, phone, birthday, consent_pictures
}

await apiClient.post("/user/", {
  email: data.email,
  password: data.password,
  password2: data.password2,
  // Missing required fields!
});
```

**After:**

```typescript
export interface RegisterWithFamilyRequest {
  firstname: string; // ✅ Added
  lastname: string; // ✅ Added
  email: string;
  phone: string; // ✅ Added
  birthday: string; // ✅ Added (ISO date YYYY-MM-DD)
  password: string;
  password2: string;
  consent_pictures: boolean; // ✅ Added
  module: string;
  partner?: CreateFamilyMemberData;
  children?: CreateFamilyMemberData[];
}

await apiClient.post("/user/", {
  email: data.email,
  firstname: data.firstname, // ✅ Added
  lastname: data.lastname, // ✅ Added
  phone: data.phone, // ✅ Added
  birthday: data.birthday, // ✅ Added
  password: data.password,
  password2: data.password2,
  consent_pictures: data.consent_pictures, // ✅ Added
  preferred_language: "sv", // ✅ Added (default Swedish)
  organisation: {}, // ✅ Added (module-specific)
  towers: {}, // ✅ Added (module-specific)
});
```

---

### **2. Validation Schema** (`library/validations/membership.ts`)

**Before:**

```typescript
export const adultMemberSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex),
  // ❌ Missing birthday field
});

export const registrationFormSchema = membershipBaseSchema.extend({
  password: z.string().min(8),
  password2: z.string().min(8),
  module: z.enum(["ORG", "TOWERS"]),
  // ❌ Missing consentPictures field
});
```

**After:**

```typescript
export const adultMemberSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex),
  birthday: z
    .string() // ✅ Added
    .refine((date) => !isNaN(new Date(date).getTime()), "Invalid date")
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 18; // Adults must be 18+
    }, "Adult must be 18 years or older"),
});

export const registrationFormSchema = membershipBaseSchema.extend({
  password: z.string().min(8),
  password2: z.string().min(8),
  module: z.enum(["ORG", "TOWERS"]),
  consentPictures: z
    .boolean() // ✅ Added
    .refine((val) => val === true, "You must accept the picture consent terms"),
});
```

---

## 🚨 Still Needs Fixing

### **1. Join Page UI - Add Birthday Fields**

**Location:** `app/[locale]/join/page.tsx`

**Required Changes:**

#### **Adult1 Birthday Field (after phone field, around line 267):**

```tsx
<div>
  <label className="mb-1 block text-sm font-medium">
    {t("form.birthday")} <span className="text-red-500">*</span>
  </label>
  <input
    type="date"
    {...register("adult1.birthday")}
    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
    max={new Date().toISOString().split("T")[0]} // Can't be future date
  />
  {errors.adult1?.birthday && (
    <p className="mt-1 text-sm text-red-500">
      {errors.adult1.birthday.message}
    </p>
  )}
</div>
```

#### **Adult2 Birthday Field (in partner section, after phone field around line 365):**

```tsx
<div>
  <label className="mb-1 block text-sm font-medium">{t("form.birthday")}</label>
  <input
    type="date"
    {...register("adult2.birthday")}
    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
    max={new Date().toISOString().split("T")[0]}
  />
  {errors.adult2?.birthday && (
    <p className="mt-1 text-sm text-red-500">
      {errors.adult2.birthday.message}
    </p>
  )}
</div>
```

---

### **2. Join Page UI - Add Consent Pictures Checkbox**

**Location:** `app/[locale]/join/page.tsx` (after consentProcessing checkbox, around line 490)

```tsx
{
  /* Picture Consent Checkbox */
}
<div className="flex items-start">
  <input
    type="checkbox"
    id="consentPictures"
    {...register("consentPictures")}
    className="mr-2 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
  <label htmlFor="consentPictures" className="text-sm text-gray-700">
    {t("form.consent_pictures")} <span className="text-red-500">*</span>
  </label>
</div>;
{
  errors.consentPictures && (
    <p className="mt-1 text-sm text-red-500">
      {errors.consentPictures.message}
    </p>
  );
}
```

---

### **3. Join Page - Update Form Submit Handler**

**Location:** `app/[locale]/join/page.tsx` lines 60-95

**Replace the onSubmit function:**

```typescript
const onSubmit = async (data: RegistrationFormData) => {
  setApiError(null);

  try {
    // Prepare partner data if second adult is filled
    const partner =
      data.adult2 &&
      (data.adult2.firstname ||
        data.adult2.lastname ||
        data.adult2.email ||
        data.adult2.phone ||
        data.adult2.birthday) // ✅ Check birthday too
        ? {
            firstname: data.adult2.firstname!,
            lastname: data.adult2.lastname!,
            birthday: data.adult2.birthday!, // ✅ Use actual birthday
            consent_pictures: true, // Partner consents for themselves
          }
        : undefined;

    // Prepare children array
    const children =
      data.children.length > 0
        ? data.children.map((child) => ({
            firstname: child.firstname,
            lastname: child.lastname,
            birthday: child.birthday,
            consent_pictures: false, // Children under 18 don't need consent
          }))
        : undefined;

    // Register user + create family (with ALL required fields)
    await registerUserWithFamily({
      firstname: data.adult1.firstname, // ✅ Send adult1 firstname
      lastname: data.adult1.lastname, // ✅ Send adult1 lastname
      email: data.adult1.email,
      phone: data.adult1.phone, // ✅ Send adult1 phone
      birthday: data.adult1.birthday, // ✅ Send adult1 birthday
      password: data.password,
      password2: data.password2,
      consent_pictures: data.consentPictures, // ✅ Send consent
      module: data.module,
      partner,
      children,
    });

    // Rest of payment logic...
  } catch (error) {
    // Error handling...
  }
};
```

---

### **4. Update defaultValues in useForm**

**Location:** `app/[locale]/join/page.tsx` lines 30-50

**Add missing default values:**

```typescript
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<RegistrationFormData>({
  resolver: zodResolver(registrationFormSchema),
  defaultValues: {
    adult1: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      birthday: "", // ✅ Add this
    },
    adult2: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      birthday: "", // ✅ Add this
    },
    children: [],
    consentProcessing: false,
    consentPictures: false, // ✅ Add this
    password: "",
    password2: "",
    module: "ORG",
  },
});
```

---

## 📝 Translation Keys Needed

**Add to** `public/locales/{en,sv,ca}/common.json`:

```json
{
  "membership": {
    "form": {
      "birthday": "Birthday / Födelsedatum / Data de naixement",
      "consent_pictures": "I consent to pictures being taken and used for promotional purposes / Jag samtycker till att bilder tas och används för marknadsföring / Accepto que es facin fotografies i s'utilitzin amb fins promocionals"
    }
  }
}
```

---

## 🎯 Summary of Required Actions

### **Immediate (Critical):**

1. ✅ **DONE:** Update `registerUserWithFamily` interface to include all required fields
2. ✅ **DONE:** Update `adultMemberSchema` to include birthday validation (18+ years)
3. ✅ **DONE:** Update `registrationFormSchema` to include consentPictures
4. ❌ **TODO:** Add birthday input field for adult1 in join page UI
5. ❌ **TODO:** Add birthday input field for adult2 in join page UI
6. ❌ **TODO:** Add consentPictures checkbox in join page UI
7. ❌ **TODO:** Update onSubmit handler to send adult1 data (firstname, lastname, phone, birthday, consent)
8. ❌ **TODO:** Update useForm defaultValues to include birthday and consentPictures
9. ❌ **TODO:** Add translation keys for birthday and consent_pictures

### **Cleanup (After Above Works):**

10. ❌ **TODO:** Delete `/app/src/components/auth/RegisterForm.tsx` (confirmed redundant)
11. ❌ **TODO:** Update `.github/copilot-instructions.md` to clarify registration flow uses `/join` only

---

## ✅ What's Correct in Join Page

1. ✅ Uses correct endpoint: `/user/` (singular, not plural)
2. ✅ Implements complete family registration flow
3. ✅ Handles partner + children with dynamic fields
4. ✅ Generates Swish QR code for payment
5. ✅ Uses proper validation with Zod schemas
6. ✅ Session-based login after registration
7. ✅ Error handling and API error display
8. ✅ Uses `registerUserWithFamily` service (now fixed to send all fields)

---

## 🔍 Backend API Reference

**Endpoint:** `POST /api/1.0/user/`

**Required Fields:**

```python
{
  "email": "user@example.com",           # EmailField (required)
  "firstname": "John",                   # CharField (required)
  "lastname": "Doe",                     # CharField (required)
  "phone": "+46701234567",               # PhoneNumberField (required)
  "birthday": "1990-01-15",              # DateField (required, YYYY-MM-DD)
  "password": "securepass123",           # CharField (required, min 8)
  "password2": "securepass123",          # CharField (required, must match)
  "consent_pictures": true,              # BooleanField (required)
  "preferred_language": "sv",            # CharField (optional, default sv)
  "organisation": {},                    # JSONField (module-specific)
  "towers": {}                           # JSONField (module-specific)
}
```

**Source:** `backend/src/user/api/serializers.py` lines 342-380

---

## 📚 Related Documentation

- **API Integration Guide:** `API_INTEGRATION.md`
- **Project Context:** `PROJECT_CONTEXT.md`
- **Membership Form Specs:** `MEMBERSHIP_FORM.md`
- **Backend Serializers:** `backend/src/user/api/serializers.py`
- **Backend Register Function:** `backend/src/user/api/__init__.py`

---

**Last Updated:** 2025-01-22  
**Status:** Awaiting UI field additions to complete fix
