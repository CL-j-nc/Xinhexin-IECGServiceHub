import { ClaimProcess } from '../claim/claim.types';

const API_BASE = '/api/claim';

export const getClaimProcessByClaimId = async (claimId: string): Promise<ClaimProcess | null> => {
    try {
        const res = await fetch(`${API_BASE}/${claimId}/process`);
        if (!res.ok) return null;
        const json = await res.json() as any;
        return json.data;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const ensureClaimProcessForClaim = async (claimId: string): Promise<ClaimProcess | null> => {
    // Backend handles creation on get
    return getClaimProcessByClaimId(claimId);
};

export const uploadClaimProcessMaterial = async (
    claimId: string,
    materialId: string,
    fileName: string
): Promise<ClaimProcess | null> => {
    try {
        const res = await fetch(`${API_BASE}/${claimId}/materials/${materialId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
        });
        if (!res.ok) return null;
        // Backend returns result of upload, which might be { material, allRequiredUploaded }
        // We probably want the full process to update UI
        // Let's refetch process
        return getClaimProcessByClaimId(claimId);
    } catch (e) {
        console.error(e);
        return null;
    }
};
