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
    category: '平台功能';
    title: string;
    response: {
        layer1_authoritative: string;
        layer2_explanation: string[];
        layer3_action: FAQAction;
    };
}

export const FAQ_CONFIG: FAQItem[] = [
    {
        id: 'faq_policy_garbled',
        category: '平台功能',
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
                target: '/fleet-query'
            }
        }
    },
    {
        id: 'faq_policy_no_stamp',
        category: '平台功能',
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
                target: '/fleet-query'
            }
        }
    },
    {
        id: 'faq_plate_changed',
        category: '平台功能',
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
                target: '/fleet-query'
            }
        }
    }
];