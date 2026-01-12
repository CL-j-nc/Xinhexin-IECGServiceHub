// src/services/policyEngine.types.ts
export type PolicyVerifyStatus =
    | 'ACTIVE'     // 已生效
    | 'EXPIRED'    // 已失效
    | 'PENDING'    // 批改/处理中
    | 'NOT_FOUND'; // 未查询到

export interface PolicyVerifyResult {
    /** 核验是否成功（系统层判断） */
    success: boolean;
    /** 核验状态（业务层判断） */
    status: PolicyVerifyStatus;
    /** 系统权威提示（给 UI 第一层使用） */
    systemMessage: string;
    /** 保单主体信息（success=true 时必有） */
    policy?: {
        policyNo: string;
        orgName: string;
        productName: string;
        startDate: string;     // ISO string 或 YYYY-MM-DD
        endDate: string;       // ISO string 或 YYYY-MM-DD
        statusLabel: string;   // 用于展示，如“已生效”
    };
    /** 承保明细（可选，允许为空数组） */
    coverages?: Array<{
        name: string;
        amount: number;
        unit?: string;
    }>;
    /** 是否允许业务延展（如保全） */
    allowBusinessExtension: boolean;
    /** 电子保单信息 */
    documents?: {
        electronicPolicyAvailable: boolean;
        pdfUrl?: string;
    };
}