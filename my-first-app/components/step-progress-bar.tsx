import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    user1Step?: number | null;
    user2Step?: number | null;
    user1Label?: string | null;
    user2Label?: string | null;
};

export default function StepProgressBar({ user1Step = null, user2Step = null, user1Label = null, user2Label = null }: Props) {
    const steps = [1, 2, 3, 4, 5 , 6];
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.floating, { paddingTop: insets.top + 8 }]}>
            <View style={styles.row}>
                <Text style={[styles.label, { color: "#5447cc" }]}>{user1Label && "●"} {user1Label ?? ""}</Text>
                <Text style={[styles.label, { color: "#e05c97" }]}>{user2Label ?? ""} {user2Label && "●"}</Text>
            </View>

            <View style={styles.stepsWrapper}>
                {steps.map((step, index) => {
                    const isU1 = user1Step === step && !!user1Label;
                    const isU2 = user2Step === step && !!user2Label;
                    const bothHere = isU1 && isU2;
                    const lineActive =
                        (user1Step !== null && user1Step >= step) ||
                        (user2Step !== null && user2Step >= step);

                    return (
                        <View key={step} style={styles.stepContainer}>
                            {index !== 0 && (
                                <View style={[styles.line, lineActive && styles.lineActive]} />
                            )}

                            <View style={[
                                styles.circle,
                                isU1 && !bothHere && styles.circleU1,
                                isU2 && !bothHere && styles.circleU2,
                                bothHere && styles.circleBoth,
                            ]}>
                                <Text style={[styles.stepNumber, (isU1 || isU2) && { color: "#fff" }]}>
                                    {step == 6 ? "✔" : step}
                                </Text>
                            </View>

                            <View style={styles.pointerSlot}>
                                {bothHere && <Text style={styles.pointerBoth}>both</Text>}
                                {isU1 && !bothHere && <Text style={[styles.pointer, { color: "#5447cc" }]}>▲</Text>}
                                {isU2 && !bothHere && <Text style={[styles.pointer, { color: "#e05c97" }]}>▲</Text>}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    floating: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingBottom: 12,
        elevation: 2,
        gap: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
    },
    stepsWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    stepContainer: {
        alignItems: "center",
        flex: 1,
        position: "relative",
    },
    line: {
        position: "absolute",
        height: 3,
        backgroundColor: "#e0e0e0",
        top: 14,
        left: "-50%",
        right: "50%",
        width: "100%",
    },
    lineActive: {
        backgroundColor: "#c4b5fd",
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#f0eeff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        zIndex: 1,
    },
    circleU1: {
        backgroundColor: "#5447cc",
        borderColor: "#5447cc",
    },
    circleU2: {
        backgroundColor: "#e05c97",
        borderColor: "#e05c97",
    },
    circleBoth: {
        backgroundColor: "#5447cc",
        borderColor: "#e05c97",
        borderWidth: 3,
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: "700",
        color: "#aaa",
    },
    pointerSlot: {
        height: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    pointer: {
        fontSize: 10,
        fontWeight: "700",
    },
    pointerBoth: {
        fontSize: 8,
        fontWeight: "700",
        color: "#888",
    },
});