
/**
 * Service Hub Lifecycle States
 * Defined by the Underwriting Core business rules.
 */
export type PolicyLifecycleStatus =
  | 'ACTIVE'                  // 生效中
  | 'EXPIRING_SOON'           // 即将到期
  | 'EXPIRED'                 // 已过期（脱保）
  | 'POLICY_ENDORSEMENT'      // 保单保全中
  | 'POLICY_AMENDMENT'        // 保单批改中
  | 'POLICY_REINSTATEMENT'    // 保单复效
  | 'POLICY_AMENDMENT_DONE'   // 批改完成（双PDF）
  | 'OUT_OF_SERVICE_SCOPE';   // 不在服务范围（权限边界）

export interface PolicyDocument {
  name: string;
  url: string;
  type: 'ORIGINAL' | 'AMENDMENT' | 'GENERAL';
}

export interface PolicyLifecycleData {
  /** Authoritative Lifecycle State */
  status: PolicyLifecycleStatus;
  /** Professional Title (Facts only) */
  statusText: string;
  /** Detailed State Description */
  statusDescription: string;
  /** Specific Risk or Actionable Notice */
  notice?: string;
  
  /** Entity Information */
  policy?: {
    policyNo: string;
    holderName: string;
    productName: string;
    startDate: string;
    endDate: string;
    premium: string;
    sumInsured: string;
  };

  /** Lifecycle Metrics */
  metrics?: {
    daysSinceEffective?: number;
    daysToExpiry?: number;
  };

  /** Fact-Based Controls */
  actions: {
    canDownload: boolean;
  };

  /** Digital Asset Repository */
  documents: PolicyDocument[];
}
