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
            layer1_authoritative: '一般情况下，资料齐全的理赔案件会在 5-10 个工作日内完成审核并支付。'
        }
    },
    {
        id: 'claim_online_submission',
        category: '理赔咨询',
        title: '理赔资料可以通过线上提交吗？',
        response: {
            layer1_authoritative: '是的，您可以通过“理赔中心”在线提交理赔申请和上传相关资料。',
            layer2_explanation: [
                '登录理赔中心，选择“在线报案”或“资料上传”功能。',
                '按照系统提示填写信息并上传照片或扫描件。',
                '在线提交可以大大缩短理赔处理时间。'
            ],
            layer3_action: {
                type: 'internal_link',
                label: '前往理赔中心',
                target: '/claim-center'
            }
        }
    },
    {
        id: 'claim_special_group_process',
        category: '理赔咨询',
        title: '大宗团体险的理赔特殊流程有哪些？',
        response: {
            layer1_authoritative: '大宗团体险的理赔通常设有专属通道，并由客户经理进行一对一指导。',
            layer2_explanation: [
                '针对大宗团体客户，我们提供定制化的理赔服务流程。',
                '您的专属客户经理会协助您进行报案、资料收集和提交。',
                '理赔进度可通过专属平台或客户经理进行查询。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },

    // 投保指南
    {
        id: 'uw_new_enterprise_application',
        category: '投保指南',
        title: '新企业如何购买团体保险？',
        response: {
            layer1_authoritative: '新企业购买团体保险，请联系我们的业务专家，他们将根据您的企业需求提供专业的投保方案。',
            layer2_explanation: [
                '提供企业基本信息和员工数量、职业构成等。',
                '业务专家将根据您企业的风险特点和福利预算，定制合适的保险产品组合。',
                '我们将协助您完成从方案设计到保单生效的全流程服务。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'uw_product_types',
        category: '投保指南',
        title: '团体险产品有哪些种类？',
        response: {
            layer1_authoritative: '我们提供包括团体健康险、团体意外险、团体寿险、团体年金险以及团体车险等多种产品。',
            layer2_explanation: [
                '团体健康险：涵盖医疗费用、重疾保障等。',
                '团体意外险：提供员工因意外伤害导致的医疗、伤残或身故保障。',
                '团体寿险：为员工提供身故或全残保障。',
                '团体年金险：为员工提供退休养老规划。',
                '团体车险：针对企业车队提供车辆损失、第三者责任等保障。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'uw_customized_solutions',
        category: '投保指南',
        title: '如何为员工定制合适的保险方案？',
        response: {
            layer1_authoritative: '我们提供定制化的保险方案设计服务，以满足您员工的多样化保障需求。',
            layer2_explanation: [
                '请与我们的业务专家进行详细沟通，说明您的预算、员工福利目标和企业特点。',
                '专家将根据您的需求，在各类团体险产品中进行组合配置。',
                '方案将兼顾员工保障的全面性与企业成本的效益性。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'uw_rider_introduction',
        category: '投保指南',
        title: '什么是附加险？',
        response: {
            layer1_authoritative: '附加险是主险合同的补充，它不能独立投保，必须依附于主险合同。',
            layer2_explanation: [
                '附加险通常用于扩大主险的保障范围，提供额外的特定风险保障。',
                '常见的附加险包括：附加医疗、附加重疾、附加意外医疗等。',
                '投保附加险可以使您的保障方案更具灵活性和个性化。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'uw_required_documents',
        category: '投保指南',
        title: '购买团体险需要提供哪些企业资料？',
        response: {
            layer1_authoritative: '购买团体险通常需要提供企业营业执照副本、组织机构代码证（或统一社会信用代码证）、税务登记证等基本资料。',
            layer2_explanation: [
                '此外，还可能需要提供员工花名册、企业法人身份证明等。',
                '具体所需资料清单，请咨询您的业务专家，他们会提供详细指导。',
                '请确保您提供的所有资料真实、完整、有效。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },

    // 账户管理
    {
        id: 'acct_password_reset',
        category: '账户管理',
        title: '如何修改我的登录密码？',
        response: {
            layer1_authoritative: '为了您的账户安全，修改密码请通过官方网站或App的账户设置页面进行操作。',
            layer2_explanation: [
                '登录您的企业账户，进入“账户设置”或“安全中心”。',
                '找到“修改密码”选项，按照提示完成身份验证并设置新密码。',
                '请务必设置包含大小写字母、数字和特殊符号的复杂密码。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'acct_forgot_password',
        category: '账户管理',
        title: '忘记了账户密码怎么办？',
        response: {
            layer1_authoritative: '如忘记密码，请点击登录页面的“忘记密码”链接进行重置。',
            layer2_explanation: [
                '在登录页面点击“忘记密码”选项。',
                '系统将引导您通过注册手机号或邮箱进行身份验证，然后设置新密码。',
                '如果遇到问题，请联系人工客服寻求帮助。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'acct_bind_phone_email',
        category: '账户管理',
        title: '如何绑定或更换手机号？',
        response: {
            layer1_authoritative: '您可以通过账户设置页面绑定或更换手机号/邮箱，以便接收通知和快速找回密码。',
            layer2_explanation: [
                '登录您的企业账户，进入“账户设置”或“个人资料”页面。',
                '找到“手机号/邮箱绑定”或“联系方式”选项，按照提示进行操作。',
                '在更换手机号时，可能需要进行旧手机号的验证。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'acct_multi_admin',
        category: '账户管理',
        title: '可以设置多个管理员账户吗？',
        response: {
            layer1_authoritative: '我们支持为企业账户设置多个不同权限的管理员账户，以满足团队协作需求。',
            layer2_explanation: [
                '主管理员可以登录账户，在“用户管理”或“权限设置”中添加新的管理员。',
                '您可以为不同的管理员分配不同的操作权限，例如：只读、保单管理、理赔提交等。',
                '设置多个管理员有助于提升账户管理的效率和安全性。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },

    // 其他
    {
        id: 'other_hotline',
        category: '其他',
        title: '你们的客户服务热线是多少？',
        response: {
            layer1_authoritative: '我们的 VIP 客户服务专线是 400-800-8888。',
            layer2_explanation: [
                '该热线为您提供24小时不间断的专业咨询服务。',
                '如遇紧急情况，请优先拨打此号码。',
                '您也可以通过在线聊天功能获取快速帮助。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'other_address',
        category: '其他',
        title: '公司地址在哪里？',
        response: {
            layer1_authoritative: '我们的总部地址：北京市金融街123号。',
            layer2_explanation: [
                '您可以乘坐地铁2号线或4号线到达，交通便利。',
                '来访前请提前预约，以便我们为您做好接待安排。',
                '如需邮寄资料，请寄至此地址。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'other_service_hours',
        category: '其他',
        title: '服务时间是什么时候？',
        response: {
            layer1_authoritative: '大宗业务服务时间为周一至周五，上午 9:00 至 下午 6:00。',
            layer2_explanation: [
                '周末及法定节假日暂不提供人工服务，但您可以通过自助系统进行查询和办理。',
                '在线智能客服提供24小时服务。',
                '如遇紧急情况，请拨打客户服务热线。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'other_product_info',
        category: '其他',
        title: '如何获取最新产品信息？',
        response: {
            layer1_authoritative: '您可以通过我们的官方网站、企业公众号或联系您的客户经理获取最新产品信息。',
            layer2_explanation: [
                '官方网站会定期更新产品介绍、保障方案和行业动态。',
                '关注企业公众号，及时获取新品发布、优惠活动等通知。',
                '您的客户经理会根据您的需求，推荐最适合您企业的最新产品。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    },
    {
        id: 'other_complaint',
        category: '其他',
        title: '对产品或服务不满意如何投诉？',
        response: {
            layer1_authoritative: '如果您对我们的产品或服务有任何不满意，可以通过以下渠道进行投诉：',
            layer2_explanation: [
                '拨打客户服务热线，向客服人员说明您的问题。',
                '在官方网站的“客户服务”或“意见反馈”页面提交书面投诉。',
                '联系您的专属客户经理，他们会协助您处理投诉事宜。',
                '我们承诺对所有投诉进行认真调查并及时回复。'
            ],
            layer3_action: {
                type: 'none'
            }
        }
    }
];
