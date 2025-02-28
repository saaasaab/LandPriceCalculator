import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the feature flags
interface FeatureFlags {
  stripeIntegration: boolean;
  newDashboardUI: boolean;
  betaFeatureX: boolean;
}

// Define context type
interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
}

// Create context with default values
const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
);

// Provider component
export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const [flags, setFlags] = useState<FeatureFlags>({
    stripeIntegration: false,
    newDashboardUI: false,
    betaFeatureX: false,
  });

  // Function to toggle a flag
  const toggleFlag = (flag: keyof FeatureFlags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  // Function to explicitly set a flag's value
  const setFlag = (flag: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [flag]: value }));
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, toggleFlag, setFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

// Custom hook for using feature flags
export const useFeatureFlag = (flag: keyof FeatureFlags) => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlag must be used within a FeatureFlagsProvider");
  }
  return context.flags[flag];
};

// Custom hook to access toggle and setFlag functions
export const useFeatureFlagsActions = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsActions must be used within a FeatureFlagsProvider"
    );
  }
  return { toggleFlag: context.toggleFlag, setFlag: context.setFlag };
};
