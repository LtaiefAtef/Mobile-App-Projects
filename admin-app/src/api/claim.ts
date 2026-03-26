import api from "./axios";

export async function getAllClaims() {
  try{
      const res = await api.get("/users/claims");
      return res.data;
  }catch(e){
    throw new Error("Error getting the claims: "+ e)
  }
}