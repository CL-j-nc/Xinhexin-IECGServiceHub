import { Env } from './env';

interface PolicyChangeRequest {
    policyNo: string;
    changeType: 'ADDRESS' | 'CONTACT' | 'BENEFICIARY' | 'OTHER';
    changeDetails: string;
    applicantName: string;
    applicantContact: string;
    attachments?: string[];
}

interface PolicyChangeRecord {
    changeId: string;
    policyNo: string;
    changeType: string;
    changeDetails: string;
    status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
    applicantName: string;
    applicantContact: string;
    createdAt: string;
    updatedAt: string;
    reviewNote?: string;
}

// In-memory store for MVP (will be replaced with D1 later)
const changeStore: Map<string, PolicyChangeRecord> = new Map();

// Initialize with dummy data
const dummyChangeId1 = 'CHG-1707292800000-1234';
changeStore.set(dummyChangeId1, {
    changeId: dummyChangeId1,
    policyNo: '6510000001',
    changeType: 'ADDRESS',
    changeDetails: '变更地址为：上海市浦东新区陆家嘴环路1000号',
    status: 'APPROVED',
    applicantName: '张三',
    applicantContact: '13800138000',
    createdAt: '2024-02-07T10:00:00.000Z',
    updatedAt: '2024-02-08T14:30:00.000Z',
    reviewNote: '审核通过'
});

const dummyChangeId2 = 'CHG-1707379200000-5678';
changeStore.set(dummyChangeId2, {
    changeId: dummyChangeId2,
    policyNo: '6510000001',
    changeType: 'CONTACT',
    changeDetails: '变更联系人为：李四，电话：13900139000',
    status: 'PENDING',
    applicantName: '李四',
    applicantContact: '13900139000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

function generateChangeId(): string {
    return `CHG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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

    console.log(`[PolicyChange] Request: ${request.method} ${pathname}`);

    // CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // POST /api/policy/change/request - 提交变更请求
    if (request.method === 'POST' && pathname.endsWith('/request')) {
        try {
            const body: PolicyChangeRequest = await request.json();

            if (!body.policyNo || !body.changeType || !body.changeDetails) {
                return jsonResponse({ success: false, error: '缺少必填字段' }, 400);
            }

            // Validate policy number format (65 or 66 prefix)
            if (!/^(65|66)\d+$/.test(body.policyNo)) {
                return jsonResponse({ success: false, error: '保单号格式无效' }, 400);
            }

            const changeId = generateChangeId();
            const now = new Date().toISOString();

            const record: PolicyChangeRecord = {
                changeId,
                policyNo: body.policyNo,
                changeType: body.changeType,
                changeDetails: body.changeDetails,
                status: 'PENDING',
                applicantName: body.applicantName || '未知',
                applicantContact: body.applicantContact || '',
                createdAt: now,
                updatedAt: now,
            };

            changeStore.set(changeId, record);

            return jsonResponse({
                success: true,
                data: {
                    changeId,
                    message: '变更申请已提交，请等待审核',
                },
            });
        } catch (e) {
            return jsonResponse({ success: false, error: '请求解析失败' }, 400);
        }
    }

    // GET /api/policy/change/list?policyNo={policyNo} - 查询变更记录
    if (request.method === 'GET' && pathname.endsWith('/list')) {
        const policyNo = url.searchParams.get('policyNo');

        if (!policyNo) {
            return jsonResponse({ success: false, error: '请提供保单号' }, 400);
        }

        const records = Array.from(changeStore.values())
            .filter(r => r.policyNo === policyNo)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return jsonResponse({
            success: true,
            data: records,
        });
    }

    // GET /api/policy/change/{changeId} - 查看变更详情
    const changeIdMatch = pathname.match(/\/change\/([^\/]+)$/);
    if (request.method === 'GET' && changeIdMatch) {
        const changeId = changeIdMatch[1];

        if (changeId === 'list' || changeId === 'request') {
            return jsonResponse({ success: false, error: '路由不匹配' }, 404);
        }

        const record = changeStore.get(changeId);

        if (!record) {
            return jsonResponse({ success: false, error: '变更记录不存在' }, 404);
        }

        return jsonResponse({
            success: true,
            data: record,
        });
    }

    return jsonResponse({ success: false, error: 'Not Found' }, 404);
};
