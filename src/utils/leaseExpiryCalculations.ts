export type LeaseRentType = "monthly" | "annualPerSqft";

export interface LeaseEntry {
  id: string;
  tenantName: string;
  unit: string;
  rentType?: LeaseRentType;
  rentAmount?: number;
  /** @deprecated use rentAmount */
  monthlyRent?: number;
  startDate: string;
  endDate: string;
  sqft: number;
}

export interface ExpiryBucket {
  label: string;
  rent: number;
  count: number;
  percentOfTotal: number;
}

export interface LeaseExpiryMetrics {
  totalMonthlyRent: number;
  totalAnnualRent: number;
  leaseCount: number;
  totalSqft: number;
  avgRentPerUnit: number;
  avgRentPerSqft: number;
  waltYears: number;
  weightedAvgExpiryDate: Date | null;
  expiring12MoRent: number;
  expiring12MoPercent: number;
  expiring24MoRent: number;
  expiring24MoPercent: number;
  expiring36MoRent: number;
  expiring36MoPercent: number;
  expiryByYear: ExpiryBucket[];
  expiryByQuarter: ExpiryBucket[];
  sortedLeases: (LeaseEntry & {
    remainingMonths: number;
    remainingDays: number;
    monthlyRent: number;
    annualRent: number;
    rentWeight: number;
    rentLabel: string;
  })[];
}

export function getLeaseRentType(lease: LeaseEntry): LeaseRentType {
  return lease.rentType ?? "monthly";
}

export function getLeaseRentAmount(lease: LeaseEntry): number {
  if (lease.rentAmount !== undefined) return lease.rentAmount;
  return lease.monthlyRent ?? 0;
}

export function getLeaseMonthlyRent(lease: LeaseEntry): number {
  const amount = getLeaseRentAmount(lease);
  if (getLeaseRentType(lease) === "annualPerSqft") {
    if (!lease.sqft || lease.sqft <= 0) return 0;
    return (amount * lease.sqft) / 12;
  }
  return amount;
}

export function formatLeaseRentBasis(lease: LeaseEntry): string {
  if (getLeaseRentType(lease) === "annualPerSqft") {
    return `$${getLeaseRentAmount(lease).toFixed(2)}/SF/yr`;
  }
  return "Monthly";
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / MS_PER_DAY));
}

function monthsBetween(from: Date, to: Date): number {
  return daysBetween(from, to) / 30.4375;
}

function formatQuarter(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

export function computeLeaseExpiryMetrics(
  leases: LeaseEntry[],
  asOf: Date = new Date(),
): LeaseExpiryMetrics {
  const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const validLeases = leases.filter(
    (lease) => lease.tenantName.trim() && getLeaseMonthlyRent(lease) > 0 && parseDate(lease.endDate),
  );

  const totalMonthlyRent = validLeases.reduce((sum, lease) => sum + getLeaseMonthlyRent(lease), 0);
  const totalAnnualRent = totalMonthlyRent * 12;
  const totalSqft = validLeases.reduce((sum, lease) => sum + (lease.sqft || 0), 0);

  const enriched = validLeases
    .map((lease) => {
      const endDate = parseDate(lease.endDate)!;
      const remainingDays = daysBetween(today, endDate);
      const remainingMonths = monthsBetween(today, endDate);
      const monthlyRent = getLeaseMonthlyRent(lease);
      const rentWeight = totalMonthlyRent > 0 ? monthlyRent / totalMonthlyRent : 0;
      return {
        ...lease,
        remainingDays,
        remainingMonths,
        monthlyRent,
        annualRent: monthlyRent * 12,
        rentWeight,
        rentLabel: formatLeaseRentBasis(lease),
      };
    })
    .sort((a, b) => a.remainingDays - b.remainingDays);

  let waltYears = 0;
  let weightedExpiryTimestamp = 0;

  if (totalMonthlyRent > 0) {
    waltYears =
      enriched.reduce((sum, lease) => sum + lease.monthlyRent * lease.remainingMonths, 0) /
      totalMonthlyRent /
      12;

    weightedExpiryTimestamp =
      enriched.reduce((sum, lease) => {
        const end = parseDate(lease.endDate)!.getTime();
        return sum + end * lease.monthlyRent;
      }, 0) / totalMonthlyRent;
  }

  const expiringWithin = (months: number) => {
    const rent = enriched
      .filter((lease) => lease.remainingMonths <= months)
      .reduce((sum, lease) => sum + lease.monthlyRent, 0);
    return {
      rent,
      percent: totalMonthlyRent > 0 ? (rent / totalMonthlyRent) * 100 : 0,
    };
  };

  const within12 = expiringWithin(12);
  const within24 = expiringWithin(24);
  const within36 = expiringWithin(36);

  const yearMap = new Map<string, ExpiryBucket>();
  const quarterMap = new Map<string, ExpiryBucket>();

  enriched.forEach((lease) => {
    const endDate = parseDate(lease.endDate)!;
    const yearKey = String(endDate.getFullYear());
    const quarterKey = formatQuarter(endDate);

    const yearBucket = yearMap.get(yearKey) ?? { label: yearKey, rent: 0, count: 0, percentOfTotal: 0 };
    yearBucket.rent += lease.monthlyRent;
    yearBucket.count += 1;
    yearMap.set(yearKey, yearBucket);

    const quarterBucket = quarterMap.get(quarterKey) ?? { label: quarterKey, rent: 0, count: 0, percentOfTotal: 0 };
    quarterBucket.rent += lease.monthlyRent;
    quarterBucket.count += 1;
    quarterMap.set(quarterKey, quarterBucket);
  });

  const finalizeBuckets = (buckets: ExpiryBucket[]) =>
    buckets
      .map((bucket) => ({
        ...bucket,
        percentOfTotal: totalMonthlyRent > 0 ? (bucket.rent / totalMonthlyRent) * 100 : 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

  return {
    totalMonthlyRent,
    totalAnnualRent,
    leaseCount: validLeases.length,
    totalSqft,
    avgRentPerUnit: validLeases.length > 0 ? totalMonthlyRent / validLeases.length : 0,
    avgRentPerSqft: totalSqft > 0 ? (totalMonthlyRent * 12) / totalSqft : 0,
    waltYears,
    weightedAvgExpiryDate: weightedExpiryTimestamp > 0 ? new Date(weightedExpiryTimestamp) : null,
    expiring12MoRent: within12.rent,
    expiring12MoPercent: within12.percent,
    expiring24MoRent: within24.rent,
    expiring24MoPercent: within24.percent,
    expiring36MoRent: within36.rent,
    expiring36MoPercent: within36.percent,
    expiryByYear: finalizeBuckets([...yearMap.values()]),
    expiryByQuarter: finalizeBuckets([...quarterMap.values()]),
    sortedLeases: enriched,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? parseDate(value) : value;
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
