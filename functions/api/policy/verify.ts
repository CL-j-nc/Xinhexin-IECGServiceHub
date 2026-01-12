// functions/api/policy/verify.ts
interface Env {}

import type { PolicyVerifyResult } from '../../../src/services/policyEngine.types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request } = context;

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const body = await request.json();

        if (!body || typeof body.policyNo !== 'string') {
            return new Response(JSON.stringify({
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '缺少或格式错误的保单号',
                allowBusinessExtension: false
            }), { status: 400 });
        }

        const policyNo = body.policyNo.trim().toUpperCase();

        if (!/^(65|66)\d+$/.test(policyNo)) {
            return new Response(JSON.stringify({
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '保单号格式错误，应以65或66开头后接数字',
                allowBusinessExtension: false
            }), { status: 400 });
        }

        // mock 逻辑（未来替换为 D1 查询）
        let result: PolicyVerifyResult;

        if (policyNo.startsWith('66')) {
            result = {
                success: true,
                status: 'ACTIVE',
                systemMessage: '核验通过，保单状态正常',
                policy: {
                    policyNo,
                    orgName: '示例企业A',
                    productName: '团体商业车险',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    statusLabel: '已生效'
                },
                coverages: [
                    { name: '机动车损失险', amount: 100000, unit: '元' },
                    { name: '第三者责任险', amount: 500000, unit: '元' }
                ],
                allowBusinessExtension: true,
                documents: {
                    electronicPolicyAvailable: true,
                    pdfUrl: `/mock/pdf/${policyNo}.pdf`
                }
            };
        } else if (policyNo.startsWith('65')) {
            const isPending = false;
            result = {
                success: true,
                status: isPending ? 'PENDING' : 'EXPIRED',
                systemMessage: isPending ? '保单处理中' : '保单已过期',
                policy: {
                    policyNo,
                    orgName: '示例企业B',
                    productName: '旧版责任险',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    statusLabel: isPending ? '处理中' : '已过期'
                },
                coverages: [],
                allowBusinessExtension: isPending,
                documents: {
                    electronicPolicyAvailable: !isPending,
                    pdfUrl: isPending ? undefined : `/mock/pdf/${policyNo}.pdf`
                }
            };
        } else {
            result = {
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '未找到该保单记录',
                allowBusinessExtension: false
            };
        }

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            status: 'NOT_FOUND',
            systemMessage: '服务异常',
            allowBusinessExtension: false
        }), { status: 500 });
    }
};
