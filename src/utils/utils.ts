import { BuildingCalculationResult, EPageNames } from "./types";

export const getDefault = (
  page: EPageNames,
  key: string,
  initialValue: number | string | boolean | undefined,
  queryParams: URLSearchParams,

) => {
  const queryParamValue = getQueryParamNumber(key, queryParams);
  const combinedKey = `${page}_${key}`;
  const fromLocal = localStorage.getItem(combinedKey);
  const storedValue = fromLocal ? fromLocal : null;

  const initial = queryParamValue !== undefined ? queryParamValue
      : storedValue ? JSON.parse(storedValue)
          : initialValue;

  return initial;

}

export const setInLocalStorage = (value: number | boolean | undefined, key: string) =>{
  if (value !== undefined) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const roundAndLocalString = (value: number) => {
  return Math.round(value).toLocaleString();
};


export const getQueryParamNumber = (queryParam: string, queryParams: URLSearchParams): number | undefined => {
  const param = queryParams.get(queryParam)
  if (!param) return;

  return Number(param) ?? undefined
};


export const getQueryParamBoolean = (queryParam: string, queryParams: URLSearchParams): boolean | undefined => {
  const param = queryParams.get(queryParam)
  return !!param
};


export function monthlyPayment(p: number, n: number, i: number) {
  // var M; //monthly mortgage payment
  // var P = 400000; //principle / initial amount borrowed
  // var I = 3.5 / 100 / 12; //monthly interest rate
  // var N = 30 * 12; //number of payments months

  //   P = (Pv*R) / [1 - (1 + R)^(-n)]

  return (p * i) / (1 - Math.pow(1 + i, -n));

  //   return (p * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

export const decimalToPercentage = (decimal: number) => {
  return Math.round(decimal * 100) + "%";
};

const accessibleParkingRequirements = {
  1: 1,
  26: 2,
  51: 3,
  76: 4,
  101: 5,
  151: 6,
  201: 7,
  301: 8,
  401: 9,
  501: function (totalSpots: number) {
    return Math.ceil(totalSpots * 0.02); // 2% of total
  },
  1001: function (totalSpots: number) {
    return 20 + Math.ceil((totalSpots - 1000) / 100); // 20 + 1 for each 100 over 1000
  },
};

const getHandicappedParkingRequirements = (totalSpots: number) => {
  if (totalSpots <= 25) {
    return accessibleParkingRequirements[1];
  } else if (totalSpots <= 50) {
    return accessibleParkingRequirements[26];
  } else if (totalSpots <= 75) {
    return accessibleParkingRequirements[51];
  } else if (totalSpots <= 100) {
    return accessibleParkingRequirements[76];
  } else if (totalSpots <= 150) {
    return accessibleParkingRequirements[101];
  } else if (totalSpots <= 200) {
    return accessibleParkingRequirements[151];
  } else if (totalSpots <= 300) {
    return accessibleParkingRequirements[201];
  } else if (totalSpots <= 400) {
    return accessibleParkingRequirements[301];
  } else if (totalSpots <= 500) {
    return accessibleParkingRequirements[401];
  } else if (totalSpots <= 1000) {
    return accessibleParkingRequirements[501](totalSpots);
  } else {
    return accessibleParkingRequirements[1001](totalSpots);
  }
};

export function calculateBuildingSqft(
  lotSize: number,
  floors: number,
  parkingRatio: number,
  imperviousSurfaceRatio: number,
  commonSpacePercentage: number,
  catchAll: number
): BuildingCalculationResult & {
  leaseableBuildingSpace: number
} {
  const approachW = 24;
  const parkingSpotW = 8;
  const parkingSpotL = 17;
  const handicappedParkingSpotW = 16;

  // Initial calculations
  const maxImperviousSurface = lotSize * imperviousSurfaceRatio; // Max impervious surface allowed
  const initialBuildingFootprint = maxImperviousSurface;
  let count = 0;
  // Call the recursive helper function
  // Recursive helper function
  function helper(
    maxImperviousSurface: number,
    buildingFootprint: number,
    count: number
  ) {

    const buildingSize = buildingFootprint * floors;
    const leaseableBuildingSpace = buildingSize * (1 - commonSpacePercentage / 100);


    const parkingSpots = Math.round(leaseableBuildingSpace * parkingRatio);
    const handicappedParking = getHandicappedParkingRequirements(parkingSpots);

    const sidewalkArea = buildingFootprint * 0.2; //Sidewalks are 20% the building size;
    const drivewayArea = (approachW * parkingSpotW * parkingSpots / 2) * catchAll; //1.3 for a fudge amount for approaches, garbage, utilities, and other 
    const normalParkingArea = parkingSpotW * parkingSpotL * (parkingSpots - handicappedParking)
    const handicappedParkingArea = handicappedParkingSpotW * parkingSpotL * handicappedParking;
    const parkingArea = normalParkingArea + handicappedParkingArea;

    const totalImperviousArea = buildingFootprint + parkingArea + drivewayArea + sidewalkArea;
    const acceptableBuilding = totalImperviousArea <= maxImperviousSurface;// && Math.round(leaseableBuildingSpace * parkingRatio) === parkingSpots

    if (!acceptableBuilding && count < 20000) {
      // Total impervious surface used (parking area + building footprint)
      return helper(
        maxImperviousSurface,
        buildingFootprint - 100,
        count + 1
      );
    } else {
      const footprintSideLength = Math.sqrt(buildingFootprint); // Assuming a square footprint

      return {
        leaseableBuildingSpace,
        totalBuildingSqft: buildingSize,
        parkingSpotsRequired: Math.ceil(parkingSpots),
        buildingFootprint: {
          area: buildingFootprint,
          dimensions: {
            length: footprintSideLength.toFixed(1), // Approximate length of one side
            width: footprintSideLength.toFixed(1), // Approximate width of one side
          },
        },
        parkingArea,
        drivewayArea,
        imperviousSurfaceRatio:
          (parkingArea + drivewayArea + buildingFootprint + sidewalkArea) /
          lotSize,
        lotSize,
        handicappedParking,
        sidewalkArea,
      };
    }
  }


  return helper(
    maxImperviousSurface,
    initialBuildingFootprint,
    count,
  );
}

export function calculateBuildingSqftResidential(
  lotSize: number,
  floors: number,
  parkingSpots: number,
  imperviousSurfaceRatio: number,
  catchAll: number,
  requiresHandicappedParking = false
): BuildingCalculationResult {
  const approachW = 24;
  const parkingSpotW = 8;
  const parkingSpotL = 17;
  const handicappedParkingSpotW = 16;


  // Initial calculations
  const maxImperviousSurface = lotSize * imperviousSurfaceRatio; // Max impervious surface allowed
  const initialBuildingFootprint = maxImperviousSurface;
  let count = 0;
  // Call the recursive helper function
  // Recursive helper function
  function helper(
    maxImperviousSurface: number,
    buildingFootprint: number,
    count: number
  ) {


    const buildingSize = buildingFootprint * floors;

    // const parkingSpots = Math.round(buildingSize * parkingPerUnit);
    const handicappedParking = requiresHandicappedParking ? getHandicappedParkingRequirements(parkingSpots) : 0;

    const sidewalkArea = buildingFootprint * 0.2; //Sidewalks are 20% the building size;
    const drivewayArea = (approachW * parkingSpotW * parkingSpots / 2) * catchAll; // for a fudge amount for approaches, garbage, utilities, and other 
    const normalParkingArea = parkingSpotW * parkingSpotL * (parkingSpots - handicappedParking)
    const handicappedParkingArea = handicappedParkingSpotW * parkingSpotL * handicappedParking;
    const parkingArea = normalParkingArea + handicappedParkingArea;

    const totalImperviousArea = buildingFootprint + parkingArea + drivewayArea + sidewalkArea;
    const acceptableBuilding = totalImperviousArea <= maxImperviousSurface;// && Math.round(buildingSize * parkingRatio) === parkingSpots

    if (!acceptableBuilding && count < 20000) {
      // Total impervious surface used (parking area + building footprint)
      return helper(
        maxImperviousSurface,
        buildingFootprint - 100,
        count + 1
      );
    } else {
      const footprintSideLength = Math.sqrt(buildingFootprint); // Assuming a square footprint

      return {
        totalBuildingSqft: buildingSize,
        parkingSpotsRequired: Math.ceil(parkingSpots),
        buildingFootprint: {
          area: buildingFootprint,
          dimensions: {
            length: footprintSideLength.toFixed(1), // Approximate length of one side
            width: footprintSideLength.toFixed(1), // Approximate width of one side
          },
        },
        parkingArea,
        drivewayArea,
        imperviousSurfaceRatio:
          (parkingArea + drivewayArea + buildingFootprint + sidewalkArea) /
          lotSize,
        lotSize,
        handicappedParking,
        sidewalkArea,
      };
    }
  }


  return helper(
    maxImperviousSurface,
    initialBuildingFootprint,
    count,
  );
}


export const copyToClipboard = (
  params: Record<string, any>,
  setCopied: (value: React.SetStateAction<boolean>) => void
) => {
  // Convert the parameters object into a query string
  const queryString =
    "?" +
    (Object.keys(params) as Array<keyof typeof params>)
      .map((key) =>
        params[key]
          ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          : undefined
      )
      .filter((qs) => qs)
      .join("&");

  const url = new URL(queryString, window.location.href);
  navigator.clipboard
    .writeText(url.href)
    .then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
};
