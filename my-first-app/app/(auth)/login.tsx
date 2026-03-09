import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
export default function Login() {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ThemedView
        style={styles.container}
        darkColor="black"
        lightColor="#f8faff8e"
      >
        {/* Modern react MyApp Icon */}
        <ThemedText style={styles.title} type="title">
          Welcome to FTUSA
        </ThemedText>
        <ThemedTextInput
          placeholder="Email"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
          animationDealy={200}
        />
        <ThemedTextInput
          placeholder="Password"
          darkColor="white"
          lightColor="black"
          animationDealy={400}
        />
        <ThemedButton
          style={{ marginBlock: 20 }}
          lightBackground="#000000"
          darkBackground="#ffff"
          lightColor="white"
          darkColor="black"
          textValue="Login"
        />
        <ThemedView
          style={{
            backgroundColor: "transparent",
            width: "80%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText>Dont have an acccount? </ThemedText>
          <Link href="/(auth)/signup" dismissTo>
            <ThemedText type="link">Sign Up</ThemedText>
          </Link>
        </ThemedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    padding: 20,
  },
});
