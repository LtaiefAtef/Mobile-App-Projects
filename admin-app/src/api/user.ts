import api from "./axios";

export const getUsers = async (search?: string) => {
  const res = await api.get("/api/users", { params: search ? { search } : {} });
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
};
