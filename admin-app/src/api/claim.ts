import api from "./axios";

export const getClaims = async () => {
  const res = await api.get("/claims");
  return res.data;
};

export const createClaim = async (claim: any) => {
  const res = await api.post("/claims", claim);
  return res.data;
};

export const updateClaimStatus = async (id: string, status: string) => {
  const res = await api.put(`/claims/${id}/status`, { status });
  return res.data;
};