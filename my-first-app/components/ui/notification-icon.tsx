import Svg, { Path, Circle, SvgProps } from "react-native-svg";

export function NotificationIcon({ hasNotification = false, ...rest }: { hasNotification?: boolean } & SvgProps) {
  return (
    <Svg {...rest} width={28} height={24} viewBox="0 0 28 24" fill="none">
      {/* Bell body */}
      <Path
        d="M14 2C13.4 2 13 2.4 13 3C9.5 3.8 7 7 7 10.5L7 16L5 19H23L21 16L21 10.5C21 7 18.5 3.8 15 3C15 2.4 14.6 2 14 2Z"
        fill="#000000"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Clapper */}
      <Path
        d="M11.5 19C11.5 20.4 12.6 21.5 14 21.5C15.4 21.5 16.5 20.4 16.5 19"
        fill="none"
        stroke="#000000"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Badge dot — only renders when hasNotification is true */}
      {hasNotification && (
        <Circle cx={21} cy={4} r={3.5} fill="#FF3B30" stroke="#ffffff" strokeWidth={1} />
      )}
    </Svg>
  );
}