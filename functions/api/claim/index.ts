import { Env } from '../policy/env';
import { ClaimCase, ClaimState, TimelineEntry } from './claim.types';

// Helper to interact with D1
// Table Schema assumed:
// CREATE TABLE Claims (claimId TEXT PRIMARY KEY, policyNo TEXT, state TEXT, data TEXT, created_at INTEGER, updated_at INTEGER);

async function saveClaim(db: D1Database, claim: ClaimCase): Promise<void> {
    const data = JSON.stringify(claim);
    await db.prepare(
        `INSERT OR REPLACE INTO Claims (claimId, policyNo, state, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(claim.claimId, claim.policyNo, claim.state, data, claim.createdAt, claim.updatedAt).run();
}

async function getClaim(db: D1Database, claimId: string): Promise<ClaimCase | null> {
    const result = await db.prepare(`SELECT data FROM Claims WHERE claimId = ?`).bind(claimId).first('data');
    if (!result) return null;
    return JSON.parse(result as string) as ClaimCase;
}

async function listClaimsByPolicy(db: D1Database, policyNo: string): Promise<ClaimCase[]> {
    const results = await db.prepare(`SELECT data FROM Claims WHERE policyNo = ? ORDER BY created_at DESC`).bind(policyNo).all();
    if (!results.results) return [];
    return results.results.map((r: any) => JSON.parse(r.data as string) as ClaimCase);
}

function generateClaimId(): string {
    return `CLM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // POST /api/claim/draft
    if (request.method === 'POST' && pathname.endsWith('/draft')) {
        try {
            const body = await request.json() as { policyNo: string; conversationId?: string };

            if (!body.policyNo) {
                return jsonResponse({ success: false, error: '请提供保单号' }, 400);
            }

            if (!/^(65|66)\d+$/.test(body.policyNo)) {
                return jsonResponse({ success: false, error: '保单号格式无效，团体保单号应以65或66开头' }, 400);
            }

            const claimId = generateClaimId();
            const now = Date.now();

            const claim: ClaimCase = {
                claimId,
                policyNo: body.policyNo,
                conversationId: body.conversationId,
                state: ClaimState.DRAFT,
                attachments: [],
                timeline: [
                    {
                        timestamp: now,
                        action: 'CREATED',
                        description: '报案草稿已创建',
                        actor: 'USER',
                    },
                ],
                createdAt: now,
                updatedAt: now,
            };

            await saveClaim(env.DB, claim);

            return jsonResponse({
                success: true,
                data: claim,
            });
        } catch (e) {
            console.error(e);
            return jsonResponse({ success: false, error: '请求解析失败或数据库错误' }, 400);
        }
    }

    // GET /api/claim/list?policyNo={policyNo}
    if (request.method === 'GET' && pathname.endsWith('/list')) {
        const policyNo = url.searchParams.get('policyNo');
        if (!policyNo) {
            return jsonResponse({ success: false, error: '请提供保单号' }, 400);
        }
        try {
            const claims = await listClaimsByPolicy(env.DB, policyNo);
            return jsonResponse({ success: true, data: claims });
        } catch (e) {
            return jsonResponse({ success: false, error: '数据库查询失败' }, 500);
        }
    }

    const claimIdMatch = pathname.match(/\/claim\/([^\/]+)(\/.*)?$/);
    if (claimIdMatch) {
        const claimId = claimIdMatch[1];
        const subPath = claimIdMatch[2] || '';

        if (claimId === 'draft' || claimId === 'list') {
            return jsonResponse({ success: false, error: 'Not Found' }, 404);
        }

        try {
            const claim = await getClaim(env.DB, claimId);
            if (!claim) {
                return jsonResponse({ success: false, error: '报案记录不存在' }, 404);
            }

            // PUT /api/claim/{claimId} - Update
            if (request.method === 'PUT' && !subPath) {
                const updates = await request.json() as Partial<ClaimCase>;
                const now = Date.now();

                // Allow updating content fields only in DRAFT or NEEDS_MORE_INFO
                // if (claim.state !== ClaimState.DRAFT && claim.state !== ClaimState.NEEDS_MORE_INFO) {
                //      return jsonResponse({ success: false, error: '当前状态不允许修改' }, 400);
                // }

                if (updates.accidentType !== undefined) claim.accidentType = updates.accidentType;
                if (updates.accidentDateTime !== undefined) claim.accidentDateTime = updates.accidentDateTime;
                if (updates.accidentLocation !== undefined) claim.accidentLocation = updates.accidentLocation;
                if (updates.accidentDescription !== undefined) claim.accidentDescription = updates.accidentDescription;
                if (updates.reporterName !== undefined) claim.reporterName = updates.reporterName;
                if (updates.reporterContact !== undefined) claim.reporterContact = updates.reporterContact;

                claim.updatedAt = now;

                // Check if ready to submit
                const isComplete = !!(
                    claim.accidentType &&
                    claim.accidentDateTime &&
                    claim.accidentLocation &&
                    claim.accidentDescription &&
                    claim.reporterName &&
                    claim.reporterContact
                );

                if (claim.state === ClaimState.DRAFT && isComplete) {
                    claim.state = ClaimState.READY_TO_SUBMIT;
                    claim.timeline.push({
                        timestamp: now,
                        action: 'VALIDATED',
                        description: '必填信息已完整，可提交',
                        actor: 'SYSTEM',
                    });
                }

                await saveClaim(env.DB, claim);
                return jsonResponse({ success: true, data: claim });
            }

            // POST /api/claim/{claimId}/submit
            if (request.method === 'POST' && subPath === '/submit') {
                if (claim.state !== ClaimState.READY_TO_SUBMIT && claim.state !== ClaimState.NEEDS_MORE_INFO && claim.state !== ClaimState.DRAFT) {
                    return jsonResponse({ success: false, error: '当前状态不允许提交' }, 400);
                }
                // Double check completeness
                const isComplete = !!(
                    claim.accidentType &&
                    claim.accidentDateTime &&
                    claim.accidentLocation &&
                    claim.accidentDescription &&
                    claim.reporterName &&
                    claim.reporterContact
                );
                if (!isComplete) {
                    return jsonResponse({ success: false, error: '信息不完整' }, 400);
                }

                const now = Date.now();
                claim.state = ClaimState.SUBMITTED;
                claim.updatedAt = now;
                claim.timeline.push({
                    timestamp: now,
                    action: 'SUBMITTED',
                    description: '报案已提交，进入审核流程',
                    actor: 'USER',
                });

                await saveClaim(env.DB, claim);
                return jsonResponse({
                    success: true,
                    data: {
                        claimId: claim.claimId,
                        message: `报案已成功提交！您的报案受理编号为：${claim.claimId}`,
                    },
                });
            }

            // POST /api/claim/{claimId}/attachment
            if (request.method === 'POST' && subPath === '/attachment') {
                const body = await request.json() as { fileName: string };
                if (!body.fileName) {
                    return jsonResponse({ success: false, error: '请提供文件名' }, 400);
                }
                claim.attachments.push(body.fileName);
                claim.updatedAt = Date.now();
                await saveClaim(env.DB, claim);
                return jsonResponse({ success: true, data: { attachments: claim.attachments } });
            }

            // GET /api/claim/{claimId}
            if (request.method === 'GET' && !subPath) {
                return jsonResponse({ success: true, data: claim });
            }

        } catch (e) {
            return jsonResponse({ success: false, error: '操作失败: ' + (e as Error).message }, 500);
        }
    }

    return jsonResponse({ success: false, error: 'Not Found' }, 404);
};
