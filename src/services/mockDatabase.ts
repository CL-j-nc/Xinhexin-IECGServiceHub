import { MOCK_POLICY_DB } from '../constants';
import { PolicyData } from '../types';

// Initialize memory state with the constant seed data
// In a real app, this would be a database connection
let inMemoryDb: Record<string, PolicyData> = { ...MOCK_POLICY_DB };

export const queryPolicyDatabase = async (policyId: string): Promise<PolicyData | null> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const formattedId = policyId.toUpperCase().trim();
  return inMemoryDb[formattedId] || null;
};

export const addPolicyToDatabase = async (policy: PolicyData): Promise<boolean> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  if (inMemoryDb[policy.id]) {
    return false; // Already exists
  }

  inMemoryDb[policy.id] = policy;
  return true;
};

// Helper for admin view to see all policies
export const getAllPolicies = async (): Promise<PolicyData[]> => {
    return Object.values(inMemoryDb);
};