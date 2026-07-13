interface Props {
  avatar: string;
  color?: string;
  /** Radius in viewBox units (0–100 space). */
  size?: number;
  pulse?: boolean;
  clipId: string;
  label?: string;
}

export default function MapPlayerAvatar({
  avatar,
  color = '#d4943a',
  size = 2.4,
  pulse = false,
  clipId,
  label,
}: Props) {
  const r = size;
  const imgSize = r * 2;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <clipPath id={clipId}>
          <circle r={r * 0.92} />
        </clipPath>
      </defs>

      {pulse && (
        <circle r={r * 1.35} fill={color} opacity={0.18}>
          <animate attributeName="r" values={`${r * 1.35};${r * 1.85};${r * 1.35}`} dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.18;0.06;0.18" dur="2.8s" repeatCount="indefinite" />
        </circle>
      )}

      <image
        href={avatar}
        x={-r * 0.92}
        y={-r * 0.92}
        width={imgSize * 0.92}
        height={imgSize * 0.92}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
      />

      {label && (
        <text
          y={-(r + 1.2)}
          textAnchor="middle"
          fontSize="1.9"
          fill={color}
          fontWeight="600"
          style={{ userSelect: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
