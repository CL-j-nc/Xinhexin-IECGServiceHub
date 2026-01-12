import { PolicyData } from '../types';

// 1. Risk Control: Forbidden words that trigger immediate fallback
export const RISK_WORDS = [
  'gamble', 'betting', 'illegal', 'hack', 'violence', 'kill', 'scam', 
  'bribe', 'laundering', '赌博', '洗钱', '暴力', '诈骗', '黑客'
];

// 2. Mock Database for "Read-Only" Commercial Fleet Policy Queries
export const MOCK_POLICY_DB: Record<string, PolicyData> = {
  '668888': {
    id: '668888',
    holder: '张经理 (车队管理)',
    companyName: '极速物流集团有限公司',
    status: 'Active',
    expiryDate: '2025-12-31',
    type: '商业车队综合保险 (含三者500万)',
    vehicleCount: 50,
    coverages: [
        { name: '机动车损失保险', amount: '足额投保', premium: 125000 },
        { name: '第三者责任保险', amount: '500万', premium: 85000 },
        { name: '车上人员责任保险(司机)', amount: '10万/座', premium: 12000 },
        { name: '车上人员责任保险(乘客)', amount: '10万/座', premium: 48000 }
    ]
  },
  '669999': {
    id: '669999',
    holder: '李专员 (运营部)',
    companyName: '城市公交运输总公司',
    status: 'Expired',
    expiryDate: '2023-01-01',
    type: '商业第三者责任险',
    vehicleCount: 12,
    coverages: [
        { name: '第三者责任保险', amount: '200万', premium: 24000 }
    ]
  }
};

// 3. Static Q&A Map (Local fast-path for B2B)
export const STATIC_QA: Record<string, string> = {
  'hotline': '我们的 VIP 客户服务专线是 400-800-8888。',
  '电话': '我们的 VIP 客户服务专线是 400-800-8888。',
  'hours': '大宗业务服务时间为周一至周五，上午 9:00 至 下午 6:00。',
  '时间': '大宗业务服务时间为周一至周五，上午 9:00 至 下午 6:00。',
  'claim': '关于大宗团体理赔，请直接联系您的专属客户经理或访问“团体理赔”门户。',
  '理赔': '关于大宗团体理赔，请直接联系您的专属客户经理或访问“团体理赔”门户。',
  'address': '总部地址：北京市金融街123号。',
  '地址': '总部地址：北京市金融街123号。',
};
