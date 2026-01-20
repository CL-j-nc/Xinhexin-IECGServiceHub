
import { PolicyLifecycleData } from './policyEngine.types';
import { MOCK_LIFECYCLE_REPOSITORY, SCOPE_BOUNDARY_DATA } from './policyEngine.mock';

/**
 * Service Hub API Entry
 * Fetches authoritative lifecycle data for a given policy number.
 */
export const fetchPolicyLifecycle = async (policyNo: string): Promise<PolicyLifecycleData> => {
  // Simulate authoritative core system latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const data = MOCK_LIFECYCLE_REPOSITORY[policyNo];
  if (data) return data;

  return SCOPE_BOUNDARY_DATA;
};

/**
 * Core Policy Format Check (Internal UI helper only)
 */
export const isPolicyFormatValid = (val: string) => /^(65|66)\d+$/.test(val);

export const serviceHubConfig = {
  TITLE: "新核心承保系统 · 团体客户服务中心",
  SUBTITLE: "保单服务中心",
  SEARCH_PLACEHOLDER: "输入 65/66 开头的团体保单号",
  AUTHORITY_NOTE: "本系统为团体保单存续状态的唯一权威展示平台，数据受承保核心实时监控。"
};
