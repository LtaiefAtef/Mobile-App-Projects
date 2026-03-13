import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
import { resendVerification, isVerified } from "@/services/api";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmail() {
    const { username } = useLocalSearchParams();
    const router = useRouter();
    const [timer, setTimer] = useState(60);
    const [disabledButton, setDisabledButton] = useState(true);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = () => {
        setTimer(60);
        setDisabledButton(true);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setDisabledButton(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        // Start resend timer
        startTimer();

        // Start polling
        const poll = setInterval(async () => {
            console.log('Polling...');
            try {
                const verified = await isVerified(username as string);
                console.log('Verified:', verified);
                if (verified) {
                    clearInterval(poll);
                    router.replace('/(auth)/login');
                }
            } catch (e) {
                console.log('Polling error:', e);
            }
        }, 3000);

        pollRef.current = poll;

        const timeout = setTimeout(() => clearInterval(poll), 600000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            clearInterval(poll);
            clearTimeout(timeout);
        };
    }, []);

    const handleResend = async () => {
        await resendVerification(username as string);
        startTimer();
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "white", width: "80%", marginVertical: 20, textAlign: "center" }}>
                Please verify your email address. A verification email has been sent to your inbox.
            </Text>
            {disabledButton && (
                <Text style={{ color: "gray", marginBottom: 10 }}>
                    You can resend the email in {timer} seconds.
                </Text>
            )}
            <Button title="Resend Verification Email" onPress={handleResend} disabled={disabledButton} />
        </View>
    );
}