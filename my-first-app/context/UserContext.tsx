import { User } from "@/constants/appData";
import { API_URL, getUserInfo } from "@/services/api";
import { getUser } from "@/services/auth";
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { SubmissionMode } from "@/components/claim-component";
import EventSource from 'react-native-sse';
import * as Notifications from "expo-notifications";
import { usePathname } from "expo-router";
interface UserContextType {
    userInfo: RefObject<User>;
    userPresent: RefObject<boolean>;
    userClaims: claimRecord[];
    notificationPermitted: RefObject<boolean>;
    getData: () => Promise<User | null>;
    subscribeToNotifications: (username: string, onNotifications?: () => void) => void;
    unsubscribeToNotifications: () => void;
    setupNotifications: () => Promise<boolean>;
    showSystemNotification: (title: string, body: string) => Promise<void>;
    hasNotifications: boolean;
    setHasNotifications: Dispatch<SetStateAction<boolean>>;
}

export interface claimRecord {
    claimId: string;
    claimName: string;
    submittedAt: string;
    submittedWith: string;
    mode: SubmissionMode;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const userPresent = useRef(false);
    const eventSource = useRef<InstanceType<typeof EventSource> | null>(null);
    const [userClaims, setUserClaims] = useState<claimRecord[]>([]);
    const [hasNotifications, setHasNotifications]  = useState(false);
    const notificationPermitted = useRef(false);
    const path = usePathname();
    const userInfo = useRef<User>({
        myClaims: [],
        notifications: [],
        username: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: ""
    });
    useEffect(()=>{
      async function init(){
        const res = await setupNotifications();
        if(res){
          notificationPermitted.current = true;
        }
      }
      init();
    },[]);
    function subscribeToNotifications(username: string, onNotifications?: () => void) {
        if (eventSource.current) {
            eventSource.current.close();
        }

        eventSource.current = new EventSource(
            `${API_URL}/notifications/subscribe/${username}`
        );

        // Connection Established
        eventSource.current.addEventListener('connected', (e: any) => {
            const data = JSON.parse(e.data);
        });

        // Incoming notification
        eventSource.current.addEventListener('notification', (e: any) => {
            const data = JSON.parse(e.data);
            console.log("SSE New Notification", data);
            showSystemNotification(data.title, data.message);
            if(!hasNotifications){
                setHasNotifications(true);
            }
            userInfo.current.notifications.unshift({
                title: data.title,
                message: data.message,
                timestamp: new Date().getTime(),
            })
            
            if(onNotifications) onNotifications();
        });

        // Error
        eventSource.current.addEventListener('error', (err: any) => {
            console.log("SSE Error", err);
            eventSource.current?.close();
            console.log("Reconnecting in 5 seconds...");
            setTimeout(() => subscribeToNotifications(username, onNotifications), 5000);
        });
    }

    function unsubscribeToNotifications() {
        if (eventSource.current) {
            eventSource.current.close();
            eventSource.current = null;
        }
    }
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
    async function showSystemNotification(title: string, body: string) {
        console.log("Showing system notification:", title, body);
        
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null,
        })
    }
    async function setupNotifications() {
        const { status } = await Notifications.requestPermissionsAsync();
        if(status !== "granted"){
            console.log("Notification permission not granted");
            return false;
        }
        return true;
    }
    async function getData() {
        const user = await getUser();
        if (user) {
            await getUserInfo(user).then((data) => {
            userInfo.current = { 
                ...data,
                notifications: data.notifications ?? [],
                myClaims: data.myClaims ?? [],
            };
                setUserClaims(userInfo.current.myClaims);
                userPresent.current = true;
            });
            return userInfo.current;
        }
        return null;
    }

    return (
        <UserContext.Provider value={{
            userInfo,
            getData,
            userPresent,
            userClaims,
            subscribeToNotifications,
            unsubscribeToNotifications,
            setupNotifications,
            showSystemNotification,
            notificationPermitted,
            hasNotifications,
            setHasNotifications,
        }}>
            {children}
        </UserContext.Provider>
    );
}

// --- Hook ---
export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
}