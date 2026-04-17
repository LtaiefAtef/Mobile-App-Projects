import Svg, { Circle, Path } from "react-native-svg";




export function AboutIcon({ color }: { color: string }){
    return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
        <Path d="M12 11v5" stroke={color} strokeWidth={1.75} strokeLinecap="round" />
        <Circle cx={12} cy={7.5} r={0.75} fill={color} />
    </Svg>
    );
}