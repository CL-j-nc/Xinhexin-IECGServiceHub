import { RISK_WORDS, STATIC_QA } from '../constants';
import { FAQ_CONFIG } from '../constants/faq.config'; // 导入 FAQ_CONFIG

export const containsRiskContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return RISK_WORDS.some(word => lowerText.includes(word));
};

export const getStaticAnswer = (text: string): string | null => {
  const lowerText = text.toLowerCase();

  // 1. 优先从 FAQ_CONFIG 中匹配
  for (const faqItem of FAQ_CONFIG) {
    if (lowerText.includes(faqItem.title.toLowerCase())) {
      return faqItem.response.layer1_authoritative; // 返回第一层权威回答
    }
  }

  // 2. 如果 FAQ_CONFIG 中没有匹配，再从 STATIC_QA 中匹配
  for (const [key, answer] of Object.entries(STATIC_QA)) {
    if (lowerText.includes(key)) {
      return answer;
    }
  }
  return null;
};