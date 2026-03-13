import { useState } from "react";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { Link, router } from "expo-router";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { signupRequest } from "@/services/api";

export default function Signup() {
  const [prename, setPrename] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleSignup = async() => {
    const newErrors = { username: "", phone: "", email: "", password: "" };
    let hasError = false;

    // Username must be alphanumeric
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username)) {
      newErrors.username = "Username must be alphanumeric.";
      hasError = true;
    }

    // Phone must be numeric
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = "Phone number must contain only digits.";
      hasError = true;
    }

    // Email must be valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    // Password must be at least 6 characters
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      // Proceed with signup logic here
      return;
    }
    console.log("Signup data is valid, proceeding with API call...");
    const result = await signupRequest({prename,familyName,username,phoneNumber:phone,email,password});
    if(!result){
      console.log("ERROR")
      return;
    }
    router.replace(`/(auth)/verify-email?username=${username}&password=${password}`);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      <ThemedView style={styles.container} darkColor="black" lightColor="#f8faff8e">
        <ThemedText style={styles.title} type="title">Welcome to FTUSA</ThemedText>

        <View style={styles.fullName}>
          <ThemedTextInput
            lightColor="black"
            darkColor="white"
            darkBackground="#3f3f3f54"
            lightBackground="#ffffff"
            placeholder="Prename"
            value={prename}
            onChangeText={setPrename}
          />
          <ThemedTextInput
            lightColor="black"
            darkColor="white"
            darkBackground="#3f3f3f54"
            lightBackground="#ffffff"
            placeholder="Family Name"
            value={familyName}
            onChangeText={setFamilyName}
          />
        </View>

        <ThemedTextInput
          animationDealy={300}
          placeholder="Username"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
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
          animationDealy={350}
          placeholder="Phone Number"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setErrors((prev) => ({ ...prev, phone: "" }));
          }}
        />
        {errors.phone ? (
          <ThemedText style={styles.errorText}>{errors.phone}</ThemedText>
        ) : null}

        <ThemedTextInput
          animationDealy={400}
          placeholder="Email"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
        />
        {errors.email ? (
          <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
        ) : null}

        <ThemedTextInput
          animationDealy={450}
          placeholder="Password"
          darkColor="white"
          lightColor="black"
          darkBackground="#3f3f3f54"
          lightBackground="#ffffff"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
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
          textValue="Sign Up"
          onPress={handleSignup}
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
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/(auth)/login" dismissTo>
            <ThemedText type="link">Login</ThemedText>
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
  fullName: {
    display: "flex",
    flexDirection: "row",
    width: "45%",
    gap: 20,
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    fontSize:12,
    width: "85%",
    fontWeight: "bold",
  },
});