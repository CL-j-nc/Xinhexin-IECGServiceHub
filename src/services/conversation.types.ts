// conversation.types.ts
export enum ConversationStatus {
    AI_ONLY = 'AI_ONLY',               // 仅 AI 处理，无人工介入
    HUMAN_INTERVENED = 'HUMAN_INTERVENED', // 人工介入并接管部分或全部回复
    CLOSED = 'CLOSED'                  // 会话已结束，仅可查看，不可再写入
}

export enum MessageRole {
    CLIENT = 'CLIENT',
    AI = 'AI',
    AGENT = 'AGENT',
    SYSTEM = 'SYSTEM'
}

export interface ConversationMessage {
    id: string;
    conversationId: string;  // 所属会话（必须）
    role: MessageRole;       // 发送角色（必须）
    content: string;         // 内容（必须）
    timestamp: Date;         // 时间戳（必须）
    attachments?: string[];  // 可选附件
    isError?: boolean;       // 错误/异常标记（可选）
}

export interface AIDraft {
    id: string;
    conversationId: string;  // 所属会话（必须）
    candidates: string[];    // AI 生成的多个候选回复
    generatedAt: Date;       // 生成时间
    selected?: string;       // 员工选择的回复（可选）
    modified?: string;       // 员工修改后的回复（可选）
    blocked?: boolean;       // 是否被阻断（默认 false）
}

export interface BusinessDocument {
    id: string;
    conversationId: string;  // 绑定 conversationId（必须）
    name: string;
    type: 'POLICY_PDF' | 'AMENDMENT' | 'INVOICE' | 'OTHER';
    url: string;
    uploadedBy: string;      // 员工 ID
    timestamp: Date;
    linkedPolicyNo?: string; // 绑定 policy_no
}

export interface Conversation {
    conversationId: string;  // 唯一 conversationId
    clientId: string;
    status: ConversationStatus;
    startTime: Date;
    endTime?: Date;
    messages: ConversationMessage[];
    aiDrafts: AIDraft[];      // AI 预回答列表
    documents: BusinessDocument[]; // 业务资料
    assignedAgent?: string;
    aiResponses: string[];    // AI 最终回复日志
    interventions: number;    // 人工介入计数
}

export interface MonitoringMetrics {
    responseTimeAvg: number;
    interventionRate: number;
    riskFlags: number;
}

export interface ConversationHubData {
    activeConversations: Conversation[];
    monitoring: MonitoringMetrics;
}
