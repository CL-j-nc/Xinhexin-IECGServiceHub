/**
 * 核保记录查询 API - 代理到 xinhexin-api
 * 供客服人员查询核保历史、验证码、二维码等信息
 */

// xinhexin-api 的生产环境地址
const UNDERWRITING_API_BASE = 'https://xinhexin-api.chinalife-shiexinhexin.workers.dev/api';

function corsHeaders(): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
}

// 标准化手机号（与 xinhexin-api 保持一致）
function normalizePhone(phone: string | null | undefined): string {
    if (!phone) return '';
    let normalized = String(phone).replace(/\D/g, '');
    if (normalized.startsWith('86') && normalized.length === 13) {
        normalized = normalized.slice(2);
    }
    if (normalized.length !== 11 || !normalized.startsWith('1')) {
        return '';
    }
    return normalized;
}

export const onRequest: PagesFunction = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
        // GET /api/underwriting/by-phone?mobile=xxx
        // 按手机号查询核保记录
        if (request.method === 'GET' && pathname.endsWith('/by-phone')) {
            const mobile = url.searchParams.get('mobile');

            if (!mobile) {
                return jsonResponse({ success: false, error: '请输入手机号' }, 400);
            }

            const normalized = normalizePhone(mobile);
            if (!normalized) {
                return jsonResponse({ success: false, error: '手机号格式无效，请输入11位手机号' }, 400);
            }

            // 调用 xinhexin-api
            const resp = await fetch(`${UNDERWRITING_API_BASE}/underwriting/by-phone?mobile=${normalized}`);
            const data = await resp.json();

            return jsonResponse(data);
        }

        // GET /api/underwriting/history
        // 获取所有核保历史记录
        if (request.method === 'GET' && pathname.endsWith('/history')) {
            const resp = await fetch(`${UNDERWRITING_API_BASE}/underwriting/history`);
            const data = await resp.json();
            return jsonResponse(data);
        }

        // GET /api/underwriting/proposal/:proposalId
        // 查询单个投保单详情（含验证码、二维码）
        const proposalMatch = pathname.match(/\/underwriting\/proposal\/([^\/]+)$/);
        if (request.method === 'GET' && proposalMatch) {
            const proposalId = proposalMatch[1];
            const resp = await fetch(`${UNDERWRITING_API_BASE}/proposal/status?id=${proposalId}`);
            const data = await resp.json();
            return jsonResponse(data);
        }

        // POST /api/underwriting/resend-auth
        // 重发验证码
        if (request.method === 'POST' && pathname.endsWith('/resend-auth')) {
            const body = await request.json().catch(() => ({})) as {
                proposalId?: string;
                operatorId?: string;
                reason?: string;
            };

            if (!body.proposalId) {
                return jsonResponse({ success: false, error: '请提供投保单号' }, 400);
            }

            // 调用 xinhexin-api 的重发验证码接口
            const resp = await fetch(`${UNDERWRITING_API_BASE}/underwriting/resend-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: body.proposalId,
                    operatorId: body.operatorId || 'cs-agent',
                    reason: body.reason || '客服协助重发'
                })
            });

            const data = await resp.json() as any;

            if (!resp.ok || !data.success) {
                return jsonResponse({
                    success: false,
                    error: data.error || '重发验证码失败'
                }, resp.status || 400);
            }

            return jsonResponse({
                success: true,
                authCode: data.authCode,
                qrUrl: data.qrUrl,
                message: data.message || '验证码已重新生成'
            });
        }

        return jsonResponse({ success: false, error: 'Not Found' }, 404);

    } catch (e) {
        console.error('Underwriting API error:', e);
        return jsonResponse({
            success: false,
            error: '核保系统暂时不可用，请稍后重试'
        }, 500);
    }
};
