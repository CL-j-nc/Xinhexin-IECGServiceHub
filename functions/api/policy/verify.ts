// functions/api/policy/verify.ts

// 在文件内部直接声明需要的类型（避免外部依赖）
type PolicyVerifyStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'NOT_FOUND';

interface PolicyVerifyResult {
    success: boolean;
    status: PolicyVerifyStatus;
    systemMessage: string;
    policy?: {
        policyNo: string;
        orgName: string;
        productName: string;
        startDate: string;
        endDate: string;
        statusLabel: string;
    };
    coverages?: Array<{
        name: string;
        amount: number;
        unit?: string;
    }>;
    allowBusinessExtension: boolean;
    documents?: {
        electronicPolicyAvailable: boolean;
        pdfUrl?: string;
    };
}

export const onRequestPost = async (context: any) => {
    try {
        const { request } = context;

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const body = await request.json() as { policyNo?: string };

        if (!body || typeof body.policyNo !== 'string') {
            return Response.json(
                {
                    success: false,
                    status: 'NOT_FOUND' as const,
                    systemMessage: '缺少或格式错误的保单号',
                    allowBusinessExtension: false
                },
                { status: 400 }
            );
        }

        const policyNo = body.policyNo.trim().toUpperCase();

        // 保单号必须以 65 或 66 开头 + 数字
        if (!/^(65|66)\d+$/.test(policyNo)) {
            return Response.json(
                {
                    success: false,
                    status: 'NOT_FOUND' as const,
                    systemMessage: '保单号格式错误，应以65或66开头后接数字',
                    allowBusinessExtension: false
                },
                { status: 400 }
            );
        }

        // mock 逻辑（未来替换为 D1 查询）
        let result: PolicyVerifyResult;

        if (policyNo.startsWith('66')) {
            // 模拟已生效保单
            result = {
                success: true,
                status: 'ACTIVE',
                systemMessage: '核验通过，保单状态正常',
                policy: {
                    policyNo,
                    orgName: '示例企业（66开头）有限公司',
                    productName: '团体商业车险综合方案',
                    startDate: '2025-01-01',
                    endDate: '2026-12-31',
                    statusLabel: '已生效'
                },
                coverages: [
                    { name: '机动车损失险', amount: 800000, unit: '元' },
                    { name: '第三者责任险', amount: 10000000, unit: '元' },
                    { name: '车上人员责任险', amount: 200000, unit: '元/座' }
                ],
                allowBusinessExtension: true,
                documents: {
                    electronicPolicyAvailable: true,
                    pdfUrl: `/api/policy/upload?policyNo=${policyNo}`
                }
            };
        } else {
            // 65 开头 - 随机模拟过期或处理中
            const rand = Math.random();
            if (rand < 0.5) {
                result = {
                    success: true,
                    status: 'EXPIRED',
                    systemMessage: '保单已过期',
                    policy: {
                        policyNo,
                        orgName: '示例企业（65开头）有限公司',
                        productName: '旧版车队责任险',
                        startDate: '2024-01-01',
                        endDate: '2024-12-31',
                        statusLabel: '已过期'
                    },
                    coverages: [],
                    allowBusinessExtension: false,
                    documents: {
                        electronicPolicyAvailable: true,
                        pdfUrl: `/api/policy/upload?policyNo=${policyNo}`
                    }
                };
            } else {
                result = {
                    success: true,
                    status: 'PENDING',
                    systemMessage: '保单正在批改处理中',
                    policy: {
                        policyNo,
                        orgName: '示例企业（65开头）有限公司',
                        productName: '车队综合险（批改中）',
                        startDate: '2025-06-01',
                        endDate: '2026-05-31',
                        statusLabel: '处理中'
                    },
                    coverages: [],
                    allowBusinessExtension: true,
                    documents: {
                        electronicPolicyAvailable: false
                    }
                };
            }
        }

        return Response.json(result, { status: 200 });
    } catch (err) {
        console.error(err);
        return Response.json(
            {
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '服务处理异常',
                allowBusinessExtension: false
            },
            { status: 500 }
        );
    }
};