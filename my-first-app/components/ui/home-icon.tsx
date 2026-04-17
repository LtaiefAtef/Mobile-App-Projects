import Svg, { Path } from "react-native-svg";

// ─── Nav Icons ────────────────────────────────────────────────────────────────
export function HomeIcon({ color }: { color: string }){
    return(
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
            d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            <Path
            d="M9 21V12h6v9"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </Svg>
    );
}