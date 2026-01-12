// functions/api/policy/upload.ts
interface Env {}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request } = context;

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const policyNo = formData.get('policyNo');

        if (!file || !policyNo) {
            return new Response(JSON.stringify({ error: '缺少文件或保单号' }), { status: 400 });
        }

        if (typeof policyNo !== 'string' || !/^(65|66)\d+$/.test(policyNo.trim())) {
            return new Response(JSON.stringify({ error: '无效保单号' }), { status: 400 });
        }

        // 当前 mock 存储（未来上传 R2）
        const mockUrl = `/mock/uploads/${policyNo.trim()}-${Date.now()}.pdf`;

        return new Response(JSON.stringify({
            success: true,
            pdfUrl: mockUrl,
            policyNo: policyNo.trim(),
            fileName: file.name,
            size: file.size
        }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: '上传失败' }), { status: 500 });
    }
};
