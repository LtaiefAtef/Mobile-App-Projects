import { User } from "@/constants/appData";
import { getUserInfo } from "@/services/api";
import { getUser } from "@/services/auth";
import { createContext, ReactNode, RefObject, useContext, useEffect, useRef, useState } from "react";
import { ReportData } from "./AccidentReportContext";
import { SubmissionMode } from "@/components/claim-component";

interface UserContextType{
    userInfo : RefObject<User>;
    userPresent : RefObject<boolean>
    userClaims: claimRecord[];
    getData:() => Promise<User | null>;
}

export interface claimRecord{
    claimId :string
    claimName :string
    submittedAt :string
    submittedWith :string
    mode :SubmissionMode
}

const UserContext = createContext<UserContextType | null>(null);
export function UserProvider({ children } : { children : ReactNode} ){
    const userPresent = useRef(false);
    const [userClaims, setUserClaims] = useState<claimRecord[]>([]);
    const userInfo =  useRef<User>({
        myClaims:[],
        username:"",
        firstName:"",
        lastName:"",
        phone:"",
        email:"",
        password:""
    });
    async function getData() {
        const user = await getUser();
        if(user){
            const data = await getUserInfo(user).then((data) => {
                userInfo.current = { ...data }
                setUserClaims(userInfo.current.myClaims);
                userPresent.current = true;
            })
            return userInfo.current;
        }
        return null;
    }
    return(
        <UserContext.Provider value={{ userInfo, getData, userPresent, userClaims }}>
            {children}
        </UserContext.Provider>
    )
}
//  --- Hook ---
export function useUser(){
    const ctx = useContext(UserContext);
    if(!ctx) throw new Error("useUser must be used inside <UserProvider>")
        return ctx;
}