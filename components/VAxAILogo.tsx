type Props = {
  variant?: "light" | "dark";
  className?: string;
};

export default function VAxAILogo({ variant = "light", className }: Props) {
  const fill = variant === "light" ? "#FFFFFF" : "#063b32";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 278 72"
      aria-label="VAxAI"
      className={className}
      fill="none"
    >
      {/* V */}
      <polygon points="0,2 14,2 35,70" fill={fill} />
      <polygon points="70,2 56,2 35,70" fill={fill} />

      {/* A (first) */}
      <polygon points="80,70 92,70 110,2" fill={fill} />
      <polygon points="140,70 128,70 110,2" fill={fill} />
      <rect x="101" y="30" width="18" height="12" fill={fill} />

      {/* Lime green accent triangles */}
      <polygon points="150,68 163,36 176,68" fill="#C4E030" />
      <polygon points="163,54 172,36 181,54" fill="#C4E030" />

      {/* A (second) */}
      <polygon points="188,70 200,70 218,2" fill={fill} />
      <polygon points="248,70 236,70 218,2" fill={fill} />
      <rect x="209" y="30" width="18" height="12" fill={fill} />

      {/* I */}
      <rect x="257" y="2" width="18" height="68" fill={fill} />
    </svg>
  );
}
