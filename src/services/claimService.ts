import { ClaimCase, ClaimState } from './claim/claim.types';

const API_BASE = '/api/claim';

export const createDraftClaim = async (policyNo: string, conversationId?: string): Promise<ClaimCase> => {
    const res = await fetch(`${API_BASE}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyNo, conversationId })
    });
    const json = await res.json() as any;
    if (!json.success) throw new Error(json.error || 'Failed to create draft');
    return json.data;
};

export const updateClaimField = async (claimId: string, field: keyof ClaimCase, value: any): Promise<ClaimCase> => {
    const res = await fetch(`${API_BASE}/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
    });
    const json = await res.json() as any;
    if (!json.success) throw new Error(json.error || 'Failed to update field');
    return json.data;
};

export const getClaim = async (claimId: string): Promise<ClaimCase> => {
    const res = await fetch(`${API_BASE}/${claimId}`);
    const json = await res.json() as any;
    if (!json.success) throw new Error(json.error || 'Failed to fetch claim');
    return json.data;
};

export const addAttachment = async (claimId: string, fileName: string): Promise<ClaimCase> => {
    const res = await fetch(`${API_BASE}/${claimId}/attachment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName })
    });
    const json = await res.json() as any;
    if (!json.success) throw new Error(json.error || 'Failed to attachment');
    // API returns only attachments list, so we refetch the full claim to be safe
    return getClaim(claimId);
};

export const submitClaim = async (claimId: string): Promise<ClaimCase> => {
    const res = await fetch(`${API_BASE}/${claimId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json() as any;
    if (!json.success) throw new Error(json.error || 'Failed to submit claim');
    // API returns success message, refetch state
    return getClaim(claimId);
};

export const listClaims = async (policyNo: string): Promise<ClaimCase[]> => {
    const res = await fetch(`${API_BASE}/list?policyNo=${policyNo}`);
    const json = await res.json() as any;
    if (!json.success) return [];
    return json.data;
};
