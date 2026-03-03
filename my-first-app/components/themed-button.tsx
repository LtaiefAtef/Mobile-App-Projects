import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleProp, StyleSheet, Text, type TextStyle, TouchableOpacity, type TouchableOpacityProps, View } from "react-native";
import Animated,{FadeInDown, FadeInUp} from "react-native-reanimated";
export type ThemedButtonProps = TouchableOpacityProps & {
    lightColor?:string;
    darkColor?:string;
    lightBackground?:string;
    darkBackground?:string;
    textValue?:string;
    textStyle?:StyleProp<TextStyle>;
    animationDealy?:number;
}
export function ThemedButton({ lightColor ,darkColor, lightBackground, darkBackground ,style, textStyle,textValue ,animationDealy=200,...rest }:ThemedButtonProps){
    const color = useThemeColor({ light:lightColor, dark:darkColor }, "text");
    const backgroundColor = useThemeColor({ light:lightBackground, dark:darkBackground }, "background")
    return(
        <Animated.View entering={FadeInUp.delay(animationDealy).duration(800).springify()} style={styles.view}>
            <TouchableOpacity style={[styles.button,{backgroundColor},style]}>
            <Text style={[styles.textButton,{color},textStyle]}>{textValue}</Text>
        </TouchableOpacity>
        </Animated.View>
    );
}
const styles=StyleSheet.create({
    button:{
        width:"80%",
        padding:10,
        borderRadius:20,
        display:"flex",
        alignItems:"center"
    },
    textButton:{
        fontSize:18,
        fontWeight:"bold"
    },
    view:{
        display:"flex",
        alignItems:"center",
        width:"90%"
    }
})