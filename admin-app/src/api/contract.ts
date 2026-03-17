import api from "./axios";

export const getContracts = async () => {
  const res = await api.get("/contracts");
  return res.data;
};

export const createContract = async (contract: any) => {
  const res = await api.post("/contracts", contract);
  return res.data;
};

export const updateContract = async (id: string, contract: any) => {
  const res = await api.put(`/contracts/${id}`, contract);
  return res.data;
};