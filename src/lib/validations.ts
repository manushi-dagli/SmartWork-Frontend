import { z } from "zod";

const EMAIL_MAX = 255;
const PHONE_MIN = 3;
const PHONE_MAX = 20;
/** Allow digits, optional leading +, spaces/dashes (align with backend) */
export const PHONE_REGEX = /^\+?[\d\s-]{3,20}$/;

const PHONE_COUNTRY_CODE_MAX = 3;
const PHONE_NUMBER_LEN = 10;

function emptyToNull(s: string | undefined): string | null {
  const t = typeof s === "string" ? s.trim() : "";
  return t === "" ? null : t;
}

/** Optional country code: optional leading +, 1–3 digits. Normalized to digits. */
export const optionalPhoneCountryCodeSchema = z
  .string()
  .transform((v) => {
    const s = (v ?? "").trim();
    if (s === "") return null as string | null;
    return s.replace(/^\++/, "") || null;
  })
  .refine(
    (v) =>
      v === null || (v.length >= 1 && v.length <= PHONE_COUNTRY_CODE_MAX && /^\d+$/.test(v)),
    { message: `Country code: 1–${PHONE_COUNTRY_CODE_MAX} digits (optional +)` }
  );

/** Optional phone number: exactly 10 digits when present */
export const optionalPhoneNumberSchema = z
  .string()
  .transform((v) => emptyToNull(v ?? undefined))
  .refine(
    (v) => v === null || (v.length === PHONE_NUMBER_LEN && /^\d{10}$/.test(v)),
    { message: `Phone number must be exactly ${PHONE_NUMBER_LEN} digits` }
  );

export function validateEmail(value: string): boolean {
  const t = value.trim();
  if (t === "") return true;
  return t.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function validatePhone(value: string): boolean {
  const t = value.trim();
  if (t === "") return true;
  return t.length >= PHONE_MIN && t.length <= PHONE_MAX && PHONE_REGEX.test(t);
}

/** Optional email schema (empty string allowed → treat as valid/empty) */
export const optionalEmailSchema = z
  .string()
  .transform((s) => (s?.trim() === "" ? null : s?.trim() ?? null))
  .refine((v) => v === null || (v.length <= EMAIL_MAX && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)), {
    message: "Invalid email address",
  });

/** Optional phone schema (empty string allowed) */
export const optionalPhoneSchema = z
  .string()
  .transform((s) => (s?.trim() === "" ? null : s?.trim() ?? null))
  .refine(
    (v) => v === null || (v.length >= PHONE_MIN && v.length <= PHONE_MAX && PHONE_REGEX.test(v)),
    { message: `Phone must be ${PHONE_MIN}-${PHONE_MAX} characters (digits, +, spaces allowed)` }
  );

/** Create inquiry form schema — two contact phones; second optional */
export const createInquiryFormSchema = z.object({
  assignmentTypeId: z.string().min(1, "Please select an inquiry type"),
  contactName: z.string().optional(),
  contactEmail: optionalEmailSchema.optional(),
  contactPhoneCountryCode: optionalPhoneCountryCodeSchema.optional(),
  contactPhoneNumber: optionalPhoneNumberSchema.optional(),
  contactPhone2CountryCode: optionalPhoneCountryCodeSchema.optional(),
  contactPhone2Number: optionalPhoneNumberSchema.optional(),
});

export type CreateInquiryFormValues = z.infer<typeof createInquiryFormSchema>;

/** Contact details (for inquiry detail save) — two contact phones; second optional */
export const contactDetailsSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: optionalEmailSchema.optional(),
  contactPhoneCountryCode: optionalPhoneCountryCodeSchema.optional(),
  contactPhoneNumber: optionalPhoneNumberSchema.optional(),
  contactPhone2CountryCode: optionalPhoneCountryCodeSchema.optional(),
  contactPhone2Number: optionalPhoneNumberSchema.optional(),
});

export type ContactDetailsValues = z.infer<typeof contactDetailsSchema>;
