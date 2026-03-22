import api from "./axios";

export const getContractsByUser = async (clientDrivingLicense: string) => {
  const res = await api.get(`/users/${clientDrivingLicense}/contracts`);
  return res.data;
};

export const getAllContracts = async () => {
  const res = await api.get(`/users/contracts`);
  return res.data;
};
// export const updateContract = async (contractId: string, updates: any) => {
//   const res = await api.patch(`/api/users/contracts/${contractId}`, updates);
//   return res.data;
// };
