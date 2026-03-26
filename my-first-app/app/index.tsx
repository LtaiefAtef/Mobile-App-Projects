import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
export default function Home(){
    const router = useRouter();
    return <ThemedView style={styles.container}>
        <ThemedText type="title">Home</ThemedText>
        <ThemedButton textValue="Create a claim" darkBackground="#325bb3" lightBackground="#4971c7" style={{ marginBlock:40 }} onPress={() => router.push("/(accident_report)/step-1")} />
    </ThemedView>
}

const styles = StyleSheet.create({
    container:{
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        flex:1
    }
})