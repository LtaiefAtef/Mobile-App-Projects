import Svg, { Circle, Path } from "react-native-svg";

export function ProfileIcon({ color }: { color: string }){
     return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.75} />
            <Path
            d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            />
        </Svg>
    );
}