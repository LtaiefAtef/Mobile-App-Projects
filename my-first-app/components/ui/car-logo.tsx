import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";


// ─── Car Logo SVG ─────────────────────────────────────────────────────────────
export const CarLogo = () => (
  <Svg width={72} height={44} viewBox="0 0 96 56" fill="none">
    {/* Car body — lower slab */}
    <Rect x={6} y={32} width={84} height={16} rx={4}
      fill="#FFFFFF" fillOpacity={0.12} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1.5} />

    {/* Car cabin */}
    <Path
      d="M24 32 L32 14 Q33 12 35 12 L61 12 Q63 12 64 14 L72 32 Z"
      fill="#FFFFFF" fillOpacity={0.2}
      stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1.5}
      strokeLinejoin="round"
    />

    {/* Windshield */}
    <Path
      d="M36 30 L42 16 L54 16 L60 30 Z"
      fill="#FFFFFF" fillOpacity={0.35}
      stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1}
      strokeLinejoin="round"
    />

    {/* Side window */}
    <Path
      d="M28 30 L34 18 L42 18 L38 30 Z"
      fill="#FFFFFF" fillOpacity={0.2}
      stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1}
      strokeLinejoin="round"
    />
    <Path
      d="M68 30 L62 18 L54 18 L58 30 Z"
      fill="#FFFFFF" fillOpacity={0.2}
      stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1}
      strokeLinejoin="round"
    />

    {/* Left wheel */}
    <Circle cx={24} cy={46} r={9}
      fill="#1A1A18" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} />
    <Circle cx={24} cy={46} r={4}
      fill="#FFFFFF" fillOpacity={0.15} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1} />

    {/* Right wheel */}
    <Circle cx={72} cy={46} r={9}
      fill="#1A1A18" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} />
    <Circle cx={72} cy={46} r={4}
      fill="#FFFFFF" fillOpacity={0.15} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={1} />

    {/* Headlight */}
    <Rect x={84} y={34} width={8} height={4} rx={2}
      fill="#FFFFFF" fillOpacity={0.9} />
    {/* Tail light */}
    <Rect x={4} y={34} width={8} height={4} rx={2}
      fill="#FFFFFF" fillOpacity={0.45} />

    {/* Door line */}
    <Path
      d="M48 32 L48 44"
      stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={1} strokeLinecap="round" />

    {/* Underline / ground shadow */}
    <Ellipse cx={48} cy={55} rx={36} ry={2}
      fill="#000000" fillOpacity={0.18} />
  </Svg>
);