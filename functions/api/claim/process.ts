import { Env } from '../policy/env';
import { ClaimProcess, ClaimProcessState, Material } from './claim.types';

// Helper for D1
// Table Schema assumed:
// CREATE TABLE ClaimProcesses (processId TEXT PRIMARY KEY, claimId TEXT, state TEXT, data TEXT, created_at INTEGER, updated_at INTEGER);

async function saveProcess(db: D1Database, process: ClaimProcess): Promise<void> {
    const data = JSON.stringify(process);
    await db.prepare(
        `INSERT OR REPLACE INTO ClaimProcesses (processId, claimId, state, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(process.processId, process.claimId, process.state, data, process.createdAt, process.updatedAt).run();
}

async function getProcessByClaimId(db: D1Database, claimId: string): Promise<ClaimProcess | null> {
    const result = await db.prepare(`SELECT data FROM ClaimProcesses WHERE claimId = ?`).bind(claimId).first('data');
    if (!result) return null;
    return JSON.parse(result as string) as ClaimProcess;
}

const stateDescriptions: Record<ClaimProcessState, { text: string; desc: string; hint: string }> = {
    [ClaimProcessState.PENDING_REVIEW]: {
        text: '待审核',
        desc: '您的报案已收到，正在等待理赔专员受理',
        hint: '请耐心等待，预计1-2个工作日内会有专员联系您',
    },
    [ClaimProcessState.MATERIALS_REQUIRED]: {
        text: '待补充材料',
        desc: '需要您补充相关理赔材料',
        hint: '请尽快上传所需材料，以便加快理赔进度',
    },
    [ClaimProcessState.UNDER_INVESTIGATION]: {
        text: '调查中',
        desc: '理赔专员正在进行事故调查核实',
        hint: '如需配合调查，我们会及时联系您',
    },
    [ClaimProcessState.PENDING_APPROVAL]: {
        text: '待审批',
        desc: '材料审核完成，等待最终审批',
        hint: '预计1-3个工作日内完成审批',
    },
    [ClaimProcessState.APPROVED]: {
        text: '已通过',
        desc: '您的理赔申请已通过审批',
        hint: '理赔款将在3-5个工作日内转入您的账户',
    },
    [ClaimProcessState.REJECTED]: {
        text: '已拒赔',
        desc: '很抱歉，您的理赔申请未通过审核',
        hint: '如有疑问，请联系客服了解详情',
    },
    [ClaimProcessState.PAID]: {
        text: '已赔付',
        desc: '理赔款已成功转入您的账户',
        hint: '感谢您的信任，祝您一切顺利',
    },
};

function generateProcessId(): string {
    return `PRC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getDefaultMaterials(): Material[] {
    return [
        { materialId: 'M001', name: '身份证正反面', required: true, uploaded: false },
        { materialId: 'M002', name: '事故证明材料', required: true, uploaded: false },
        { materialId: 'M003', name: '医疗费用发票', required: false, uploaded: false },
        { materialId: 'M004', name: '银行卡信息', required: true, uploaded: false },
    ];
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

// Get or create process for a claim
async function getOrCreateProcess(db: D1Database, claimId: string): Promise<ClaimProcess> {
    let process = await getProcessByClaimId(db, claimId);
    if (!process) {
        const now = Date.now();
        const state = ClaimProcessState.PENDING_REVIEW;
        const stateInfo = stateDescriptions[state];

        process = {
            processId: generateProcessId(),
            claimId,
            state,
            stateText: stateInfo.text,
            stateDescription: stateInfo.desc,
            nextStepHint: stateInfo.hint,
            requiredMaterials: getDefaultMaterials(),
            timeline: [
                {
                    timestamp: now,
                    action: 'START',
                    stage: '报案受理',
                    description: '报案已提交，进入理赔流程',
                    actor: 'SYSTEM',
                },
            ],
            attachments: [],
            createdAt: now,
            updatedAt: now,
        };
        await saveProcess(db, process);
    }
    return process;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
        // Match /api/claim/{claimId}/process, /timeline, /materials, /result
        const claimMatch = pathname.match(/\/claim\/([^\/]+)\/(process|timeline|materials|result)$/);

        if (!claimMatch) {
            // Check for material upload: /api/claim/{claimId}/materials/{materialId}
            const materialMatch = pathname.match(/\/claim\/([^\/]+)\/materials\/([^\/]+)$/);
            if (materialMatch && request.method === 'POST') {
                const claimId = materialMatch[1];
                const materialId = materialMatch[2];

                const process = await getOrCreateProcess(env.DB, claimId);
                const material = process.requiredMaterials.find(m => m.materialId === materialId);

                if (!material) {
                    return jsonResponse({ success: false, error: '材料类型不存在' }, 404);
                }

                const body = await request.json() as { fileName: string };

                material.uploaded = true;
                material.uploadedAt = new Date().toISOString();
                material.fileName = body.fileName || '已上传文件';
                process.updatedAt = Date.now();

                // Check if all required materials uploaded
                const allRequired = process.requiredMaterials
                    .filter(m => m.required)
                    .every(m => m.uploaded);

                if (allRequired && process.state === ClaimProcessState.MATERIALS_REQUIRED) {
                    process.state = ClaimProcessState.UNDER_INVESTIGATION;
                    const stateInfo = stateDescriptions[process.state];
                    process.stateText = stateInfo.text;
                    process.stateDescription = stateInfo.desc;
                    process.nextStepHint = stateInfo.hint;
                    process.timeline.push({
                        timestamp: Date.now(),
                        action: 'UPDATE',
                        stage: '材料齐全',
                        description: '所有必需材料已上传，进入调查阶段',
                        actor: 'SYSTEM',
                    });
                }

                await saveProcess(env.DB, process);

                return jsonResponse({
                    success: true,
                    data: { material, allRequiredUploaded: allRequired },
                });
            }

            return jsonResponse({ success: false, error: 'Not Found' }, 404);
        }

        const claimId = claimMatch[1];
        const endpoint = claimMatch[2];
        const process = await getOrCreateProcess(env.DB, claimId);

        // GET /api/claim/{claimId}/process
        if (request.method === 'GET' && endpoint === 'process') {
            return jsonResponse({
                success: true,
                data: process,
            });
        }

        // GET /api/claim/{claimId}/timeline
        if (request.method === 'GET' && endpoint === 'timeline') {
            return jsonResponse({
                success: true,
                data: process.timeline,
            });
        }

        // GET /api/claim/{claimId}/materials
        if (request.method === 'GET' && endpoint === 'materials') {
            return jsonResponse({
                success: true,
                data: process.requiredMaterials,
            });
        }

        // GET /api/claim/{claimId}/result
        if (request.method === 'GET' && endpoint === 'result') {
            if (!process.result) {
                return jsonResponse({
                    success: true,
                    data: {
                        hasResult: false,
                        message: '理赔尚在处理中，请耐心等待',
                        currentState: process.stateText,
                    },
                });
            }

            return jsonResponse({
                success: true,
                data: {
                    hasResult: true,
                    ...process.result,
                },
            });
        }
    } catch (e) {
        console.error(e);
        return jsonResponse({ success: false, error: '操作失败' }, 500);
    }

    return jsonResponse({ success: false, error: 'Not Found' }, 404);
};
