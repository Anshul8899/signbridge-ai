"use client";

/**
 * RealisticHandSVG
 *
 * Renders a procedural, photorealistic human hand as inline SVG.
 * Anatomy:
 *  - Palm: natural trapezoidal shape with skin gradient, shadow, and knuckle highlights
 *  - Wrist: rounded trapezoid with subtle shadow
 *  - 5 fingers: 3 phalanges each, rounded caps, per-finger width/length variation,
 *    skin crease lines, individual lighting based on curl angle
 *  - Error fingers glow red with a soft shadow
 *  - Skin tone: warm natural (can be expanded)
 *
 * Params mirror the HandPose structure: curls[5], spread[5], wristTilt.
 */

import { useMemo } from "react";

export interface RealisticHandSVGProps {
  /** Curl per finger [thumb, index, middle, ring, pinky] 0=extended 1=curled */
  curls: [number, number, number, number, number];
  /** Spread per finger 0=together 1=spread */
  spread: [number, number, number, number, number];
  /** Wrist tilt degrees */
  wristTilt?: number;
  /** Fingers with positioning errors — glow red */
  errorFingers?: string[];
  /** Width of the SVG viewport */
  width?: number;
  /** Height of the SVG viewport */
  height?: number;
  className?: string;
}

// ── Skin colour palette ───────────────────────────────────────────────────
const SKIN = {
  base:       "#e8b896",
  mid:        "#d4956e",
  shadow:     "#b87148",
  highlight:  "#f5d5b8",
  pale:       "#f0c9a8",
  deep:       "#a0623a",
  nail:       "#f2c4b0",
  nailTip:    "#ffe0d0",
  crease:     "rgba(140,80,40,0.25)",
};

// ── Finger geometry config ────────────────────────────────────────────────
interface FingerConfig {
  name: string;
  baseX: number;      // x position at palm base
  width: number;      // finger width at base
  segLengths: [number, number, number]; // proximal, middle, distal
  isThumb: boolean;
  thumbAngleOffset: number; // extra rotation for thumb anatomy
}

const PALM_W = 110;
const PALM_H = 105;
const PALM_CX = 140;
const PALM_CY = 210;
const WRIST_W = 85;
const WRIST_H = 42;

const FINGER_CONFIGS: FingerConfig[] = [
  // Thumb — offset to left, shorter, angled
  { name: "Thumb",  baseX: PALM_CX - 60, width: 22, segLengths: [38, 28, 22], isThumb: true,  thumbAngleOffset: -38 },
  // Index
  { name: "Index",  baseX: PALM_CX - 36, width: 19, segLengths: [52, 32, 24], isThumb: false, thumbAngleOffset: 0 },
  // Middle — longest
  { name: "Middle", baseX: PALM_CX - 10, width: 20, segLengths: [58, 34, 26], isThumb: false, thumbAngleOffset: 0 },
  // Ring
  { name: "Ring",   baseX: PALM_CX + 16, width: 19, segLengths: [54, 32, 24], isThumb: false, thumbAngleOffset: 0 },
  // Pinky
  { name: "Pinky",  baseX: PALM_CX + 40, width: 16, segLengths: [40, 26, 20], isThumb: false, thumbAngleOffset: 0 },
];

const MAX_SPREAD_PX = 14; // max lateral spread per finger
const PALM_TOP_Y   = PALM_CY - PALM_H / 2 + 8; // y where fingers attach to palm

// ── Utility ───────────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/** Build the SVG path for one finger as stacked capsule-phalanges */
interface PhalangeData {
  x1: number; y1: number; x2: number; y2: number;
  width: number;
  crease: boolean;
  isLit: boolean; // top phalanx is most lit
}

function buildFingerPhalanges(
  cfg: FingerConfig,
  curl: number,
  spreadX: number,
  errorFingers: Set<string>
): PhalangeData[] {
  const phalanges: PhalangeData[] = [];
  const [l0, l1, l2] = cfg.segLengths;
  const totalLength = l0 + l1 + l2;
  const isError = errorFingers.has(cfg.name);

  // Build cumulative segment positions
  // For non-thumb: each segment curls progressively
  // curl 0 = straight up, curl 1 = fully folded (pointing back into palm)
  const maxCurl0 = cfg.isThumb ? 60 : 80;  // degrees proximal
  const maxCurl1 = cfg.isThumb ? 40 : 70;  // degrees middle
  const maxCurl2 = cfg.isThumb ? 30 : 50;  // degrees distal

  const ang0 = toRad(curl * maxCurl0);
  const ang1 = toRad(curl * maxCurl1);
  const ang2 = toRad(curl * maxCurl2);

  // Base angle: -90° = straight up; thumb has extra offset
  const baseAngle = toRad(-90 + cfg.thumbAngleOffset);

  // Proximal start
  let ax = cfg.baseX + spreadX;
  let ay = PALM_TOP_Y;

  // Segment 0 (proximal)
  const a0 = baseAngle + ang0;
  const bx = ax + Math.cos(a0) * l0;
  const by = ay + Math.sin(a0) * l0;
  phalanges.push({ x1: ax, y1: ay, x2: bx, y2: by, width: cfg.width, crease: true, isLit: false });

  // Segment 1 (middle)
  const a1 = a0 + ang1;
  const cx2 = bx + Math.cos(a1) * l1;
  const cy2 = by + Math.sin(a1) * l1;
  phalanges.push({ x1: bx, y1: by, x2: cx2, y2: cy2, width: cfg.width * 0.88, crease: true, isLit: false });

  // Segment 2 (distal / fingertip)
  const a2 = a1 + ang2;
  const dx = cx2 + Math.cos(a2) * l2;
  const dy = cy2 + Math.sin(a2) * l2;
  phalanges.push({ x1: cx2, y1: cy2, x2: dx, y2: dy, width: cfg.width * 0.76, crease: false, isLit: true });

  return phalanges;
}

/** Render one capsule-segment as an SVG group */
function SegmentPath({
  x1, y1, x2, y2, width, isLit, crease, isError, segIdx, fingerId,
}: PhalangeData & { isError: boolean; segIdx: number; fingerId: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;
  const hw = width / 2;
  const r = hw; // capsule radius

  // 4 control points of the capsule
  const px1 = x1 + nx * hw;
  const py1 = y1 + ny * hw;
  const px2 = x2 + nx * hw;
  const py2 = y2 + ny * hw;
  const px3 = x2 - nx * hw;
  const py3 = y2 - ny * hw;
  const px4 = x1 - nx * hw;
  const py4 = y1 - ny * hw;

  const gradId = `seg-grad-${fingerId}-${segIdx}`;
  const shadowId = `seg-shadow-${fingerId}-${segIdx}`;

  const fillColor = isError
    ? `url(#${gradId})`
    : `url(#${gradId})`;

  const gradAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  return (
    <g>
      <defs>
        {isError ? (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${gradAngle}, 0.5, 0.5)`}>
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="40%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#cc2222" />
          </linearGradient>
        ) : (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${gradAngle}, 0.5, 0.5)`}>
            <stop offset="0%"   stopColor={SKIN.shadow}    />
            <stop offset="20%"  stopColor={SKIN.mid}       />
            <stop offset="50%"  stopColor={SKIN.pale}      />
            <stop offset="80%"  stopColor={isLit ? SKIN.highlight : SKIN.base} />
            <stop offset="100%" stopColor={SKIN.mid}       />
          </linearGradient>
        )}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation={isError ? "3" : "1.5"}
            floodColor={isError ? "#ff0000" : SKIN.deep}
            floodOpacity={isError ? "0.7" : "0.35"} />
        </filter>
      </defs>

      {/* Segment body */}
      <path
        d={`M ${px1} ${py1}
            L ${px2} ${py2}
            Q ${x2 + nx * hw * 1.2} ${y2 + ny * hw * 1.2} ${x2 + nx * 0} ${y2 + ny * 0}
            Q ${x2 - nx * hw * 1.2} ${y2 - ny * hw * 1.2} ${px3} ${py3}
            L ${px4} ${py4}
            Q ${x1 - nx * hw * 1.2} ${y1 - ny * hw * 1.2} ${x1} ${y1}
            Q ${x1 + nx * hw * 1.2} ${y1 + ny * hw * 1.2} ${px1} ${py1} Z`}
        fill={fillColor}
        filter={`url(#${shadowId})`}
      />

      {/* Skin crease highlight */}
      {crease && !isError && (
        <line
          x1={x1 + nx * hw * 0.7} y1={y1 + ny * hw * 0.7}
          x2={x1 - nx * hw * 0.7} y2={y1 - ny * hw * 0.7}
          stroke={SKIN.crease} strokeWidth="1.2" strokeLinecap="round"
        />
      )}

      {/* Nail on distal (last) segment */}
      {!crease && !isError && (
        <>
          <ellipse
            cx={(x1 + x2) / 2 + nx * hw * 0.05}
            cy={(y1 + y2) / 2}
            rx={hw * 0.65}
            ry={len * 0.38}
            fill={SKIN.nail}
            opacity="0.85"
          />
          <ellipse
            cx={(x1 + x2) / 2 + nx * hw * 0.05}
            cy={(y1 + y2) / 2 - len * 0.1}
            rx={hw * 0.45}
            ry={len * 0.12}
            fill={SKIN.nailTip}
            opacity="0.5"
          />
        </>
      )}
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function RealisticHandSVG({
  curls,
  spread,
  wristTilt = 0,
  errorFingers = [],
  width = 280,
  height = 340,
  className,
}: RealisticHandSVGProps) {
  const errorSet = new Set(errorFingers);
  const vw = 280;
  const vh = 340;

  // Serialize arrays to strings so useMemo detects value changes correctly
  // (array references passed as props are not stable across renders)
  const curlsKey   = curls.join(",");
  const spreadKey  = spread.join(",");
  const errKey     = errorFingers.join(",");

  const fingers = useMemo(() => {
    return FINGER_CONFIGS.map((cfg, i) => {
      const spreadX = (spread[i] - 0.2) * MAX_SPREAD_PX * (i < 2 ? -1 : 1) * (i === 0 ? 2 : 1);
      return buildFingerPhalanges(cfg, curls[i], spreadX, new Set(errorFingers));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curlsKey, spreadKey, errKey]);

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={width}
      height={height}
      className={className}
      style={{ transform: `rotate(${wristTilt}deg)`, transformOrigin: "center bottom" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Palm gradient */}
        <radialGradient id="palm-grad" cx="45%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={SKIN.pale}     />
          <stop offset="40%"  stopColor={SKIN.base}     />
          <stop offset="100%" stopColor={SKIN.mid}      />
        </radialGradient>
        {/* Wrist gradient */}
        <linearGradient id="wrist-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={SKIN.shadow}   />
          <stop offset="30%"  stopColor={SKIN.base}     />
          <stop offset="65%"  stopColor={SKIN.pale}     />
          <stop offset="100%" stopColor={SKIN.mid}      />
        </linearGradient>
        {/* Palm shadow */}
        <filter id="palm-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor={SKIN.deep} floodOpacity="0.4" />
        </filter>
        {/* Overall ambient occlusion */}
        <filter id="ao" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Wrist ─────────────────────────────────────────────── */}
      <rect
        x={PALM_CX - WRIST_W / 2}
        y={PALM_CY + PALM_H / 2 - 6}
        width={WRIST_W}
        height={WRIST_H}
        rx={12}
        ry={12}
        fill="url(#wrist-grad)"
        filter="url(#palm-shadow)"
      />
      {/* Wrist crease lines */}
      {[4, 12].map((offset) => (
        <line key={offset}
          x1={PALM_CX - WRIST_W / 2 + 6}
          y1={PALM_CY + PALM_H / 2 + offset}
          x2={PALM_CX + WRIST_W / 2 - 6}
          y2={PALM_CY + PALM_H / 2 + offset}
          stroke={SKIN.crease} strokeWidth="1.2" strokeLinecap="round"
        />
      ))}

      {/* ── Palm ──────────────────────────────────────────────── */}
      <path
        d={`
          M ${PALM_CX - PALM_W / 2 + 10} ${PALM_CY + PALM_H / 2}
          Q ${PALM_CX - PALM_W / 2} ${PALM_CY + PALM_H / 2} ${PALM_CX - PALM_W / 2} ${PALM_CY}
          Q ${PALM_CX - PALM_W / 2 - 2} ${PALM_CY - PALM_H / 2 + 18} ${PALM_CX - PALM_W / 2 + 18} ${PALM_CY - PALM_H / 2 + 4}
          Q ${PALM_CX - 20} ${PALM_CY - PALM_H / 2 - 2} ${PALM_CX} ${PALM_CY - PALM_H / 2 - 4}
          Q ${PALM_CX + 20} ${PALM_CY - PALM_H / 2 - 2} ${PALM_CX + PALM_W / 2 - 18} ${PALM_CY - PALM_H / 2 + 4}
          Q ${PALM_CX + PALM_W / 2 + 2} ${PALM_CY - PALM_H / 2 + 18} ${PALM_CX + PALM_W / 2} ${PALM_CY}
          Q ${PALM_CX + PALM_W / 2} ${PALM_CY + PALM_H / 2} ${PALM_CX + PALM_W / 2 - 10} ${PALM_CY + PALM_H / 2}
          Z
        `}
        fill="url(#palm-grad)"
        filter="url(#palm-shadow)"
      />

      {/* Palm crease lines (heart line, head line, life line) */}
      <path d={`M ${PALM_CX - 44} ${PALM_CY - 18} Q ${PALM_CX} ${PALM_CY - 28} ${PALM_CX + 44} ${PALM_CY - 22}`}
        stroke={SKIN.crease} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d={`M ${PALM_CX - 38} ${PALM_CY + 8} Q ${PALM_CX - 10} ${PALM_CY - 2} ${PALM_CX + 36} ${PALM_CY + 4}`}
        stroke={SKIN.crease} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d={`M ${PALM_CX - 28} ${PALM_CY - 36} Q ${PALM_CX - 48} ${PALM_CY + 10} ${PALM_CX - 40} ${PALM_CY + 40}`}
        stroke={SKIN.crease} strokeWidth="1.0" fill="none" strokeLinecap="round" />

      {/* Knuckle shadows at palm top */}
      {FINGER_CONFIGS.map((cfg) => (
        <ellipse key={cfg.name}
          cx={cfg.baseX}
          cy={PALM_TOP_Y + 4}
          rx={cfg.width / 2 - 1}
          ry={4}
          fill={SKIN.shadow}
          opacity="0.3"
        />
      ))}

      {/* ── Fingers ───────────────────────────────────────────── */}
      {fingers.map((phalanges, fi) => {
        const cfg = FINGER_CONFIGS[fi];
        const isError = errorSet.has(cfg.name);
        return (
          <g key={cfg.name}>
            {phalanges.map((seg, si) => (
              <SegmentPath
                key={si}
                {...seg}
                isError={isError}
                segIdx={si}
                fingerId={`f${fi}`}
              />
            ))}
          </g>
        );
      })}

      {/* Ambient highlight on palm centre */}
      <ellipse
        cx={PALM_CX - 8}
        cy={PALM_CY - 12}
        rx={24}
        ry={18}
        fill={SKIN.highlight}
        opacity="0.18"
      />
    </svg>
  );
}
