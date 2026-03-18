import api from "./axios";

export const getClaimsByUser = async (userId: string) => {
  const res = await api.get(`/api/users/${userId}/claims`);
  return res.data;
};

export const updateClaimStatus = async (claimId: string, status: string) => {
  const res = await api.patch(`/api/users/claims/${claimId}/status`, { status });
  return res.data;
};
