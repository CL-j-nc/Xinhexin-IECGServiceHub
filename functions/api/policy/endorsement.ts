import { Env } from './env';

interface EndorsementRecord {
    endorseNo: string;
    policyNo: string;
    endorseType: 'ADD_INSURED' | 'REMOVE_INSURED' | 'CHANGE_COVERAGE' | 'EXTEND_PERIOD' | 'OTHER';
    description: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    effectiveDate: string;
    premiumChange?: number;
    applicantName: string;
    createdAt: string;
    updatedAt: string;
    approvalNote?: string;
}

interface EndorsementApplyRequest {
    policyNo: string;
    endorseType: string;
    description: string;
    effectiveDate: string;
    applicantName: string;
    applicantContact: string;
}

// In-memory store for MVP
const endorsementStore: Map<string, EndorsementRecord> = new Map();

function generateEndorseNo(): string {
    const date = new Date();
    const prefix = 'ED';
    const year = date.getFullYear();
    const seq = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${prefix}${year}${seq}`;
}

function corsHeaders(): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // GET /api/policy/endorsement/list?policyNo={policyNo} - 批单列表
    if (request.method === 'GET' && pathname.endsWith('/list')) {
        const policyNo = url.searchParams.get('policyNo');

        if (!policyNo) {
            return jsonResponse({ success: false, error: '请提供保单号' }, 400);
        }

        const records = Array.from(endorsementStore.values())
            .filter(r => r.policyNo === policyNo)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return jsonResponse({
            success: true,
            data: records,
        });
    }

    // POST /api/policy/endorsement/apply - 申请批单
    if (request.method === 'POST' && pathname.endsWith('/apply')) {
        try {
            const body: EndorsementApplyRequest = await request.json();

            if (!body.policyNo || !body.endorseType || !body.description) {
                return jsonResponse({ success: false, error: '缺少必填字段' }, 400);
            }

            // Validate policy number format
            if (!/^(65|66)\d+$/.test(body.policyNo)) {
                return jsonResponse({ success: false, error: '保单号格式无效' }, 400);
            }

            const endorseNo = generateEndorseNo();
            const now = new Date().toISOString();

            const record: EndorsementRecord = {
                endorseNo,
                policyNo: body.policyNo,
                endorseType: body.endorseType as any,
                description: body.description,
                status: 'PENDING',
                effectiveDate: body.effectiveDate || now,
                applicantName: body.applicantName || '未知',
                createdAt: now,
                updatedAt: now,
            };

            endorsementStore.set(endorseNo, record);

            return jsonResponse({
                success: true,
                data: {
                    endorseNo,
                    message: '批单申请已提交，预计1-3个工作日内审核',
                },
            });
        } catch (e) {
            return jsonResponse({ success: false, error: '请求解析失败' }, 400);
        }
    }

    // GET /api/policy/endorsement/{endorseNo} - 批单详情
    const endorseMatch = pathname.match(/\/endorsement\/([^\/]+)$/);
    if (request.method === 'GET' && endorseMatch) {
        const endorseNo = endorseMatch[1];

        if (endorseNo === 'list' || endorseNo === 'apply') {
            return jsonResponse({ success: false, error: '路由不匹配' }, 404);
        }

        const record = endorsementStore.get(endorseNo);

        if (!record) {
            return jsonResponse({ success: false, error: '批单记录不存在' }, 404);
        }

        return jsonResponse({
            success: true,
            data: record,
        });
    }

    return jsonResponse({ success: false, error: 'Not Found' }, 404);
};
