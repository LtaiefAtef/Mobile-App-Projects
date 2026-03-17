import api from "./axios";

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createUser = async (user: any) => {
  const res = await api.post("/users", user);
  return res.data;
};

export const updateUser = async (id: string, user: any) => {
  const res = await api.put(`/users/${id}`, user);
  return res.data;
};

export const deleteUser = async (id: string) => {
  return api.delete(`/users/${id}`);
};