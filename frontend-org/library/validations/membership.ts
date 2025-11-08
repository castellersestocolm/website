import { z } from "zod";

/**
 * Membership Form Validation Schema
 * Using Zod for type-safe form validation
 */

// Phone validation - accepts international format
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Adult member schema
export const adultMemberSchema = z.object({
  firstname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number. Use format: +46XXXXXXXXX"),
});

// Child member schema
export const childMemberSchema = z.object({
  firstname: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastname: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  birthday: z
    .string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Invalid date")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age < 18; // Children must be under 18
    }, "Child must be under 18 years old"),
});

// Main membership form schema
export const membershipFormSchema = z
  .object({
    // Primary adult (required)
    adult1: adultMemberSchema,

    // Second adult (optional)
    adult2: adultMemberSchema.partial().optional(),

    // Children (array of up to 10)
    children: z.array(childMemberSchema).max(10, "Maximum 10 children allowed"),

    // Consent checkbox
    consentProcessing: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the data processing terms"
      ),
  })
  .refine(
    (data) => {
      // If adult2 has any field filled, all required fields must be filled
      if (data.adult2) {
        const hasAnyField = Object.values(data.adult2).some(
          (value) => value && value.trim() !== ""
        );
        if (hasAnyField) {
          const hasAllFields =
            data.adult2.firstname &&
            data.adult2.lastname &&
            data.adult2.email &&
            data.adult2.phone;
          return hasAllFields;
        }
      }
      return true;
    },
    {
      message: "If adding a second adult, all fields are required",
      path: ["adult2"],
    }
  );

export type MembershipFormData = z.infer<typeof membershipFormSchema>;
export type AdultMemberData = z.infer<typeof adultMemberSchema>;
export type ChildMemberData = z.infer<typeof childMemberSchema>;

// Base schema without refinements for extension
const membershipBaseSchema = z.object({
  adult1: adultMemberSchema,
  adult2: adultMemberSchema.partial().optional(),
  children: z.array(childMemberSchema).max(10, "Maximum 10 children allowed"),
  consentProcessing: z
    .boolean()
    .refine((val) => val === true, "You must accept the data processing terms"),
});

// Registration form schema (membership + account creation)
export const registrationFormSchema = membershipBaseSchema
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string().min(8, "Password must be at least 8 characters"),
    module: z.enum(["ORG", "TOWERS"]),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  })
  .refine(
    (data) => {
      // If adult2 has any field filled, all required fields must be filled
      if (data.adult2) {
        const hasAnyField = Object.values(data.adult2).some(
          (value) => value && value.trim() !== ""
        );
        if (hasAnyField) {
          const hasAllFields =
            data.adult2.firstname &&
            data.adult2.lastname &&
            data.adult2.email &&
            data.adult2.phone;
          return hasAllFields;
        }
      }
      return true;
    },
    {
      message: "If adding a second adult, all fields are required",
      path: ["adult2"],
    }
  );

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
