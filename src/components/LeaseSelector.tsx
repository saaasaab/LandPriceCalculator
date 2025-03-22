import React, { useState } from "react";
import "./LeaseSelector.scss";

interface LeaseOption {
  type: string;
  ownershipDuties: string;
  upkeepResponsibilities: string;
  taxObligations: string;
  insuranceCoverage: string;
  sharedAreaMaintenance: string;
  rentalTerms: string;
  idealFor: string;
}

const leaseOptions: LeaseOption[] = [
  {
    type: "Triple Net Lease (NNN)",
    ownershipDuties: "Tenant assumes most financial obligations",
    upkeepResponsibilities: "Handled by Tenant",
    taxObligations: "Paid by Tenant",
    insuranceCoverage: "Paid by Tenant",
    sharedAreaMaintenance: "Paid by Tenant",
    rentalTerms: "Lower base rent, increased tenant duties",
    idealFor: "Long-term business leases, retail establishments",
  },
  {
    type: "Gross Lease",
    ownershipDuties: "Landlord covers most expenses",
    upkeepResponsibilities: "Managed by Landlord",
    taxObligations: "Paid by Landlord",
    insuranceCoverage: "Paid by Landlord",
    sharedAreaMaintenance: "Paid by Landlord",
    rentalTerms: "Higher base rent, reduced tenant obligations",
    idealFor: "Office spaces, short-term rentals",
  },
  {
    type: "Full-Service Lease",
    ownershipDuties: "Landlord assumes all financial responsibilities",
    upkeepResponsibilities: "Managed by Landlord",
    taxObligations: "Paid by Landlord",
    insuranceCoverage: "Paid by Landlord",
    sharedAreaMaintenance: "Paid by Landlord",
    rentalTerms: "Highest base rent, fully inclusive package",
    idealFor: "Premium office environments, high-end commercial properties",
  },
];

const LeaseSelector: React.FC = () => {
  const [selectedLease, setSelectedLease] = useState<LeaseOption | null>(null);

  return (
    <div className="lease-selector">
      <h2>Choose a Lease Type</h2>
      <div className="lease-options">
        {leaseOptions.map((lease) => (
          <button
            key={lease.type}
            className={`lease-button ${selectedLease?.type === lease.type ? "active" : ""}`}
            onClick={() => setSelectedLease(lease)}
          >
            {lease.type}
          </button>
        ))}
      </div>
      {selectedLease && (
        <div className="lease-details">
          <h3>{selectedLease.type}</h3>
          <ul>
            <li><strong>Ownership Duties:</strong> {selectedLease.ownershipDuties}</li>
            <li><strong>Upkeep Responsibilities:</strong> {selectedLease.upkeepResponsibilities}</li>
            <li><strong>Tax Obligations:</strong> {selectedLease.taxObligations}</li>
            <li><strong>Insurance Coverage:</strong> {selectedLease.insuranceCoverage}</li>
            <li><strong>Shared Area Maintenance:</strong> {selectedLease.sharedAreaMaintenance}</li>
            <li><strong>Rental Terms:</strong> {selectedLease.rentalTerms}</li>
            <li><strong>Ideal For:</strong> {selectedLease.idealFor}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeaseSelector;
