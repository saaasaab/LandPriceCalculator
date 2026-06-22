import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import ShareButton from "../components/ShareButton";
import { usePersistedState2 } from "../hooks/usePersistedState";
import {
  computeLeaseExpiryMetrics,
  formatCurrency,
  formatDate,
  formatLeaseRentBasis,
  formatPercent,
  getLeaseMonthlyRent,
  getLeaseRentAmount,
  getLeaseRentType,
  LeaseEntry,
  LeaseRentType,
} from "../utils/leaseExpiryCalculations";
import { EAllStates, EPageNames } from "../utils/types";
import "./LeaseExpiryScheduleCalculator.scss";

const emptyLease = (): LeaseEntry => ({
  id: uuidv4(),
  tenantName: "",
  unit: "",
  rentType: "monthly",
  rentAmount: 0,
  startDate: "",
  endDate: "",
  sqft: 0,
});

const SAMPLE_LEASES: LeaseEntry[] = [
  {
    id: "sample-1",
    tenantName: "Acme Logistics",
    unit: "101",
    rentType: "annualPerSqft",
    rentAmount: 26,
    startDate: "2023-01-01",
    endDate: "2026-12-31",
    sqft: 2400,
  },
  {
    id: "sample-2",
    tenantName: "Bright Dental",
    unit: "205",
    rentType: "monthly",
    rentAmount: 3800,
    startDate: "2022-06-01",
    endDate: "2027-05-31",
    sqft: 1800,
  },
  {
    id: "sample-3",
    tenantName: "Northline Fitness",
    unit: "310",
    rentType: "annualPerSqft",
    rentAmount: 22.5,
    startDate: "2021-03-01",
    endDate: "2028-02-29",
    sqft: 3200,
  },
  {
    id: "sample-4",
    tenantName: "Summit Law Group",
    unit: "402",
    rentType: "monthly",
    rentAmount: 4500,
    startDate: "2024-01-01",
    endDate: "2026-09-30",
    sqft: 2100,
  },
];

const LeaseExpiryScheduleCalculator = ({
  page,
}: {
  isMobile: boolean;
  page: EPageNames;
}) => {
  const queryParams = new URLSearchParams(window.location.search);
  const [propertyName, setPropertyName] = usePersistedState2(
    page,
    EAllStates.propertyName,
    "",
    queryParams,
  );
  const [leases, setLeases] = usePersistedState2<LeaseEntry[]>(
    page,
    EAllStates.leases,
    SAMPLE_LEASES,
    queryParams,
  );

  const metrics = useMemo(() => computeLeaseExpiryMetrics(leases), [leases]);

  const updateLease = (id: string, updates: Partial<LeaseEntry>) => {
    setLeases(leases.map((lease) => (lease.id === id ? { ...lease, ...updates } : lease)));
  };

  const addLease = () => {
    setLeases([...leases, emptyLease()]);
  };

  const removeLease = (id: string) => {
    setLeases(leases.filter((lease) => lease.id !== id));
  };

  const params = {
    propertyName,
    leases,
  };

  const expiryStatus = (remainingDays: number) => {
    if (remainingDays <= 0) return "expired";
    if (remainingDays <= 180) return "expiring-soon";
    return "";
  };

  const rentInputLabel = (rentType: LeaseRentType) =>
    rentType === "annualPerSqft" ? "$/SF (Annual)" : "Monthly Rent";

  const rentInputStep = (rentType: LeaseRentType) =>
    rentType === "annualPerSqft" ? "0.01" : "1";

  return (
    <div className="lease-expiry-schedule">
      <div className="print-report-header print-only">
        <div className="print-report-header__titles">
          <h1>Lease Expiry Schedule</h1>
          {propertyName ? <p className="print-report-header__property">{propertyName}</p> : null}
        </div>
        <span>Report date: {formatDate(new Date())}</span>
      </div>

      <div className="property-name-row screen-only">
        <label htmlFor="property-name">Property / Portfolio Name</label>
        <input
          id="property-name"
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          placeholder="e.g. Oakwood Office Park"
        />
      </div>

      <div className="lease-input-section screen-only">
        <div className="section-header">
          <h3>Tenant Leases</h3>
          <button type="button" className="add-lease-button no-print" onClick={addLease}>
            + Add Tenant
          </button>
        </div>

        <table className="lease-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Start</th>
              <th>End</th>
              <th>Rent Type</th>
              <th>Rent</th>
              <th>Sq Ft</th>
              <th className="no-print" />
            </tr>
          </thead>
          <tbody>
            {leases.map((lease) => {
              const rentType = getLeaseRentType(lease);
              const rentAmount = getLeaseRentAmount(lease);
              const effectiveMonthly = getLeaseMonthlyRent(lease);

              return (
              <tr key={lease.id}>
                <td>
                  <input
                    type="text"
                    value={lease.tenantName}
                    onChange={(e) => updateLease(lease.id, { tenantName: e.target.value })}
                    placeholder="Tenant name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={lease.unit}
                    onChange={(e) => updateLease(lease.id, { unit: e.target.value })}
                    placeholder="Suite"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={lease.startDate}
                    onChange={(e) => updateLease(lease.id, { startDate: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={lease.endDate}
                    onChange={(e) => updateLease(lease.id, { endDate: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    className="rent-type-select"
                    value={rentType}
                    onChange={(e) =>
                      updateLease(lease.id, { rentType: e.target.value as LeaseRentType })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annualPerSqft">$/SF (Annual)</option>
                  </select>
                </td>
                <td>
                  <div className="rent-input-cell">
                    <input
                      className="rent-input"
                      type="number"
                      min="0"
                      step={rentInputStep(rentType)}
                      value={rentAmount || ""}
                      onChange={(e) =>
                        updateLease(lease.id, { rentAmount: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      title={rentInputLabel(rentType)}
                    />
                    {rentType === "annualPerSqft" && effectiveMonthly > 0 ? (
                      <span className="rent-input-cell__hint">
                        {formatCurrency(effectiveMonthly)}/mo
                      </span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <input
                    className="sqft-input"
                    type="number"
                    min="0"
                    value={lease.sqft || ""}
                    onChange={(e) =>
                      updateLease(lease.id, { sqft: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                </td>
                <td className="no-print">
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeLease(lease.id)}
                    aria-label="Remove tenant"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      <div className="lease-input-print print-only">
        <h3>Tenant Leases</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Start</th>
              <th>End</th>
              <th>Rent Basis</th>
              <th>Monthly Rent</th>
              <th>Sq Ft</th>
            </tr>
          </thead>
          <tbody>
            {leases
              .filter((lease) => lease.tenantName.trim() && lease.endDate)
              .map((lease) => (
                <tr key={lease.id}>
                  <td>{lease.tenantName}</td>
                  <td>{lease.unit || "—"}</td>
                  <td>{lease.startDate ? formatDate(lease.startDate) : "—"}</td>
                  <td>{formatDate(lease.endDate)}</td>
                  <td>{formatLeaseRentBasis(lease)}</td>
                  <td>{formatCurrency(getLeaseMonthlyRent(lease))}</td>
                  <td>{lease.sqft ? lease.sqft.toLocaleString() : "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {metrics.leaseCount > 0 && (
        <>
          <div className="lease-metrics-section">
            <div className="section-header">
              <h3>Portfolio Metrics</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Monthly Rent</div>
                <div className="metric-value">{formatCurrency(metrics.totalMonthlyRent)}</div>
                <div className="metric-sub">{formatCurrency(metrics.totalAnnualRent)} / year</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Weighted Avg Lease Term (WALT)</div>
                <div className="metric-value">{metrics.waltYears.toFixed(1)} yrs</div>
                <div className="metric-sub">Rent-weighted remaining term</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Weighted Avg Expiry</div>
                <div className="metric-value">
                  {metrics.weightedAvgExpiryDate
                    ? formatDate(metrics.weightedAvgExpiryDate)
                    : "—"}
                </div>
                <div className="metric-sub">Rent-weighted expiration date</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Expiring in 12 Months</div>
                <div className="metric-value">{formatCurrency(metrics.expiring12MoRent)}</div>
                <div className="metric-sub">{formatPercent(metrics.expiring12MoPercent)} of rent</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Expiring in 24 Months</div>
                <div className="metric-value">{formatCurrency(metrics.expiring24MoRent)}</div>
                <div className="metric-sub">{formatPercent(metrics.expiring24MoPercent)} of rent</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Expiring in 36 Months</div>
                <div className="metric-value">{formatCurrency(metrics.expiring36MoRent)}</div>
                <div className="metric-sub">{formatPercent(metrics.expiring36MoPercent)} of rent</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Avg Rent / Unit</div>
                <div className="metric-value">{formatCurrency(metrics.avgRentPerUnit)}</div>
                <div className="metric-sub">{metrics.leaseCount} active leases</div>
              </div>
              {metrics.totalSqft > 0 && (
                <div className="metric-card">
                  <div className="metric-label">Avg Rent / SF (Annual)</div>
                  <div className="metric-value">
                    ${metrics.avgRentPerSqft.toFixed(2)}
                  </div>
                  <div className="metric-sub">{metrics.totalSqft.toLocaleString()} total SF</div>
                </div>
              )}
            </div>
          </div>

          <div className="lease-timeline-section">
            <div className="section-header">
              <h3>Rent Expiry Timeline</h3>
            </div>
            <div className="timeline-bars">
              {metrics.expiryByYear.map((bucket) => (
                <div key={bucket.label} className="timeline-row">
                  <div className="timeline-label">{bucket.label}</div>
                  <div className="timeline-bar-track">
                    <div
                      className="timeline-bar-fill"
                      style={{ width: `${bucket.percentOfTotal}%` }}
                    />
                  </div>
                  <div className="timeline-meta">
                    {formatCurrency(bucket.rent)}/mo · {bucket.count} lease{bucket.count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lease-schedule-section">
            <div className="section-header">
              <h3>Lease Expiry Schedule</h3>
            </div>
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Rent Basis</th>
                  <th>Monthly Rent</th>
                  <th>Annual Rent</th>
                  <th>End Date</th>
                  <th>Remaining</th>
                  <th>% of Rent</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sortedLeases.map((lease) => (
                  <tr key={lease.id}>
                    <td>{lease.tenantName}</td>
                    <td>{lease.unit || "—"}</td>
                    <td>{lease.rentLabel}</td>
                    <td>{formatCurrency(lease.monthlyRent)}</td>
                    <td>{formatCurrency(lease.annualRent)}</td>
                    <td className={expiryStatus(lease.remainingDays)}>
                      {formatDate(lease.endDate)}
                    </td>
                    <td className={expiryStatus(lease.remainingDays)}>
                      {lease.remainingDays <= 0
                        ? "Expired"
                        : `${lease.remainingMonths.toFixed(1)} mo`}
                    </td>
                    <td>{formatPercent(lease.rentWeight * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ShareButton params={params} />
    </div>
  );
};

export default LeaseExpiryScheduleCalculator;
