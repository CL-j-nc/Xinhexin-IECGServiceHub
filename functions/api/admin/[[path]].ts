/**
 * 管理员操作 API - 代理到 xinhexin-api
 * 处理代行权等需要较高权限的操作
 */

const API_BASE = 'https://xinhexin-api.chinalife-shiexinhexin.workers.dev/api';

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

export const onRequest: PagesFunction = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
        // POST /api/admin/substitute-auth
        // L1+ 管理员代客户完成身份认证
        if (request.method === 'POST' && pathname.endsWith('/substitute-auth')) {
            const body = await request.json().catch(() => ({})) as {
                proposalId?: string;
                operatorId?: string;
                operatorRole?: string;
                verificationMethod?: string;
                reason?: string;
            };

            // 前端校验
            if (!body.proposalId) {
                return jsonResponse({ success: false, error: '请提供投保单号' }, 400);
            }
            if (!body.operatorId) {
                return jsonResponse({ success: false, error: '缺少操作人信息' }, 400);
            }
            if (!body.operatorRole || !['L1', 'L2', 'L3'].includes(body.operatorRole)) {
                return jsonResponse({ success: false, error: '无权限执行此操作' }, 403);
            }
            if (!body.verificationMethod || !['PHONE', 'VIDEO', 'IN_PERSON'].includes(body.verificationMethod)) {
                return jsonResponse({ success: false, error: '请选择身份核实方式' }, 400);
            }
            if (!body.reason || body.reason.trim().length < 10) {
                return jsonResponse({ success: false, error: '操作理由至少需要10个字符' }, 400);
            }

            // 调用 xinhexin-api
            const resp = await fetch(`${API_BASE}/admin/substitute-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proposalId: body.proposalId,
                    operatorId: body.operatorId,
                    operatorRole: body.operatorRole,
                    verificationMethod: body.verificationMethod,
                    reason: body.reason.trim()
                })
            });

            const data = await resp.json() as any;

            if (!resp.ok || !data.success) {
                return jsonResponse({
                    success: false,
                    error: data.error || '代认证操作失败'
                }, resp.status || 400);
            }

            return jsonResponse({
                success: true,
                auditLogId: data.auditLogId,
                message: data.message || '已代客户完成身份认证'
            });
        }

        // GET /api/admin/audit-log?proposalId=xxx
        // 查询审计日志（预留，Phase 2 实现）
        if (request.method === 'GET' && pathname.endsWith('/audit-log')) {
            return jsonResponse({ success: false, error: '功能开发中' }, 501);
        }

        return jsonResponse({ success: false, error: 'Not Found' }, 404);

    } catch (e) {
        console.error('Admin API error:', e);
        return jsonResponse({
            success: false,
            error: '管理员服务暂时不可用，请稍后重试'
        }, 500);
    }
};
