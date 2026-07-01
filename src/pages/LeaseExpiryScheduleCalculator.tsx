import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmationModal from "../components/ConfirmationModal";
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
  isLeaseVacant,
  LeaseEntry,
  LeaseRentType,
} from "../utils/leaseExpiryCalculations";
import { downloadLeaseCsv, parseLeaseCsv } from "../utils/leaseExpiryCsv";
import { createEmptyLease, serializeLeaseProject } from "../utils/leaseProjectDefaults";
import { EAllStates, EPageNames } from "../utils/types";
import "./LeaseExpiryScheduleCalculator.scss";

const emptyLease = createEmptyLease;

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
  {
    id: "sample-5",
    tenantName: "",
    unit: "118",
    rentType: "monthly",
    rentAmount: 0,
    startDate: "",
    endDate: "",
    sqft: 1650,
  },
];

const LeaseExpiryScheduleCalculator = ({
  page,
  onNewProject,
}: {
  isMobile: boolean;
  page: EPageNames;
  onNewProject?: () => void;
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

  const [csvError, setCsvError] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const baselineRef = useRef<string | null>(null);
  const metrics = useMemo(() => computeLeaseExpiryMetrics(leases), [leases]);

  useEffect(() => {
    baselineRef.current = serializeLeaseProject(propertyName, leases);
  }, []);

  const hasUnsavedChanges =
    baselineRef.current !== null &&
    serializeLeaseProject(propertyName, leases) !== baselineRef.current;

  const startNewProject = () => {
    setCsvError(null);
    setIsNewProjectModalOpen(false);
    onNewProject?.();
  };

  const handleNewProjectClick = () => {
    if (hasUnsavedChanges) {
      setIsNewProjectModalOpen(true);
      return;
    }
    startNewProject();
  };

  const handleDownloadCsv = () => {
    setCsvError(null);
    const filename = propertyName.trim()
      ? `${propertyName.trim().replace(/[^\w.-]+/g, "-").toLowerCase()}-leases.csv`
      : "tenant-leases.csv";
    downloadLeaseCsv(leases, filename);
  };

  const handleUploadCsv = async (file: File) => {
    setCsvError(null);
    try {
      const text = await file.text();
      const { leases: importedLeases, errors } = parseLeaseCsv(text);
      if (errors.length > 0) {
        setCsvError(errors.join(" "));
        return;
      }
      setLeases(importedLeases);
    } catch {
      setCsvError("Could not read the CSV file. Please try again.");
    }
  };

  const updateLease = (id: string, updates: Partial<LeaseEntry>) => {
    setLeases(leases.map((lease) => (lease.id === id ? { ...lease, ...updates } : lease)));
  };

  const addUnit = () => {
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
        <div className="property-name-row__content">
          <label htmlFor="property-name">Property / Portfolio Name</label>
          <input
            id="property-name"
            type="text"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder="e.g. Oakwood Office Park"
          />
        </div>
        {onNewProject ? (
          <button type="button" className="new-project-button no-print" onClick={handleNewProjectClick}>
            New Project
          </button>
        ) : null}
      </div>

      <div className="lease-input-section screen-only">
        <div className="section-header">
          <h3>Tenant Leases</h3>
          <div className="lease-actions no-print">
            <button type="button" className="csv-button" onClick={handleDownloadCsv}>
              Download CSV
            </button>
            <button
              type="button"
              className="csv-button"
              onClick={() => csvInputRef.current?.click()}
            >
              Upload CSV
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="csv-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUploadCsv(file);
                e.target.value = "";
              }}
            />
            <button type="button" className="add-lease-button" onClick={addUnit}>
              + Add Unit
            </button>
          </div>
        </div>

        {csvError ? <p className="csv-error no-print">{csvError}</p> : null}

        <div className="lease-table-wrapper no-print">
        <table className="lease-table">
          <thead>
            <tr>
              <th>Status</th>
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
              const vacant = isLeaseVacant(lease);
              const rentType = getLeaseRentType(lease);
              const rentAmount = getLeaseRentAmount(lease);
              const effectiveMonthly = getLeaseMonthlyRent(lease);

              return (
              <tr key={lease.id} className={vacant ? "lease-row--vacant" : undefined}>
                <td>
                  <span className={`status-badge ${vacant ? "status-badge--vacant" : "status-badge--occupied"}`}>
                    {vacant ? "Vacant" : lease.unit.trim() ? "Occupied" : "—"}
                  </span>
                </td>
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
      </div>

      <div className="lease-input-print print-only">
        <h3>Tenant Leases</h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Status</th>
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
              .filter((lease) => isLeaseVacant(lease) || (lease.tenantName.trim() && lease.endDate))
              .map((lease) => {
                const vacant = isLeaseVacant(lease);
                return (
                <tr key={lease.id} className={vacant ? "lease-row--vacant" : undefined}>
                  <td>{vacant ? "Vacant" : "Occupied"}</td>
                  <td>{vacant ? "—" : lease.tenantName}</td>
                  <td>{lease.unit || "—"}</td>
                  <td>{lease.startDate ? formatDate(lease.startDate) : "—"}</td>
                  <td>{vacant ? "—" : formatDate(lease.endDate)}</td>
                  <td>{formatLeaseRentBasis(lease)}</td>
                  <td>{vacant ? "—" : formatCurrency(getLeaseMonthlyRent(lease))}</td>
                  <td>{lease.sqft ? lease.sqft.toLocaleString() : "—"}</td>
                </tr>
              );
              })}
          </tbody>
        </table>
      </div>

      {metrics.totalUnitCount > 0 && (
        <>
          <div className="lease-metrics-section">
            <div className="section-header">
              <h3>Portfolio Metrics</h3>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Vacant Units</div>
                <div className="metric-value">{metrics.vacantCount}</div>
                <div className="metric-sub">
                  {metrics.totalUnitCount} total units · {formatPercent(metrics.occupancyRate)} occupied
                </div>
              </div>
              {metrics.vacantSqft > 0 && (
                <div className="metric-card">
                  <div className="metric-label">Vacant SF</div>
                  <div className="metric-value">{metrics.vacantSqft.toLocaleString()}</div>
                  <div className="metric-sub">Available space</div>
                </div>
              )}
              {metrics.leaseCount > 0 && (
                <>
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
                </>
              )}
            </div>
          </div>

          {metrics.leaseCount > 0 && (
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
          )}

          {metrics.leaseCount > 0 && (
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
          )}
        </>
      )}

      <ShareButton params={params} />

      <ConfirmationModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onConfirm={startNewProject}
        message="You have unsaved changes. Start a new project anyway? Your current edits will be lost."
      />
    </div>
  );
};

export default LeaseExpiryScheduleCalculator;
