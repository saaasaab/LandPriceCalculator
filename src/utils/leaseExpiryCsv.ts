import { v4 as uuidv4 } from "uuid";
import { LeaseEntry, LeaseRentType, isLeaseVacant, normalizeLeaseDate } from "./leaseExpiryCalculations";

export const LEASE_CSV_HEADERS = [
  "Tenant",
  "Unit",
  "Start",
  "End",
  "Rent Type",
  "Rent",
  "Sq Ft",
] as const;

const RENT_TYPE_LABELS: Record<LeaseRentType, string> = {
  monthly: "Monthly",
  annualPerSqft: "$/SF (Annual)",
};

function escapeCsvValue(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function formatCsvDate(value: string): string {
  return normalizeLeaseDate(value);
}

function parseRentType(value: string): LeaseRentType | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "monthly";
  if (
    normalized === "monthly" ||
    normalized === "month" ||
    normalized === "mo" ||
    normalized === "m"
  ) {
    return "monthly";
  }
  if (
    normalized === "annualpersqft" ||
    normalized === "annual per sqft" ||
    normalized === "annual/sf" ||
    normalized === "$/sf (annual)" ||
    normalized === "$/sf" ||
    normalized === "$/sf/yr" ||
    normalized === "per sf" ||
    normalized === "per sqft"
  ) {
    return "annualPerSqft";
  }
  return null;
}

function parseDelimitedLine(line: string): string[] {
  const tabCount = (line.match(/\t/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  if (tabCount > 0 && tabCount >= commaCount) {
    return line.split("\t");
  }
  return parseCsvLine(line);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parseCsv(text: string): string[][] {
  const normalized = text.replace(/^\uFEFF/, "").trim();
  if (!normalized) return [];

  const rows: string[][] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    const next = normalized[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentLine += '""';
        i += 1;
      } else {
        inQuotes = !inQuotes;
        currentLine += char;
      }
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      if (currentLine.trim()) rows.push(parseDelimitedLine(currentLine));
      currentLine = "";
      continue;
    }

    currentLine += char;
  }

  if (currentLine.trim()) rows.push(parseDelimitedLine(currentLine));
  return rows;
}

function isHeaderRow(values: string[]): boolean {
  const normalized = values.map((value) => value.trim().toLowerCase());
  return normalized.some((value) =>
    ["tenant", "tenant name", "status", "unit", "start", "start date", "end", "end date"].includes(value),
  );
}

type LeaseCsvColumns = {
  tenantName: string;
  unit: string;
  startDate: string;
  endDate: string;
  rentTypeRaw: string;
  rentRaw: string;
  sqftRaw: string;
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapRowToColumns(headers: string[], values: string[]): LeaseCsvColumns {
  const mapped: LeaseCsvColumns = {
    tenantName: "",
    unit: "",
    startDate: "",
    endDate: "",
    rentTypeRaw: "",
    rentRaw: "",
    sqftRaw: "",
  };

  headers.forEach((header, index) => {
    const value = values[index] ?? "";
    switch (normalizeHeader(header)) {
      case "tenant":
      case "tenant name":
        mapped.tenantName = value;
        break;
      case "unit":
      case "suite":
        mapped.unit = value;
        break;
      case "start":
      case "start date":
      case "lease start":
        mapped.startDate = value;
        break;
      case "end":
      case "end date":
      case "lease end":
      case "expiry":
      case "expiration":
        mapped.endDate = value;
        break;
      case "rent type":
      case "rent basis":
        mapped.rentTypeRaw = value;
        break;
      case "rent":
      case "monthly rent":
      case "rent amount":
        mapped.rentRaw = value;
        break;
      case "sq ft":
      case "sqft":
      case "square feet":
      case "sf":
        mapped.sqftRaw = value;
        break;
      default:
        break;
    }
  });

  return mapped;
}

function rowToLease(values: string[], rowNumber: number, headers?: string[]): { lease?: LeaseEntry; error?: string } {
  const columns = headers
    ? mapRowToColumns(headers, values)
    : {
        tenantName: values[0] ?? "",
        unit: values[1] ?? "",
        startDate: values[2] ?? "",
        endDate: values[3] ?? "",
        rentTypeRaw: values[4] ?? "",
        rentRaw: values[5] ?? "",
        sqftRaw: values[6] ?? "",
      };

  const {
    tenantName,
    unit,
    startDate,
    endDate,
    rentTypeRaw,
    rentRaw,
    sqftRaw,
  } = columns;

  const trimmedTenant = tenantName.trim();
  const trimmedStart = startDate.trim();
  const trimmedEnd = endDate.trim();
  const trimmedUnit = unit.trim();

  if (!trimmedTenant && !trimmedEnd && !rentRaw.trim() && !sqftRaw.trim() && !trimmedUnit) {
    return {};
  }

  if (!trimmedUnit) {
    return { error: `Row ${rowNumber}: Unit is required.` };
  }

  const normalizedStart = formatCsvDate(trimmedStart);
  if (trimmedStart && !normalizedStart) {
    return {
      error: `Row ${rowNumber}: Invalid start date "${trimmedStart}". Use M/D/YYYY or YYYY-MM-DD.`,
    };
  }

  const normalizedEnd = formatCsvDate(trimmedEnd);
  if (trimmedEnd && !normalizedEnd) {
    return {
      error: `Row ${rowNumber}: Invalid end date "${trimmedEnd}". Use M/D/YYYY or YYYY-MM-DD.`,
    };
  }

  const rentType = parseRentType(rentTypeRaw);
  if (!rentType) {
    return {
      error: `Row ${rowNumber}: Invalid rent type "${rentTypeRaw}". Use "Monthly" or "$/SF (Annual)".`,
    };
  }

  const rentAmount = rentRaw.trim() ? Number(rentRaw.replace(/[$,]/g, "")) : 0;
  if (Number.isNaN(rentAmount) || rentAmount < 0) {
    return { error: `Row ${rowNumber}: Rent must be a non-negative number.` };
  }

  const sqft = sqftRaw.trim() ? Number(sqftRaw.replace(/,/g, "")) : 0;
  if (Number.isNaN(sqft) || sqft < 0) {
    return { error: `Row ${rowNumber}: Sq Ft must be a non-negative number.` };
  }

  return {
    lease: {
      id: uuidv4(),
      tenantName: trimmedTenant,
      unit: trimmedUnit,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      rentType,
      rentAmount,
      sqft,
    },
  };
}

export function leasesToCsv(leases: LeaseEntry[]): string {
  const lines = [LEASE_CSV_HEADERS.join(",")];

  leases.forEach((lease) => {
    const rentType = lease.rentType ?? "monthly";
    const vacant = isLeaseVacant(lease);
    lines.push(
      [
        escapeCsvValue(vacant ? "" : lease.tenantName),
        escapeCsvValue(lease.unit),
        escapeCsvValue(formatCsvDate(lease.startDate)),
        escapeCsvValue(formatCsvDate(lease.endDate)),
        escapeCsvValue(vacant ? "" : RENT_TYPE_LABELS[rentType]),
        escapeCsvValue(vacant ? 0 : lease.rentAmount ?? lease.monthlyRent ?? 0),
        escapeCsvValue(lease.sqft || 0),
      ].join(","),
    );
  });

  return `${lines.join("\n")}\n`;
}

export function downloadLeaseCsv(leases: LeaseEntry[], filename = "tenant-leases.csv"): void {
  const csv = leasesToCsv(leases);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseLeaseCsv(text: string): { leases: LeaseEntry[]; errors: string[] } {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { leases: [], errors: ["The CSV file is empty."] };
  }

  const dataRows = isHeaderRow(rows[0]) ? rows.slice(1) : rows;
  const headers = isHeaderRow(rows[0]) ? rows[0] : undefined;
  const leases: LeaseEntry[] = [];
  const errors: string[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + (headers ? 2 : 1);
    const result = rowToLease(row, rowNumber, headers);
    if (result.error) errors.push(result.error);
    if (result.lease) leases.push(result.lease);
  });

  if (leases.length === 0 && errors.length === 0) {
    errors.push("No lease rows were found in the CSV file.");
  }

  return { leases, errors };
}
