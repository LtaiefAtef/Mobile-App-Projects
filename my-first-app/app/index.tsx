import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function Home(){
    return <ThemedView style={styles.container}>
        <ThemedText type="title">Home</ThemedText>
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