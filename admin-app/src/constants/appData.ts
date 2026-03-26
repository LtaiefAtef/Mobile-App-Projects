export interface Contract {
  id: string
  contractNumber: string
  insuranceCompany: string
  client: string
  type: 'Auto' | 'Habitation' | 'Santé'
  status: 'En cours' | 'Expiré' | 'Suspendu'
  pack: string
  paymentMethod: string
  startDate: string
  endDate: string
  netPremium: string
  fees: string
  taxes: string
  fg: string
  totalPremium: string
  brand?: string
  registration?: string
  marketValue?: string
  drivingLicenseNumber?: string
}

export interface Claim {
  id: string;
  submittedAt: string;
  accidentDate: string;
  accidentLocation: string;
  injuries: {
    anyInjuries: boolean | null;
    injuryDetails: string | null;
  };
  otherVehiclesDamaged: {
    otherVehicleInvolved: boolean | null;
    numberOfVehicles: number | null;
  };
  witnesses: {
    fullName: string | null;
    address: string | null;
    isPassengerOfVehicle: boolean | null;
  }[];
  insuranceCompany: {
    vehicleA: {
      companyName: string | null;
      contractNumber: string | null;
    };
    vehicleB: {
      companyName: string | null;
      contractNumber: string | null;
    };
  };
  driver: {
    driverA: {
      fullName: string;
      address: string;
      dateOfBirth: string;
      license: string;
    };
    driverB: {
      fullName: string;
      address: string;
      dateOfBirth: string;
      license: string;
    };
  };
  visibleDamage: string;
  circumstances: {
    vehicleA: CircumstancesVehicle;
    vehicleB: CircumstancesVehicle;
  };
  sketchImageUrl: string;
  signatures: {
    vehicleA: {
      signed: boolean;
      signedAt: string | null;
    };
    vehicleB: {
      signed: boolean;
      signedAt: string | null;
    };
  };
  accidentPerspective: {
    driverA: string;
    driverB: string;
  };
}

interface CircumstancesVehicle {
  parkedStationary: boolean;
  leavingParkingOrDriveway: boolean;
  enteringParkingOrDriveway: boolean;
  exitingParkingLotOrPrivateLand: boolean;
  enteringRoundabout: boolean;
  alreadyInRoundabout: boolean;
  rearEndSameDirection: boolean;
  changingLanes: boolean;
  overtaking: boolean;
  turningRight: boolean;
  turningLeft: boolean;
  reversing: boolean;
  crossingWrongSideOfRoad: boolean;
  crossingIntersection: boolean;
  ranRedLight: boolean;
  failedToYieldRightOfWay: boolean;
  totalChecked: number;
}