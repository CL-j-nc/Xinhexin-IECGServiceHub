export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
  SUPERVISOR = 'supervisor' // New Role for human agent
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

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
  vehicleCount?: number; // Fleet size
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