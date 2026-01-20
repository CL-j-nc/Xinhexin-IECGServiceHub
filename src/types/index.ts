export interface Coverage {
  name: string;   // 险种名称
  amount: string; // 保额 (支持 "50万", "足额" 等文本)
  premium: number;// 保费金额
}

export interface PolicyData {
  id: string;
  holder: string; // Account Manager or Admin Name
  companyName: string; // The Corporate Client Name
  status: 'Active' | 'Expired' | 'Pending';
  expiryDate: string;
  type: string; // Plan Name / Bundle Name
  vehicleCount?: number; // Vehicle count
  coverages?: Coverage[]; // Detailed coverage list
}

export enum IntentType {
  GREETING = 'GREETING',
  POLICY_QUERY = 'POLICY_QUERY',
  COMPLAINT = 'COMPLAINT',
  GENERAL_QA = 'GENERAL_QA',
  RISK_DETECTED = 'RISK_DETECTED',
  UNKNOWN = 'UNKNOWN'
}

export interface CoachingTip {
  id: string;
  category: 'TRUST' | 'RISK' | 'TACTIC' | 'INFO';
  content: string;
  priority: 'HIGH' | 'NORMAL';
}

export interface ClaimUpload {
  id: string;
  name: string;
  url: string;
}

export interface ClaimFormData {
  policyNo: string;
  insuredEntity: string;
  accidentType: string;
  accidentDate: string;
  accidentLocation: string;
  accidentDescription: string;
  reporterName: string;
  reporterContact: string;
  uploads: ClaimUpload[];
}

export interface ClaimRecord {
  id: string;
  date: string;
  status: string;
}

export interface ClaimCreateResult {
  id: string;
  status: 'submitted';
}

export interface ClaimDetail {
  id: string;
  details: string;
}
