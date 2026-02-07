export interface Document {
    id: string;
    title: string;
    category: string;
    lastUpdated: string;
    content: string; // Markdown or HTML
}

const DOCUMENTS: Document[] = [
    {
        id: 'authority-statement',
        title: '平台权威性声明',
        category: 'Legal',
        lastUpdated: '2024-01-01',
        content: `
# 平台权威性声明

本平台（SHIE SHIE人寿团体客户服务系统）是 SHIE 人寿保险股份有限公司官方运营的唯一团体客户线上服务平台。

## 数据安全
本平台采用国家金融级安全标准建设，所有数据传输均经过加密处理。

## 服务承诺
我们承诺为您提供真实、准确的保单信息及高效的理赔服务。
        `
    },
    {
        id: 'privacy-policy',
        title: '隐私政策',
        category: 'Legal',
        lastUpdated: '2024-01-01',
        content: `
# 隐私政策

我们非常重视您的隐私。本政策描述了我们如何收集、使用和保护您的个人信息。

1. **信息收集**：我们需要收集您的姓名、身份证号、保单号等以提供服务。
2. **信息使用**：仅用于承保、理赔及相关服务。
3. **信息保护**：未经授权，我们不会向第三方披露您的信息。
        `
    },
    {
        id: 'claim-guide',
        title: '理赔服务说明',
        category: 'Service',
        lastUpdated: '2024-02-01',
        content: `
# 理赔服务说明

## 报案时效
请在事故发生后 48 小时内通过本平台或拨打客服热线报案。

## 所需材料
- 身份证正反面
- 银行卡复印件
- 事故证明
- 医疗发票（如涉及）

## 审核流程
报案 -> 材料审核 -> 调查核实 -> 核定赔付
        `
    },
    {
        id: 'risk-notice',
        title: '风险提示书',
        category: 'Notice',
        lastUpdated: '2024-02-01',
        content: `
# 风险提示书

请您在办理业务前仔细阅读本提示书。

1. **如实告知义务**：投保人及被保险人应如实告知健康状况等重要信息，否则可能影响理赔。
2. **责任免除**：请仔细阅读条款中的责任免除部分。
        `
    }
];

function corsHeaders(): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

export const onRequest: PagesFunction = async (context) => {
    const { request } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method === 'GET') {
        // List all (summary)
        if (pathname.endsWith('/documents')) {
            const list = DOCUMENTS.map(({ id, title, category, lastUpdated }) => ({ id, title, category, lastUpdated }));
            return new Response(JSON.stringify({ success: true, data: list }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders() }
            });
        }

        // Get Detail
        const match = pathname.match(/\/documents\/([^\/]+)$/);
        if (match) {
            const id = match[1];
            const doc = DOCUMENTS.find(d => d.id === id);
            if (doc) {
                return new Response(JSON.stringify({ success: true, data: doc }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
                });
            } else {
                return new Response(JSON.stringify({ success: false, error: 'Not Found' }), { status: 404, headers: corsHeaders() });
            }
        }
    }

    return new Response('Not Found', { status: 404 });
};
