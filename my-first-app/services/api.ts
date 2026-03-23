import Constants from "expo-constants";
import { getAccessToken, getRefreshToken, getTokenExpirationDate, logout, saveToken } from "./auth";
import { router } from "expo-router";

const { debuggerHost } = Constants.expoConfig?.hostUri 
  ? { debuggerHost: Constants.expoConfig.hostUri.split(":")[0] }
  : { debuggerHost: "localhost" };

export const API_URL = `http://${debuggerHost}:8081`;
console.log("API URL set to:", API_URL);
// Get Token function
export async function getToken(): Promise<string | null> {
    const token = await getAccessToken();
    console.log("Getting the token");
    if (!token) {
        console.log("Token is not there");
        router.replace("/login");
        return null;
    }

    const expiresAt = await getTokenExpirationDate();
    console.log(expiresAt, Date.now());
    if (!expiresAt || Date.now() > expiresAt) {
        console.log("GETTING REFRESH TOKEN")
        const refreshToken = await getRefreshToken();
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) {
            console.log("Couldnt get refresh token");
            console.log("Result Statu ", res);
            await logout();
            router.replace("/login");
            throw new Error('Session Expired');
        }

        const data = await res.json();
        await saveToken(data.access_token, data.refresh_token, data.expires_in);
        return data.access_token;
    }

    return token;
}

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
    const data = await res.json();
    return data;
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

export async function resendVerification(username: string){
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

export async function getUserContract(contractNumber: string|undefined) {
  const token = await getToken();
  console.log(token);
  console.log("THIS IS USER TOKEN TO GET CONTRACT API.TS LINE 109 ");
  const res = await fetch(`${API_URL}/users/contracts`,{
    method:"POST",
    headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type':"application/json"
 },
    body: JSON.stringify({contractNumber})
  });
  if(!res.ok) throw new Error(`Error getting user contract: headers :${JSON.stringify(res.headers)}`)
  return res.json();
}