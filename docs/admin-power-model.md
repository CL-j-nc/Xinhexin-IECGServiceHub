# 管理员权能三层模型

> Company Operator Administrator Power Model

## 概述

客服系统作为公司与客户之间的稳定通信链路，在业务员不可用时承担"公司级兜底"职责。管理员权能分为三层递进模型：

| 层级 | 权能 | 英文 | 定义 |
|------|------|------|------|
| ① | 纠错权 | Correction | 修正系统或人为错误，恢复业务正确状态 |
| ② | 兜底权 | Guarantee | 当原流程中断时接管，确保业务不卡死 |
| ③ | 代行权 | Substitution | 代表公司直接完成业务闭环 |

---

## ① 纠错权 (Correction)

**定义**：修正系统或人为错误，恢复业务正确状态

**典型场景**：
- 客户信息录入错误（姓名、身份证号、联系方式）
- 车辆信息错误（车牌号、VIN码、品牌型号）
- 保费计算异常需人工调整
- 核保决策错误需撤回重做

**授权要求**：操作理由 + 修改前后对比记录

**审计**：系统自动记录变更日志

---

## ② 兜底权 (Guarantee)

**定义**：当原流程中断时接管，确保业务不卡死

**典型场景**：
- 业务员离职/失联，客户无人跟进
- 系统故障导致流程中断
- 客户收不到验证码/短信
- 支付渠道临时不可用

**授权要求**：中断原因说明 + 接管记录

**审计**：工单转移日志 + 后续操作追踪

---

## ③ 代行权 (Substitution)

**定义**：当客户无法、不能、不再通过原路径完成业务时，管理员可以"代表公司直接完成该业务闭环"

### 触发条件

| 触发词 | 含义 | 典型场景 |
|--------|------|----------|
| **无法** | 技术障碍 | 客户手机无法接收短信、二维码过期、支付渠道故障 |
| **不能** | 能力障碍 | 老年客户不会操作智能手机、客户身处境外网络受限 |
| **不再** | 意愿/状态变更 | 投保人去世、客户明确委托、业务员离职失联 |

### Company Operator 代行权清单

| 代行场景 | 授权要求 | 留存凭证 |
|----------|----------|----------|
| **代客户补充材料** | — | 备注 + 时间戳 |
| **完成客户认证** | 身份核实通过 | 核实记录 + 操作理由 |
| **代客户提交理赔** | 客户明确授权 | 授权录音/文字记录 |
| **代客户支付 / 发起退保** | 客户书面授权或放弃声明 | 签名文件 / 电话录音 |

### 风险等级递进

```
Level 0: 代补充材料
├── 风险：极低（仅协助上传，材料来源于客户）
├── 授权：无需额外授权
└── 审计：备注 + 自动时间戳

Level 1: 完成认证
├── 风险：低（加速流程，不涉及资金）
├── 授权：单方核实即可
└── 审计：核实记录 + 操作理由

Level 2: 代提理赔
├── 风险：中（涉及理赔金流向）
├── 授权：客户口头明确授权
└── 审计：录音存档 + 工单关联

Level 3: 代支付 / 代退保
├── 风险：高（直接资金操作）
├── 授权：书面授权或正式放弃声明
└── 审计：原件扫描 + 双人复核
```

---

## 权能关系

```
纠错权 ──┐
         ├── 代行权 = 纠错权 + 兜底权 + 代表公司完成
兜底权 ──┘
```

- **纠错权**：修正数据错误，不改变流程归属
- **兜底权**：接管流程，但仍需客户参与
- **代行权**：完全代替客户/业务员，以公司名义完成闭环

---

## 治理原则

1. **最小权限**：优先使用低层级权能，代行权仅在必要时使用
2. **留痕可追**：所有操作必须有完整审计日志
3. **凭证留存**：代行权操作需留存授权凭证
4. **双人复核**：高风险操作（Level 3）需双人确认

---

## 系统实现

### 审计日志结构

```typescript
interface AdminOperationLog {
  id: string;
  operator_id: string;
  operator_name: string;
  power_type: 'CORRECTION' | 'GUARANTEE' | 'SUBSTITUTION';
  action: string;
  target_id: string;           // 操作对象ID（投保单/理赔单等）
  reason: string;              // 操作理由
  evidence?: {
    type: 'RECORDING' | 'DOCUMENT' | 'SCREENSHOT';
    url: string;
    uploaded_at: string;
  };
  before_state?: object;       // 修改前状态（纠错权）
  after_state?: object;        // 修改后状态（纠错权）
  reviewer_id?: string;        // 复核人（Level 3）
  created_at: string;
}
```

### 代行权请求结构

```typescript
interface SubstitutionRequest {
  type: 'MATERIAL_UPLOAD' | 'AUTH_COMPLETION' | 'CLAIM_SUBMISSION' | 'PAYMENT' | 'SURRENDER';
  proposal_id: string;

  // Level 0: 补充材料
  material_note?: string;

  // Level 1: 认证
  verification_passed?: boolean;
  verification_method?: 'PHONE' | 'VIDEO' | 'IN_PERSON';

  // Level 2+: 授权凭证
  authorization?: {
    type: 'VERBAL' | 'WRITTEN' | 'WAIVER';
    recording_id?: string;      // 录音文件ID
    document_url?: string;      // 书面授权扫描件
    witness?: string;           // 见证人（双人复核）
  };

  reason: string;               // 操作理由（必填）
}
```

---

## 版本记录

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2025-02-14 | 初始版本，定义三层权能模型 |
