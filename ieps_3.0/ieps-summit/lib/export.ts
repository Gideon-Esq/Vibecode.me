import { format } from "date-fns";
import { roleLabel } from "@/lib/registration";

export type ExportRegistration = {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  level: string;
  role: string;
  sessions: string[];
  gender: string;
  status: string;
  attended: boolean;
  certificateUrl: string | null;
  createdAt: Date | string;
};

export const CSV_HEADERS = [
  "Full Name",
  "Email",
  "Phone",
  "Institution",
  "Department",
  "Level",
  "Role",
  "Sessions Interested",
  "Gender",
  "Status",
  "Attended",
  "Certificate Issued",
  "Registration Date",
] as const;

/** Escape a value for RFC-4180 CSV (quote if it contains comma, quote or newline). */
function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toRow(r: ExportRegistration): string[] {
  return [
    r.fullName,
    r.email,
    r.phone,
    r.institution,
    r.department,
    r.level,
    roleLabel(r.role),
    r.sessions.join("; "),
    r.gender,
    r.status,
    r.attended ? "Yes" : "No",
    r.certificateUrl ? "Yes" : "No",
    format(new Date(r.createdAt), "yyyy-MM-dd HH:mm"),
  ];
}

/** Generates a CSV string (CRLF line endings) from registrations. */
export function exportToCSV(registrations: ExportRegistration[]): string {
  const lines: string[] = [CSV_HEADERS.join(",")];
  for (const r of registrations) {
    lines.push(toRow(r).map(escapeCsv).join(","));
  }
  return lines.join("\r\n");
}

/** Rows as arrays (header + data) — handy for building an XLSX sheet. */
export function toAoa(registrations: ExportRegistration[]): string[][] {
  return [Array.from(CSV_HEADERS), ...registrations.map(toRow)];
}
