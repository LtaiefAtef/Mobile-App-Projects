import Constants from "expo-constants";
import { getToken } from "./auth";

const { debuggerHost } = Constants.expoConfig?.hostUri 
  ? { debuggerHost: Constants.expoConfig.hostUri.split(":")[0] }
  : { debuggerHost: "localhost" };

export const API_URL = `http://${debuggerHost}:8081`;
console.log("API URL set to:", API_URL);

export async function loginRequest(username:string, password:string){
    const res = await fetch(`${API_URL}/auth/login`,{
        method:"POST",
        headers:{
            "Content-Type" : "application/json",
        },
        body : JSON.stringify({
            username,
            password
        }),
    });
    if(!res.ok){
        console.log("Login failed with status", res.status, res.statusText);
        throw new Error("Login failed");
    }
    return res.json();
}

export async function signupRequest({ prename, familyName, username, phoneNumber, email, password }: {
  prename: string;
  familyName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
}){
    console.log("Sending signup request with data:", { prename, familyName, username, phoneNumber, email, password });
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prename, familyName, username, phoneNumber, email, password }),
  });
  
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

export async function resendVerification(username:string){
  await fetch(`${API_URL}/auth/resend-verification?username=${username}`,{
    method:"POST"
  }
  )
}
export async function isVerified(username: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/auth/is-verified?username=${username}`);
    if (!res.ok) return false;
    return res.json();
}

export async function getUserInfo(token: string) {
    const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user info");
    return res.json();
}

export async function getUserContract(contractNumber:string|undefined) {
  const token = await getToken();
  console.log(token);
  console.log("THIS IS USER TOKEN TO GET CONTRACT API.TS LINE 70 ");
  const res = await fetch(`${API_URL}/users/${contractNumber}/contracts`,{
    headers: { Authorization: `Bearer ${token}` }
  });
  if(!res.ok) throw new Error(`Error getting user contract: headers :${JSON.stringify(res.headers)}`)
  return res.json();
}