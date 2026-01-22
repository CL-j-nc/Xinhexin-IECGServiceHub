export interface PersonInfo {
  name: string;
  idType: string;
  idCard: string;
  mobile: string;
  address: string;
  idImage?: string;
  principalName?: string;
  principalIdCard?: string;
  principalAddress?: string;
  principalIdImage?: string;
}

export interface VehicleInfo {
  plate: string;
  vin: string;
  engineNo: string;
  brand: string;
  vehicleOwner?: string;
  registerDate: string;
  curbWeight: string;
  approvedLoad: string;
  approvedPassengers: string;
  licenseImage?: string;
}

export interface CoverageItem {
  type: string;
  level: string;
  amount?: number;
}

export interface InsuranceData {
  policyId?: string;
  status?: 'SUBMITTED' | 'UNDERWRITING_APPROVED' | 'UNDERWRITING_REJECTED' | 'PAID' | 'COMPLETED' | 'INVALIDATED' | string;
  proposer: PersonInfo;
  insured: PersonInfo;
  vehicle: VehicleInfo;
  coverages: CoverageItem[];
  underwritingInfo?: {
    rejectReason?: string;
    payment?: {
      alipayQr?: string;
    };
    contractToken?: string;
  };
}
