// functions/api/policy/verify.ts
interface Env {
    DB: D1Database;
    POLICY_KV: KVNamespace;
    POLICY_BUCKET: R2Bucket;  // 用于生成 signed URL（可选）
}

import type { PolicyVerifyResult } from '../../../src/services/policyEngine.types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await request.json<{ policyNo: string }>();

        if (!body || typeof body.policyNo !== 'string') {
            return new Response(
                JSON.stringify({
                    success: false,
                    status: 'NOT_FOUND',
                    systemMessage: '缺少或格式错误的保单号',
                    allowBusinessExtension: false,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const policyNo = body.policyNo.trim().toUpperCase();

        if (!/^(65|66)\d+$/.test(policyNo)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    status: 'NOT_FOUND',
                    systemMessage: '保单号格式错误，应以65或66开头后接数字',
                    allowBusinessExtension: false,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const cacheKey = `verify:policy:${policyNo}`;

        // 1. 先查 KV 缓存
        const cached = await env.POLICY_KV.get<PolicyVerifyResult>(cacheKey, { type: 'json' });
        if (cached) {
            return new Response(JSON.stringify(cached), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. 查 D1
        const stmt = env.DB.prepare(`
      SELECT 
        policy_no,
        org_name,
        product_name,
        start_date,
        end_date,
        status_label,
        status AS db_status,
        electronic_policy_available,
        file_key
      FROM policies
      WHERE policy_no = ?
    `);

        const { results } = await stmt.bind(policyNo).all();

        if (!results.length) {
            const notFoundResult: PolicyVerifyResult = {
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '未找到该保单记录',
                allowBusinessExtension: false,
            };

            // 缓存 5 分钟的 NOT_FOUND 结果，避免重复穿透
            await env.POLICY_KV.put(cacheKey, JSON.stringify(notFoundResult), {
                expirationTtl: 300,
            });

            return new Response(JSON.stringify(notFoundResult), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const row = results[0]!;

        // 3. 组装 PolicyVerifyResult
        const isActive = row.db_status === 'ACTIVE';
        const isPending = row.db_status === 'PENDING';
        const isExpired = row.db_status === 'EXPIRED' || (row.end_date && new Date(row.end_date) < new Date());

        let status: PolicyVerifyResult['status'];
        let systemMessage: string;

        if (isActive) {
            status = 'ACTIVE';
            systemMessage = '核验通过，保单状态正常';
        } else if (isPending) {
            status = 'PENDING';
            systemMessage = '保单处理中';
        } else if (isExpired) {
            status = 'EXPIRED';
            systemMessage = '保单已过期';
        } else {
            status = 'NOT_FOUND';
            systemMessage = '保单状态异常';
        }

        const result: PolicyVerifyResult = {
            success: status !== 'NOT_FOUND',
            status,
            systemMessage,
            policy: {
                policyNo: row.policy_no,
                orgName: row.org_name || '未知机构',
                productName: row.product_name || '未知产品',
                startDate: row.start_date || '',
                endDate: row.end_date || '',
                statusLabel: row.status_label || (isActive ? '已生效' : isPending ? '处理中' : '已过期'),
            },
            coverages: [], // 如需从另一张表读取，可后续扩展
            allowBusinessExtension: isActive || isPending,
            documents: {
                electronicPolicyAvailable: !!row.electronic_policy_available && !!row.file_key,
                pdfUrl: row.file_key ? `/api/policy/download?policyNo=${encodeURIComponent(policyNo)}` : undefined,
                // 或者使用 signed URL（推荐）：
                // pdfUrl: row.file_key ? await generateSignedUrl(env, row.file_key) : undefined,
            },
        };

        // 4. 写入 KV 缓存（5分钟 ~ 更长根据业务调整）
        await env.POLICY_KV.put(cacheKey, JSON.stringify(result), {
            expirationTtl: 300, // 5分钟
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({
                success: false,
                status: 'NOT_FOUND',
                systemMessage: '服务异常',
                allowBusinessExtension: false,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};

// 可选：生成 R2 signed URL 的辅助函数（如果前端需要临时访问链接）
/*
async function generateSignedUrl(env: Env, key: string): Promise<string> {
  const object = await env.POLICY_BUCKET.get(key);
  if (!object) return '';
  
  // 简单示例：实际应使用带签名的临时 URL
  // Cloudflare R2 本身支持 public bucket 或自定义域名 + signed URL
  // 这里仅作占位，推荐使用 presigned URL 或 proxy 下载接口
  return `/api/policy/download?policyNo=...`; 
}
*/