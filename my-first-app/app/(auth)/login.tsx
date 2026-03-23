import { useState } from "react";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Link, router } from "expo-router";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import { loginRequest } from "@/services/api";
import { saveToken } from "@/services/auth";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ username: "", password: "" });

  const handleLogin = async() => {
    const newErrors = { username: "", password: "" };
    let hasError = false;

    // Username must be alphanumeric
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      newErrors.username = "Username must be alphanumeric.";
      hasError = true;
    }

    // Password must be at least 6 characters
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }
    console.log("Validation passed, attempting login...");
    const data = await loginRequest(username,password);
    if(data==null){
      console.log("Login failed: No data returned");
      return;
    }
    await saveToken(data.access_token, data.refresh_token, data.expires_in);
    console.log("Login successful, token saved. DATA : ", data);
    router.push("/");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ThemedView
        style={styles.container}
        darkColor="black"
        lightColor="#f8faff8e"
      >
        <ThemedText style={styles.title} type="title">
          Welcome to FTUSA
        </ThemedText>

        <ThemedTextInput
          placeholder="Username"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
          animationDealy={200}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrors((prev) => ({ ...prev, username: "" }));
          }}
        />
        {errors.username ? (
          <ThemedText style={styles.errorText}>{errors.username}</ThemedText>
        ) : null}

        <ThemedTextInput
          placeholder="Password"
          darkColor="white"
          lightColor="black"
          animationDealy={400}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          secureTextEntry
        />
        {errors.password ? (
          <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
        ) : null}

        <ThemedButton
          style={{ marginBlock: 20 }}
          lightBackground="#000000"
          darkBackground="#ffff"
          lightColor="white"
          darkColor="black"
          textValue="Login"
          onPress={handleLogin}
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
          <ThemedText>Don't have an account? </ThemedText>
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
  errorText: {
    color: "red",
    fontSize:12,
    width: "85%",
    fontWeight: "bold",
  },
});