import type { Contract } from "../constants/appData";
import api from "./axios";

export const getContractsByUser = async (clientDrivingLicense: string) => {
  const res = await api.get(`/users/${clientDrivingLicense}/contracts`);
  return res.data;
};

export const getAllContracts = async () => {
  const res = await api.get(`/users/contracts`);
  return res.data;
};

export async function createContract(contract:any) {
  try{
    const res = await api.post("/users/contracts/create-contract",JSON.stringify(contract),{
      headers:{"Content-Type" : "application/json"}
    });
    console.log("Contract Created Sucessfully",res);
    return res;
  }catch(error){
    throw new Error("Error creating the contract: "+ error);
  }
}
// export const updateContract = async (contractId: string, updates: any) => {
//   const res = await api.patch(`/api/users/contracts/${contractId}`, updates);
//   return res.data;
// };
