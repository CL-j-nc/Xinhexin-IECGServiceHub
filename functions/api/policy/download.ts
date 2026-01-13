// functions/api/policy/download.ts
interface Env {
    DB: D1Database;
    POLICY_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const url = new URL(request.url);
    const policyNoRaw = url.searchParams.get('policyNo');

    if (!policyNoRaw) {
        return new Response(
            JSON.stringify({ success: false, message: '缺少 policyNo 参数' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const policyNo = policyNoRaw.trim().toUpperCase();

    if (!/^(65|66)\d+$/.test(policyNo)) {
        return new Response(
            JSON.stringify({ success: false, message: '保单号格式错误' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // 查询 D1 获取 file_key
        const stmt = env.DB.prepare(`
      SELECT file_key, electronic_policy_available
      FROM policies
      WHERE policy_no = ?
    `);

        const { results } = await stmt.bind(policyNo).all();

        if (!results.length || !results[0].file_key || !results[0].electronic_policy_available) {
            return new Response(
                JSON.stringify({ success: false, message: '电子保单不可用或未找到' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const fileKey = results[0].file_key as string;

        // 从 R2 获取对象
        const object = await env.POLICY_BUCKET.get(fileKey);

        if (!object) {
            return new Response(
                JSON.stringify({ success: false, message: '文件不存在于存储' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 设置响应头
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set(
            'Content-Disposition',
            `inline; filename="Policy_${policyNo}.pdf"`
        );
        headers.set('Access-Control-Allow-Origin', '*'); // 根据前端域调整，或用具体 origin

        // 流式返回
        return new Response(object.body, { headers });
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ success: false, message: '服务异常' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};