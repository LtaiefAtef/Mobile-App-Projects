import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveToken(access_token: string, refresh_token: string, expires_in: number) {
    await AsyncStorage.setItem("access_token", access_token);
    await AsyncStorage.setItem("refresh_token", refresh_token);
    const expiresAt = Date.now() + expires_in * 1000; 
    await AsyncStorage.setItem("expires_at", expiresAt.toString());
}

export async function saveUser(username: string) {
    await AsyncStorage.setItem("username", username);
}

export async function getUser(){
    return await AsyncStorage.getItem("username");
}

export async function getAccessToken(){
    return await AsyncStorage.getItem("access_token")
}

export async function getRefreshToken(){
    return await AsyncStorage.getItem("refresh_token");
}

export async function checkIfAuthor(user :string) {
    return await AsyncStorage.getItem("username") == user;
}
export async function getTokenExpirationDate(): Promise<number | null> {
    const expiresAt = await AsyncStorage.getItem("expires_at");
    if (!expiresAt) return null;
    return parseInt(expiresAt); // timestamp in ms
}

export async function logout(){
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
}