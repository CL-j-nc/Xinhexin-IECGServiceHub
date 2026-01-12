// src/services/policyEngine.ts
import { PolicyVerifyResult, PolicyVerifyStatus } from './policyEngine.types.ts';

export const verifyPolicy = async (policyNo: string): Promise<PolicyVerifyResult> => {
  // 模拟延迟，体现真实接口调用感
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  // mock 数据 - 未来替换为真实 D1 查询 + Worker 逻辑
  const mockData: Record<string, PolicyVerifyResult> = {
    '6620250001': {
      success: true,
      status: 'ACTIVE',
      systemMessage: '核验通过，保单状态正常',
      policy: {
        policyNo: '6620250001',
        orgName: '广州迅捷物流有限公司',
        productName: '团体商业车险（含三者1000万）',
        startDate: '2025-01-01',
        endDate: '2026-12-31',
        statusLabel: '已生效'
      },
      coverages: [
        { name: '机动车损失保险', amount: 5000000, unit: '元' },
        { name: '第三者责任保险', amount: 10000000, unit: '元' },
        { name: '车上人员责任险(司机)', amount: 200000, unit: '元/座' },
        { name: '车上人员责任险(乘客)', amount: 150000, unit: '元/座' }
      ],
      allowBusinessExtension: true,
      documents: {
        electronicPolicyAvailable: true,
        pdfUrl: '/api/documents/6620250001.pdf' // 占位，未来真实路径
      }
    },
    '6620240099': {
      success: true,
      status: 'EXPIRED',
      systemMessage: '保单已过期',
      policy: {
        policyNo: '6620240099',
        orgName: '华南建材集团',
        productName: '车辆综合险（旧版）',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        statusLabel: '已过期'
      },
      coverages: [
        { name: '第三者责任险', amount: 2000000, unit: '元' }
      ],
      allowBusinessExtension: false,
      documents: {
        electronicPolicyAvailable: true,
        pdfUrl: '/api/documents/6620240099.pdf'
      }
    },
    '6620250987': {
      success: true,
      status: 'PENDING',
      systemMessage: '保单保全处理中',
      policy: {
        policyNo: '6620250987',
        orgName: '深港跨境物流有限公司',
        productName: '车队综合险',
        startDate: '2025-09-01',
        endDate: '2026-08-31',
        statusLabel: '保全处理中'
      },
      coverages: [],
      allowBusinessExtension: true,
      documents: {
        electronicPolicyAvailable: false
      }
    }
  };

  const found = mockData[policyNo.toUpperCase()];

  if (found) {
    return found;
  }

  return {
    success: false,
    status: 'NOT_FOUND',
    systemMessage: '未找到匹配的保单记录',
    allowBusinessExtension: false
  };
};
