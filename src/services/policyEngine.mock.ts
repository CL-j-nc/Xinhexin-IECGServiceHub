
import { PolicyLifecycleData, PolicyLifecycleStatus } from './policyEngine.types';

export const MOCK_LIFECYCLE_REPOSITORY: Record<string, PolicyLifecycleData> = {
  '65001': {
    status: 'ACTIVE',
    statusText: '保障生效中',
    statusDescription: '该团体保单已进入承保生效期，保障责任按合同条款持续有效。',
    notice: '当前无强制操作提示，如需变更请走正式批改流程。',
    policy: {
      policyNo: '65001',
      holderName: '中建三局第一建设工程有限责任公司',
      productName: '团体意外伤害保险（2024版）',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      premium: '￥150,000.00',
      sumInsured: '￥10,000,000.00'
    },
    metrics: { daysSinceEffective: 142 },
    actions: { canDownload: true },
    documents: [{ name: '电子保险单', url: '#', type: 'ORIGINAL' }]
  },
  '65002': {
    status: 'POLICY_AMENDMENT_DONE',
    statusText: '批改完成',
    statusDescription: '该保单已完成批改并生效，批改结果已写入核心记录。',
    notice: '请同时留存原单与批改单，两份文件合并视为完整合规凭证。',
    policy: {
      policyNo: '65002',
      holderName: '顺丰速运（集团）有限公司',
      productName: '团体雇主责任险',
      startDate: '2023-10-15',
      endDate: '2024-10-14',
      premium: '￥280,000.00',
      sumInsured: '￥50,000,000.00'
    },
    actions: { canDownload: true },
    documents: [
      { name: '原始保险单', url: '#', type: 'ORIGINAL' },
      { name: '保单批改单', url: '#', type: 'AMENDMENT' }
    ]
  },
  '65003': {
    status: 'EXPIRING_SOON',
    statusText: '保单即将到期',
    statusDescription: '保单有效期临近结束，续保评估需提前启动以避免保障中断。',
    notice: '建议由团体业务专员在到期前提交续保资料。',
    policy: {
      policyNo: '65003',
      holderName: '北京字节跳动科技有限公司',
      productName: '补充医疗团体保险',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      premium: '￥920,000.00',
      sumInsured: '￥100,000,000.00'
    },
    metrics: { daysToExpiry: 12 },
    actions: { canDownload: true },
    documents: [{ name: '电子保险单', url: '#', type: 'ORIGINAL' }]
  },
  '65004': {
    status: 'POLICY_ENDORSEMENT',
    statusText: '保单保全中',
    statusDescription: '当前处于保全处理中，核心数据暂锁定，待处理完成后自动更新。',
    notice: '处理完成后将生成新凭证并开放下载，期间不对外提供变更文件。',
    policy: {
      policyNo: '65004',
      holderName: '上海米哈游网络科技股份有限公司',
      productName: '员工团体福利保险方案',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      premium: '￥450,000.00',
      sumInsured: '￥30,000,000.00'
    },
    actions: { canDownload: false },
    documents: []
  },
  '65005': {
    status: 'EXPIRED',
    statusText: '保单已过期',
    statusDescription: '保单已过期，保障责任已终止。',
    notice: '如需继续保障，请依据历史存证并重新投保。',
    policy: {
      policyNo: '65005',
      holderName: '华为技术有限公司',
      productName: '海外工程险（团体型）',
      startDate: '2022-01-01',
      endDate: '2023-12-31',
      premium: '￥1,200,000.00',
      sumInsured: '￥200,000,000.00'
    },
    actions: { canDownload: true },
    documents: [{ name: '历史保单存证 (已失效)', url: '#', type: 'ORIGINAL' }]
  }
};

export const SCOPE_BOUNDARY_DATA: PolicyLifecycleData = {
  status: 'OUT_OF_SERVICE_SCOPE',
  statusText: '不在服务范围',
  statusDescription: '未检索到本中心可核验的团体保单记录，可能不在本中心权限范围。',
  notice: '本中心仅覆盖新核心团体保单；95519 为集团通用热线，其查询权限与本中心分离。若热线无法核验，不代表本中心无权威记录。',
  actions: { canDownload: false },
  documents: []
};
