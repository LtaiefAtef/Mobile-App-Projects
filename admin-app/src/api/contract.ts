import api from "./axios";

export const getContractsByUser = async (userId: string) => {
  const res = await api.get(`/api/users/${userId}/contracts`);
  return res.data;
};

export const updateContract = async (contractId: string, updates: any) => {
  const res = await api.patch(`/api/users/contracts/${contractId}`, updates);
  return res.data;
};
