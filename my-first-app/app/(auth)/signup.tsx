import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
export default function Signup(){
    return(
        <ThemedView style={styles.container} darkColor="black" lightColor="#f8faff8e">
            <ThemedText style={styles.title} type="title">Welcome to FTUSA</ThemedText>
            <View style={styles.fullName}>
                <ThemedTextInput
                    lightColor="black" 
                    darkColor="white" 
                    darkBackground="#3f3f3f54" 
                    lightBackground="#ffffff" placeholder="Prename"/>
                <ThemedTextInput
                    lightColor="black" 
                    darkColor="white" 
                    darkBackground="#3f3f3f54" 
                    lightBackground="#ffffff" placeholder="Family Name"/>
            </View>
            <ThemedTextInput placeholder="CIN" darkColor="white" lightColor="black" darkBackground="#3f3f3f54" lightBackground="#ffffff"/>
            <ThemedTextInput placeholder="Phone Number" darkColor="white" lightColor="black" darkBackground="#3f3f3f54" lightBackground="#ffffff"/>
            <ThemedTextInput placeholder="Email" darkColor="white" lightColor="black" darkBackground="#3f3f3f54" lightBackground="#ffffff"/>
            <ThemedTextInput placeholder="Password" darkColor="white" lightColor="black" darkBackground="#3f3f3f54" lightBackground="#ffffff"/>
                        <ThemedButton style={{marginBlock:20}} lightBackground="#000000" darkBackground="#ffff" lightColor="white" darkColor="black" textValue="Sign Up"/>
                        <ThemedView style={{backgroundColor:"transparent", width:"80%",display:"flex",flexDirection:"row", justifyContent:"center",
                            alignItems:"center"
                        }}><ThemedText>Already have an acccount? </ThemedText><Link href="/(auth)/login" dismissTo ><ThemedText type="link">Login</ThemedText></Link></ThemedView>
        </ThemedView>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    title:{
        padding:20,
    },
    fullName:{
        display:"flex",
        flexDirection:"row",
        width:"45%",
        gap:20,
        justifyContent:"center"
    }
})