import Constants from "expo-constants";

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