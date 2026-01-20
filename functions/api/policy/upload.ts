// functions/api/policy/upload.ts
interface Env {
    POLICY_BUCKET: R2Bucket;
    DB: D1Database;
    POLICY_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const policyNoRaw = formData.get('policyNo');

        if (!(file instanceof File) || !policyNoRaw) {
            return new Response(JSON.stringify({ error: '缺少文件或保单号' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const policyNo = (policyNoRaw as string).trim();

        if (!/^(65|66)\d+$/.test(policyNo)) {
            return new Response(JSON.stringify({ error: '无效保单号格式' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 读取 PDF 文件内容
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // 存入 R2，key = policyNo.pdf
        await env.POLICY_BUCKET.put(`${policyNo}.pdf`, bytes, {
            httpMetadata: {
                contentType: 'application/pdf',
            },
        });

        // 插入 D1（假设表已存在：policies）
        await env.DB.prepare(`
      INSERT INTO policies (policy_no, upload_time, file_key, status)
      VALUES (?, datetime('now'), ?, 'ACTIVE')
    `)
            .bind(policyNo, `${policyNo}.pdf`)
            .run();

        // 可选：清除旧缓存（如果存在）
        await env.POLICY_KV.delete(`verify:policy:${policyNo}`);

        return new Response(
            JSON.stringify({
                success: true,
                policyNo,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ error: '上传处理失败' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};