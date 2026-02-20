// src/constants/faq.config.ts
export type FAQAction =
    | {
        type: 'internal_link';
        label: string;
        target: string;
    }
    | {
        type: 'none';
    };

export interface FAQItem {
    id: string;
    category: '热门问题' | '保单服务' | '理赔咨询' | '投保指南' | '账户管理' | '其他' | '平台功能'; // Expanded categories
    title: string;
    response: {
        layer1_authoritative: string;
        layer2_explanation: string[];
        layer3_action: FAQAction;
    };
}

export const FAQ_CONFIG: FAQItem[] = [
    // 热门问题
    {
        id: 'hot_how_to_query_policy',
        category: '热门问题',
        title: '如何查询我的团体保单？',
        response: {
            layer1_authoritative: '您可以通过“保单查询”模块，输入您的保单号（65/66开头）来查询保单的详细信息，包括缴费状态。',
            layer2_explanation: [
                '进入服务中心，选择“保单查询”功能。',
                '输入您持有的团体保单号，系统将展示保单状态、投保单位、保障期限等关键信息。',
                '为保障信息安全，查询时可能需要进行身份验证。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单查询',
                target: '/service-hub/query'
            }
        }
    },
    {
        id: 'hot_claim_materials',
        category: '热门问题',
        title: '团体险理赔需要准备哪些材料？',
        response: {
            layer1_authoritative: '理赔所需材料因险种和具体情况而异。您可以在“理赔中心”查看详细指引，或咨询您的客户经理。',
            layer2_explanation: [
                '通常包括：理赔申请书、身份证明、诊断证明、医疗费用票据等。',
                '对于特定险种，如车险理赔，还需提供事故认定书、维修清单等。',
                '建议您在申请前查阅具体险种的理赔须知或联系专属客服。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往理赔中心',
                target: '/claim-center'
            }
        }
    },
    {
        id: 'faq_policy_garbled',
        category: '热门问题', // Moved to Hot Questions and Platform Features
        title: '我邮箱收到的电子保单是乱码',
        response: {
            layer1_authoritative: '您所描述的情况，属于电子保单展示格式差异问题。',
            layer2_explanation: [
                '电子保单的真实性与有效性，以保险公司核心业务系统记录为唯一判断依据。',
                '不同下载渠道、邮件客户端或设备环境，可能导致电子保单显示格式存在差异。',
                '电子保单显示为乱码，不影响保单本身的法律效力与承保状态。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单真实性核验',
                target: '/service-hub'
            }
        }
    },
    {
        id: 'hot_contact_human_agent',
        category: '热门问题',
        title: '如何联系人工客服？',
        response: {
            layer1_authoritative: '好的，您可以通过以下方式联系到我们的人工客服：',
            layer2_explanation: [
                '拨打我们的 VIP 客户服务专线：400-800-8888。',
                '在聊天框中输入“转人工”或“人工客服”，我们将为您转接。',
                '在“更多服务”中选择“联系客户经理”获取一对一服务。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'hot_policy_renewal',
        category: '热门问题',
        title: '保单到期了怎么续保？',
        response: {
            layer1_authoritative: '我们会提前通知您续保事宜。您也可以在保单到期前一个月，通过保单服务中心或联系客户经理办理续保。',
            layer2_explanation: [
                '通常在保单到期前30-60天，我们会发送续保提醒通知。',
                '您可以登录保单服务中心，选择对应保单进行在线续保操作。',
                '如有任何疑问或需调整保障方案，请随时联系您的专属客户经理。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单服务中心',
                target: '/service-hub'
            }
        }
    },

    // 保单服务
    {
        id: 'svc_policy_change',
        category: '保单服务',
        title: '如何办理保单信息变更？',
        response: {
            layer1_authoritative: '如需变更保单信息，例如受益人、地址等，请联系您的专属客户经理或通过“保单服务中心”提交申请。',
            layer2_explanation: [
                '登录保单服务中心，选择“保单批改”或“信息变更”功能。',
                '根据提示提交所需材料，如身份证明、变更申请书等。',
                '您的客户经理将全程协助您完成变更流程。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单服务中心',
                target: '/service-hub'
            }
        }
    },
    {
        id: 'svc_policy_no_stamp',
        category: '保单服务',
        title: '我在网上查询的电子保单没有盖章',
        response: {
            layer1_authoritative: '电子保单是否加盖印章，不作为判断保单是否生效的依据。',
            layer2_explanation: [
                '电子保单的生效条件，以系统承保记录为准。',
                '印章样式或展示方式，可能因下载渠道或展示版本不同而存在差异。',
                '是否盖章，不影响保单的承保效力与保障范围。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单真实性核验',
                target: '/service-hub'
            }
        }
    },
    {
        id: 'svc_plate_changed',
        category: '保单服务',
        title: '我已经改了保单上的车牌，电子保单为什么还没变',
        response: {
            layer1_authoritative: '电子保单展示内容，以当前系统核验记录为准。',
            layer2_explanation: [
                '涉及车辆信息变更的情形，通常需完成相应的保单批改流程。',
                '在批改未完成或尚在处理中时，电子保单展示内容可能暂未更新。',
                '系统核验结果，为当前有效状态的判断依据。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '查看当前保单状态',
                target: '/service-hub'
            }
        }
    },
    {
        id: 'svc_premium_status',
        category: '保单服务',
        title: '如何查询保单的缴费状态？',
        response: {
            layer1_authoritative: '您可以通过“保单查询”模块，输入您的保单号（65/66开头）来查询保单的详细信息，包括缴费状态。',
            layer2_explanation: [
                '在保单查询结果中，您可以找到详细的缴费记录和当前状态。',
                '如遇缴费异常，请及时联系您的专属客户经理或拨打客服热线。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单查询',
                target: '/service-hub/query'
            }
        }
    },
    {
        id: 'svc_surrender_process',
        category: '保单服务',
        title: '退保流程是怎样的？',
        response: {
            layer1_authoritative: '退保请求涉及复杂流程，请联系您的专属客户经理，我们将协助您办理相关手续。',
            layer2_explanation: [
                '退保可能涉及保单现金价值计算，以及相关费用扣除。',
                '请准备好您的保单原件、身份证明及银行账户信息。',
                '客户经理将为您详细解读退保条款并指导您完成申请。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'svc_download_contract',
        category: '保单服务',
        title: '如何下载我的保单合同？',
        response: {
            layer1_authoritative: '您可以在保单服务中心或通过电子保单邮件中的链接下载您的保单合同。',
            layer2_explanation: [
                '登录保单服务中心，在“我的保单”页面找到对应保单。',
                '选择“下载电子合同”选项，即可获取PDF格式的保单文件。',
                '请妥善保管您的保单合同。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往保单服务中心',
                target: '/service-hub'
            }
        }
    },

    // 理赔咨询
    {
        id: 'claim_basic_process',
        category: '理赔咨询',
        title: '团体理赔的基本流程是什么？',
        response: {
            layer1_authoritative: '团体理赔基本流程包括：报案、提交材料、审核、理赔金支付。',
            layer2_explanation: [
                '事故发生后请及时报案，并通过理赔中心提交所需证明材料。',
                '保险公司将对提交的材料进行审核，并可能要求补充材料。',
                '审核通过后，理赔金将支付至指定账户。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往理赔中心',
                target: '/claim-center'
            }
        }
    },
    {
        id: 'claim_scope_exclusion',
        category: '理赔咨询',
        title: '哪些情况不属于理赔范围？',
        response: {
            layer1_authoritative: '具体不属于理赔范围的情况，请参阅您的保险合同条款中的“责任免除”部分。',
            layer2_explanation: [
                '常见的责任免除包括：投保人故意行为、战争、核辐射、酒驾等。',
                '不同险种的责任免除条款可能有所不同。',
                '建议仔细阅读保单条款，如有疑问请咨询客户经理。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'claim_payment_arrival',
        category: '理赔咨询',
        title: '理赔款多久能到账？',
        response: {
            layer1_authoritative: '一般情况下，资料齐全的理赔案件会在 5-10 个工作日内完成审核并支付。',
            layer2_explanation: [
                '理赔审核时间视案件复杂程度而定，简单案件通常 5 个工作日内完成。',
                '审核通过后，理赔款将在 1-3 个工作日内转入您指定的银行账户。',
                '如超过预期时间未到账，请联系您的客户经理查询进度。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '查看理赔进度',
                target: '/claim-center'
            }
        }
    }
];