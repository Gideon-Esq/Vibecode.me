import { z } from "zod";
import { PROGRAMME } from "@/lib/constants";

/* ────────────────────────────────────────────────────────────
 * Option lists (shared by the form UI and server validation)
 * ──────────────────────────────────────────────────────────── */

export const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

/** Common Nigerian institutions (host first). "Other" reveals a free-text field. */
export const INSTITUTIONS = [
  "Obafemi Awolowo University (OAU), Ile-Ife",
  "University of Ibadan (UI)",
  "University of Lagos (UNILAG)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU), Zaria",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "University of Port Harcourt (UNIPORT)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMINNA)",
  "Federal University of Technology, Owerri (FUTO)",
  "Federal University of Agriculture, Abeokuta (FUNAAB)",
  "University of Abuja (UNIABUJA)",
  "Bayero University, Kano (BUK)",
  "University of Calabar (UNICAL)",
  "University of Jos (UNIJOS)",
  "Nnamdi Azikiwe University (UNIZIK), Awka",
  "University of Maiduguri (UNIMAID)",
  "Usmanu Danfodiyo University, Sokoto (UDUS)",
  "Lagos State University (LASU)",
  "Ekiti State University (EKSU)",
  "Olabisi Onabanjo University (OOU)",
  "Ladoke Akintola University of Technology (LAUTECH)",
  "Osun State University (UNIOSUN)",
  "Adekunle Ajasin University (AAUA)",
  "Tai Solarin University of Education (TASUED)",
  "Emmanuel Alayande University of Education",
  "Other",
] as const;

export const INSTITUTION_OTHER = "Other";

export const LEVELS = [
  "100L",
  "200L",
  "300L",
  "400L",
  "500L",
  "Postgraduate",
] as const;

/**
 * Attendee roles. Self-registration is always STUDENT; the other roles are
 * assigned by an admin. Kept here so the admin UI can label/filter them.
 */
export const ATTENDEE_ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "LECTURER", label: "Lecturer" },
  { value: "PARLIAMENTARIAN", label: "Student Parliamentarian" },
  { value: "PRESS", label: "Press" },
  { value: "GUEST", label: "Guest" },
] as const;

export const ATTENDEE_ROLE_VALUES = ATTENDEE_ROLES.map((r) => r.value) as [
  string,
  ...string[],
];

export const HEARD_ABOUT_OPTIONS = [
  "Social Media",
  "Flyer",
  "Friend",
  "Department Notice Board",
  "Other",
] as const;

/** The 7 programme segments offered as session interests. */
export const SESSIONS = PROGRAMME.map((p) => p.title) as [string, ...string[]];

/* ────────────────────────────────────────────────────────────
 * Schemas
 * ──────────────────────────────────────────────────────────── */

const NIGERIAN_PHONE = /^0\d{10}$/; // 11 digits, leading 0 (e.g. 08126540417)

/** Server-side schema — exactly the data persisted to the Registration table. */
export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(NIGERIAN_PHONE, "Enter a valid 11-digit phone number (e.g. 08123456789)"),
  gender: z.enum(GENDERS, { message: "Please select your gender" }),
  institution: z
    .string()
    .trim()
    .min(2, "Please enter your institution")
    .max(160, "Institution name is too long"),
  department: z
    .string()
    .trim()
    .min(2, "Please enter your department or faculty")
    .max(160, "Department name is too long"),
  level: z.enum(LEVELS, { message: "Please select your level of study" }),
  sessionInterest: z
    .array(z.enum(SESSIONS))
    .min(1, "Select at least one session you're interested in"),
  heardAboutUs: z.enum(HEARD_ABOUT_OPTIONS, {
    message: "Please tell us how you heard about IEPS 3.0",
  }),
});

/** Client form schema — adds the final confirmation checkbox. */
export const registrationFormSchema = registrationSchema.extend({
  confirmAttendance: z.literal(true, {
    message: "Please confirm your details to complete registration",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

/** Empty defaults for react-hook-form. */
export const registrationDefaults: RegistrationFormValues = {
  fullName: "",
  email: "",
  phone: "",
  gender: "" as RegistrationFormValues["gender"],
  institution: "",
  department: "",
  level: "" as RegistrationFormValues["level"],
  sessionInterest: [],
  heardAboutUs: "" as RegistrationFormValues["heardAboutUs"],
  confirmAttendance: false as unknown as true,
};

/** Human-readable label for a stored AttendeeRole value. */
export function roleLabel(value: string): string {
  return ATTENDEE_ROLES.find((r) => r.value === value)?.label ?? value;
}
