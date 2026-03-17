import { useThemeColor } from "@/hooks/use-theme-color";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
type ThemedPickerProps = {
    items: { label: string, value: string }[];
    selectedValue: string | undefined;
    onValueChange: (value: string) => void;
    placeholder?: string;
    lightColor?: string;
    darkColor?: string;
    style?: any;
}

export function ThemedPicker({ items, selectedValue, onValueChange, lightColor, darkColor, style }: ThemedPickerProps) {
    const color = useThemeColor({light : lightColor, dark : darkColor },"text");
    return (
        <View style={styles.wrapper}>
            <Picker
                style={[styles.picker, style, {color}]}
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                dropdownIconColor={color}
            >
                {items.map((item,index) => (
                    
                    <Picker.Item enabled={index===0 ? false : true} key={item.value} label={item.label} value={item.value}/>
                ))}
            </Picker>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper:{
        display: "flex", width: "90%",
        borderBottomWidth: 1,
        borderBottomColor: "white",
        borderRadius: 8,
        overflow: 'hidden',
        margin:10
    },
    picker: {
        height: 60,
        width: '100%',
        color: "white",
    },
});