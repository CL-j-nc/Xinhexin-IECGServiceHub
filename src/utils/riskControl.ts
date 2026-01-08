import { RISK_WORDS, STATIC_QA } from '../constants';

export const containsRiskContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return RISK_WORDS.some(word => lowerText.includes(word));
};

export const getStaticAnswer = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  for (const [key, answer] of Object.entries(STATIC_QA)) {
    if (lowerText.includes(key)) {
      return answer;
    }
  }
  return null;
};
