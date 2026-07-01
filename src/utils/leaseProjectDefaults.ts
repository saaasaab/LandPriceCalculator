import { v4 as uuidv4 } from "uuid";
import { LeaseEntry } from "./leaseExpiryCalculations";
import { setPageInputs } from "./projectStorage";
import { EAllStates, EPageNames } from "./types";

export const createEmptyLease = (): LeaseEntry => ({
  id: uuidv4(),
  tenantName: "",
  unit: "",
  rentType: "monthly",
  rentAmount: 0,
  startDate: "",
  endDate: "",
  sqft: 0,
});

export const getNewLeaseProjectInputs = () => ({
  [EAllStates.propertyName]: "",
  [EAllStates.leases]: [createEmptyLease()],
});

export const resetLeaseProject = (page: EPageNames = EPageNames.LEASE_EXPIRY_SCHEDULE): void => {
  setPageInputs(page, getNewLeaseProjectInputs());
};

export const serializeLeaseProject = (propertyName: string, leases: LeaseEntry[]) =>
  JSON.stringify({ propertyName, leases });
