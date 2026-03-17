import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import Animated,{FadeInRight, FadeInUp} from "react-native-reanimated";

export type ThemedTextInputProps = TextInputProps & {
    lightColor?:string;
    darkColor?:string;
    lightBackground?:string;
    darkBackground?:string;
    animationDealy?:number;
}
export function ThemedTextInput({style,lightColor,darkColor,lightBackground,darkBackground,animationDealy=200,...rest}:ThemedTextInputProps){
    const color = useThemeColor({ light:lightColor, dark:darkColor },"text")
    const backgroundColor = useThemeColor({light:lightBackground,dark:darkBackground},"background")
    return (
        <Animated.View entering={FadeInRight.delay(animationDealy).duration(800).springify()} style={{width:"90%"}}>
            <TextInput placeholderTextColor={color} style={[styles.input,{color,backgroundColor},style]} {...rest}/>
        </Animated.View>
    )
}
const styles = StyleSheet.create({
    input:{
        fontSize:12,
        padding:15,
        borderRadius:20,
        marginBlock:10,
        borderBottomColor:"gray",
        borderBottomWidth:1,
    }
})