// functions/api/policy/upload.ts （保持不变，仅删除 import）

export const onRequestPost = async (context: any) => {
    try {
        const { request } = context;

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const policyNo = formData.get('policyNo') as string | null;

        if (!file || !(file instanceof File) || file.type !== 'application/pdf') {
            return Response.json({ error: '请上传有效的 PDF 文件' }, { status: 400 });
        }

        if (!policyNo || typeof policyNo !== 'string' || !/^(65|66)\d+$/.test(policyNo.trim())) {
            return Response.json({ error: '缺少或无效的保单号' }, { status: 400 });
        }

        // mock URL（未来替换为 R2 真实路径）
        const mockPdfUrl = `/mock-pdfs/${policyNo.trim().toUpperCase()}-${Date.now()}.pdf`;

        return Response.json(
            {
                success: true,
                message: '上传成功（当前为模拟存储）',
                pdfUrl: mockPdfUrl,
                policyNo: policyNo.trim().toUpperCase(),
                fileName: file.name,
                size: file.size
            },
            { status: 200 }
        );
    } catch (err) {
        console.error(err);
        return Response.json({ error: '文件上传处理失败' }, { status: 500 });
    }
};