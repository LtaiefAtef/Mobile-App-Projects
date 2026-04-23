import Constants from "expo-constants";
import { getAccessToken, getRefreshToken, getTokenExpirationDate, logout, saveToken } from "./auth";
import { router } from "expo-router";
import { ReportData } from "@/context/AccidentReportContext";
import { claimRecord } from "@/context/UserContext";

const { debuggerHost } = Constants.expoConfig?.hostUri 
  ? { debuggerHost: Constants.expoConfig.hostUri.split(":")[0] }
  : { debuggerHost: "localhost" };

export const API_URL = `http://${debuggerHost}:8081`;
// Get Token function
export async function getToken(): Promise<string | null> {
    const token = await getAccessToken();
    if (!token) {
        router.replace("/login");
        return null;
    }

    const expiresAt = await getTokenExpirationDate();
    if (!expiresAt || Date.now() > expiresAt) {
        const refreshToken = await getRefreshToken();
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) {
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
        if(!res.ok && res.status === 401){
            throw new Error("Invalid Crednentials");
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

export async function getUserContract(contractNumber: string|undefined) {
  const token = await getToken();
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

// --- User Functions --- 
export async function getUserInfo(username: string) {
    const token = await getToken();
 
    const res = await fetch(`${API_URL}/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
        method:"GET"
    })
    if (!res.ok) console.log("Failed to fetch user info, Headers: " + JSON.stringify(res.headers, null , 2) + ", Status: " + res.status+ ", Text: " +
        res.statusText 
    );
    return res.json();
}

export async function setUserFullName(username :string, fullname :string[]){
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/auth/modify-fullname`,{
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json" },
            body:JSON.stringify({
                username,
                firstName:fullname[0],
                lastName:fullname[1]
            }
            ),
            method:"PUT"
        })
        if(!res.ok) console.log("Failed to modify fullname",res.headers, res.status,res.body, res.statusText);
    }catch(e){
        throw new Error("Could not Modify User: " + e)
    }
}

export async function setUserEmail(username :string, email :string){
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/auth/modify-email`,{
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json" },
            body: JSON.stringify({
                username,
                email
            }),
            method:"PUT"
        })
        if(!res.ok) console.log("Failed to modify email",res.headers, res.status,res.body, res.statusText);
    }catch(e){
        throw new Error("Could not Modify User: " + e);
    }
}
export async function setUserPhone(username :string, phone :string){
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/auth/modify-phone`,{
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json" },
            body: JSON.stringify({
                username,
                phone
            }),
            method:"PUT"
        })
        if(!res.ok) console.log("Failed to modify phone",res.headers, res.status,res.body, res.statusText);
    }catch(e){
        throw new Error("Could not Modify User: " + e);
    }
}
export async function setUserPassword(username :string, currentPassword :string, newPassword :string){
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/auth/modify-password`,{
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json" },
            body: JSON.stringify({
                username,
                currentPassword,
                newPassword
            }),
            method:"PUT"
        })
        if(!res.ok) console.log("Failed to modify phone",res.headers, res.status,res.body, res.statusText);
    }catch(e){
        throw new Error("Could not Modify User: " + e);
    }
}

export async function deleteUserAccount(username :string) {
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/auth/delete-user/${username}`,{
            headers: { Authorization: `Bearer ${token}` },
            method:"DELETE"
        })
        if(!res.ok) console.log("Failed to modify phone",res.headers, res.status,res.body, res.statusText);
    }catch(e){
        throw new Error("Could not Delete User: " + e);
    }
}

export async function createClaim(claim : ReportBody) {
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/users/create-claim`,{
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json"},
            method:"POST",
            body: JSON.stringify(claim)
        })
        if(!res.ok) console.log("Failed to create a claim", res.headers, res.status, res.body, res.statusText)
    }catch(e){
        throw new Error("Could not create a claim" + e);
    }
}

export async function addClaimForUser(username :string, claimId :string) {
    const token = await getToken();
    try{
        const res = await fetch(`${API_URL}/users/set-account-claim`,{
            headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json"},
            method:'POST',
            body: JSON.stringify({username, claimId})
        })
        if(!res.ok) console.log("Failed to add claim for user");
    }catch(e){
        throw new Error("Could not Add Claim for User");
    }
}

// export async function getClaimByClaimId(claim : claimRecord) : Promise<claimRecord> {
//     const token = await getToken();
//     try{
//         const res : any = await fetch(`${API_URL}/users/claims/${claim.claimId}`,{
//             headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
//             method:"GET"
//         })
//         if(!res.ok) console.log("Failed to get claim for user");
//         return res.json();
//     }catch(e){
//         throw new Error("Could not get claim for user");
//     }
// }