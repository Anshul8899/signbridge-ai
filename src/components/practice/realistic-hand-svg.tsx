"use client";

/**
 * RealisticHandSVG — v3
 *
 * Photorealistic human hand rendered as inline SVG.
 *
 * Technique:
 *  • Organic finger silhouettes built from cubic Bézier curves (no capsule sticks)
 *  • Subsurface-scatter skin illusion via layered radial + linear gradients + feBlend
 *  • Per-phalanx lighting: proximal darker, distal lit, specular highlight strip
 *  • Realistic nail: rounded rectangle with lunula and free-edge highlight
 *  • Inter-finger webbing via low quadratic curves
 *  • Knuckle bumps: raised ellipse + ambient-occlusion dark crease below
 *  • Soft drop-shadow on entire hand (feDropShadow)
 *  • Error fingers: warm red subsurface glow via feColorMatrix + feBlend
 *  • Wrist tilt via SVG transform on root group
 */

import { useMemo } from "react";

export interface RealisticHandSVGProps {
  /** Curl per finger [thumb, index, middle, ring, pinky] 0=extended 1=curled */
  curls: [number, number, number, number, number];
  /** Spread per finger 0=together 1=spread */
  spread: [number, number, number, number, number];
  /** Wrist tilt in degrees */
  wristTilt?: number;
  /** Fingers with errors — rendered with red glow */
  errorFingers?: string[];
  width?: number;
  height?: number;
  className?: string;
}

// ─── Skin palette ────────────────────────────────────────────────────────────
const S = {
  // Base warm skin — medium tone
  skin0:  "#f5cba7",   // highlight / lit surface
  skin1:  "#e8a87c",   // mid
  skin2:  "#d4845a",   // shadow
  skin3:  "#bf6b3d",   // deep crease / AO
  skin4:  "#a85530",   // darkest depth
  // Subsurface scatter — warm pink-red
  sss:    "rgba(220,100,80,0.18)",
  sssEdge:"rgba(190,70,50,0.28)",
  // Nail
  nailBase:"#f2c4b0",
  nailLit: "#fde8dc",
  nailAO:  "rgba(160,80,50,0.30)",
  // Specular
  spec:    "rgba(255,255,255,0.55)",
  specLow: "rgba(255,255,255,0.18)",
  // Palm
  palmHi:  "#f8d5b8",
  palmMid: "#e0a070",
  palmLow: "#c8784a",
  palmAO:  "rgba(120,50,20,0.22)",
  // Error (bad pose)
  errBase: "#ff5555",
  errGlow: "rgba(255,60,60,0.55)",
};

// ─── Geometry constants ───────────────────────────────────────────────────────
const VW = 300;   // SVG viewbox width
const VH = 380;   // SVG viewbox height

// Palm trapezoid — top narrower than bottom
const PALM_TOP_Y  = 185;
const PALM_BOT_Y  = 290;
const PALM_TOP_L  = 62;   // half-width at top
const PALM_TOP_R  = 62;
const PALM_BOT_L  = 72;   // half-width at bottom (wider)
const PALM_BOT_R  = 72;
const PALM_CX     = 150;  // palm centre x

// Wrist
const WRIST_TOP_Y = PALM_BOT_Y - 4;
const WRIST_BOT_Y = VH - 10;
const WRIST_HW    = 52;   // half-width

// Finger base x positions (measured from PALM_CX)
const FBASE_X = [-52, -26, 0, 26, 50] as const; // thumb … pinky offsets
const FBASE_Y = PALM_TOP_Y + 6;

// Finger anatomical lengths per segment [proximal, mid, distal] in px (extended)
const SEG_LENS: [number, number, number][] = [
  [40, 28, 22],   // thumb
  [56, 34, 26],   // index
  [62, 36, 28],   // middle
  [56, 34, 26],   // ring
  [38, 26, 20],   // pinky
];

// Finger widths [base, mid, tip]
const FWIDTHS: [number, number, number][] = [
  [22, 18, 14],   // thumb
  [18, 15, 12],   // index
  [19, 16, 13],   // middle
  [17, 14, 11],   // ring
  [14, 11,  9],   // pinky
];

const FINGER_NAMES = ["Thumb", "Index", "Middle", "Ring", "Pinky"];

// Max angle per segment when fully curled
const MAX_ANG: [number, number, number][] = [
  [70, 50, 40],   // thumb (thumb bends differently)
  [85, 75, 60],
  [85, 75, 60],
  [85, 75, 60],
  [80, 70, 55],
];

// Thumb base angle: it grows from the side of the palm, not the top
const THUMB_BASE_ANG = -55; // degrees — points up-left
const FINGER_BASE_ANG = -90; // degrees — straight up

function toR(d: number) { return (d * Math.PI) / 180; }

// ─── Per-finger geometry computation ─────────────────────────────────────────

interface Joint {
  x: number; y: number;
  angle: number;   // cumulative angle in radians at this joint
}

interface FingerGeo {
  joints: Joint[];   // 4 joints: base, p1end, p2end, tip
  segs: {            // 3 segments
    wBase: number; wTip: number;
    left:  [number, number, number, number, number, number]; // 3 ctrl points l side
    right: [number, number, number, number, number, number];
  }[];
  isThumb: boolean;
}

function buildFinger(
  fi: number,
  curl: number,
  spreadPx: number,
): FingerGeo {
  const baseX = PALM_CX + FBASE_X[fi] + spreadPx;
  const baseY = FBASE_Y;
  const isThumb = fi === 0;
  const baseAngDeg = isThumb ? THUMB_BASE_ANG : FINGER_BASE_ANG;
  const segsL = SEG_LENS[fi];
  const maxA  = MAX_ANG[fi];
  const widths = FWIDTHS[fi];

  // Joints
  const joints: Joint[] = [];
  let cx = baseX, cy = baseY;
  let ang = toR(baseAngDeg);
  joints.push({ x: cx, y: cy, angle: ang });

  for (let s = 0; s < 3; s++) {
    const segAng = toR(curl * maxA[s]);
    ang = ang + segAng;
    cx = cx + Math.cos(ang) * segsL[s];
    cy = cy + Math.sin(ang) * segsL[s];
    joints.push({ x: cx, y: cy, angle: ang });
  }

  // Build segment outlines — organic tapering capsule using cubic bezier
  const segs = [];
  for (let s = 0; s < 3; s++) {
    const j0 = joints[s];
    const j1 = joints[s + 1];
    const dx = j1.x - j0.x;
    const dy = j1.y - j0.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;  // normal (left side)
    const ny =  dx / len;
    const wB = (s === 0 ? widths[0] : s === 1 ? widths[1] : widths[2]) / 2;
    const wT = (s === 0 ? widths[1] : s === 1 ? widths[2] : widths[2] * 0.78) / 2;

    segs.push({
      wBase: wB * 2,
      wTip:  wT * 2,
      // left side: base-left → tip-left  (6 numbers: lx0,ly0,lx1,ly1,lx2,ly2)
      left: [
        j0.x + nx * wB, j0.y + ny * wB,
        j1.x + nx * wT * 1.08, j1.y + ny * wT * 1.08,
        j1.x + nx * wT, j1.y + ny * wT,
      ] as [number,number,number,number,number,number],
      right: [
        j0.x - nx * wB, j0.y - ny * wB,
        j1.x - nx * wT * 1.08, j1.y - ny * wT * 1.08,
        j1.x - nx * wT, j1.y - ny * wT,
      ] as [number,number,number,number,number,number],
    });
  }

  return { joints, segs, isThumb };
}

// ─── SVG helper — finger silhouette path ─────────────────────────────────────
function fingerOutlinePath(geo: FingerGeo): string {
  const parts: string[] = [];
  const s0 = geo.segs[0];
  const s1 = geo.segs[1];
  const s2 = geo.segs[2];
  const tip = geo.joints[3];

  // Start at base-left
  parts.push(`M ${s0.left[0].toFixed(1)} ${s0.left[1].toFixed(1)}`);

  // Left side — all 3 segments as smooth cubic bezier
  for (const seg of [s0, s1, s2]) {
    const [,, cx, cy, ex, ey] = seg.left;
    const [, , , , prevEx, prevEy] = seg === s0
      ? [0,0,0,0,seg.left[0],seg.left[1]]
      : (seg === s1 ? s0.left : s1.left);
    // Reflect previous cp for smooth join
    const rcx = 2 * prevEx - (seg === s0 ? seg.left[2] : seg === s1 ? s0.left[2] : s1.left[2]);
    const rcy = 2 * prevEy - (seg === s0 ? seg.left[3] : seg === s1 ? s0.left[3] : s1.left[3]);
    parts.push(`C ${rcx.toFixed(1)} ${rcy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  // Rounded fingertip arc
  const tipLeft  = [s2.left[4],  s2.left[5]];
  const tipRight = [s2.right[4], s2.right[5]];
  const tipRad   = (s2.wTip / 2) * 1.1;
  parts.push(`A ${tipRad.toFixed(1)} ${tipRad.toFixed(1)} 0 0 1 ${tipRight[0].toFixed(1)} ${tipRight[1].toFixed(1)}`);

  // Right side — reverse order
  for (const seg of [s2, s1, s0]) {
    const [,, cx, cy, ex, ey] = seg.right;
    const [, , , , prevEx, prevEy] = seg === s2
      ? [0,0,0,0,seg.right[0],seg.right[1]]
      : (seg === s1 ? s2.right : s1.right);
    const rcx = 2 * prevEx - (seg === s2 ? seg.right[2] : seg === s1 ? s2.right[2] : s1.right[2]);
    const rcy = 2 * prevEy - (seg === s2 ? seg.right[3] : seg === s1 ? s2.right[3] : s1.right[3]);
    parts.push(`C ${rcx.toFixed(1)} ${rcy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

// ─── Nail path ────────────────────────────────────────────────────────────────
function nailPath(geo: FingerGeo): { path: string; cx: number; cy: number; rx: number; ry: number } {
  const j2 = geo.joints[2];
  const j3 = geo.joints[3];
  const dx = j3.x - j2.x;
  const dy = j3.y - j2.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny =  dx / len;
  const seg = geo.segs[2];
  const hw  = seg.wTip / 2 * 0.72;
  const nailLen = len * 0.62;
  // nail starts 30% down distal segment
  const startT = 0.28;
  const sx = j2.x + dx * startT;
  const sy = j2.y + dy * startT;
  const ex = sx + dx / len * nailLen;
  const ey = sy + dy / len * nailLen;

  const p = [
    `M ${(sx + nx * hw).toFixed(1)} ${(sy + ny * hw).toFixed(1)}`,
    `L ${(ex + nx * hw).toFixed(1)} ${(ey + ny * hw).toFixed(1)}`,
    `A ${hw.toFixed(1)} ${hw.toFixed(1)} 0 0 1 ${(ex - nx * hw).toFixed(1)} ${(ey - ny * hw).toFixed(1)}`,
    `L ${(sx - nx * hw).toFixed(1)} ${(sy - ny * hw).toFixed(1)}`,
    `A ${hw.toFixed(1)} ${(hw * 0.55).toFixed(1)} 0 0 1 ${(sx + nx * hw).toFixed(1)} ${(sy + ny * hw).toFixed(1)}`,
    "Z",
  ].join(" ");

  return {
    path: p,
    cx: (sx + ex) / 2,
    cy: (sy + ey) / 2,
    rx: hw * 0.62,
    ry: nailLen * 0.22,
  };
}

// ─── Knuckle crease ──────────────────────────────────────────────────────────
function knucklePath(geo: FingerGeo, segIdx: number): string {
  const j = geo.joints[segIdx + 1];
  const seg = geo.segs[segIdx];
  const dx = geo.joints[segIdx + 1].x - geo.joints[segIdx].x;
  const dy = geo.joints[segIdx + 1].y - geo.joints[segIdx].y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny =  dx / len;
  const hw = (segIdx === 0 ? seg.wTip : seg.wTip) / 2 * 0.78;
  // slight curve toward tip
  const curve = len * 0.08;
  const mx = j.x - dx / len * curve;
  const my = j.y - dy / len * curve;
  return `M ${(j.x + nx * hw).toFixed(1)} ${(j.y + ny * hw).toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(j.x - nx * hw).toFixed(1)} ${(j.y - ny * hw).toFixed(1)}`;
}

// ─── Palm outline ─────────────────────────────────────────────────────────────
function palmPath(fingers: FingerGeo[]): string {
  // Left edge from wrist to thumb base
  const thumbBase = fingers[0].joints[0];
  const indexBase = fingers[1].joints[0];
  const pinkyBase = fingers[4].joints[0];

  const wristL = PALM_CX - WRIST_HW;
  const wristR = PALM_CX + WRIST_HW;

  // Web between thumb and index
  const webThumbX = (thumbBase.x + indexBase.x) / 2;
  const webThumbY = thumbBase.y + 14;

  return [
    `M ${wristL} ${WRIST_TOP_Y}`,
    // Left palm up to thumb base area
    `Q ${thumbBase.x - 22} ${PALM_TOP_Y + 22} ${thumbBase.x - 4} ${thumbBase.y + 4}`,
    // Webbing between thumb and index
    `Q ${webThumbX} ${webThumbY + 2} ${indexBase.x} ${indexBase.y + 2}`,
    // Top edge across all finger bases (gentle arc)
    `Q ${PALM_CX - 10} ${PALM_TOP_Y - 8} ${pinkyBase.x + 4} ${pinkyBase.y + 2}`,
    // Right palm edge down
    `Q ${PALM_CX + PALM_TOP_R + 14} ${PALM_TOP_Y + 30} ${wristR} ${WRIST_TOP_Y}`,
    // Bottom wrist
    `Q ${PALM_CX + WRIST_HW * 0.5} ${PALM_BOT_Y + 6} ${PALM_CX} ${PALM_BOT_Y + 8}`,
    `Q ${PALM_CX - WRIST_HW * 0.5} ${PALM_BOT_Y + 6} ${wristL} ${WRIST_TOP_Y}`,
    "Z",
  ].join(" ");
}

// ─── Wrist silhouette ─────────────────────────────────────────────────────────
function wristPath(): string {
  const tl = PALM_CX - WRIST_HW;
  const tr = PALM_CX + WRIST_HW;
  const narrowing = 6;
  return [
    `M ${tl} ${WRIST_TOP_Y}`,
    `Q ${PALM_CX} ${WRIST_TOP_Y + 8} ${tr} ${WRIST_TOP_Y}`,
    `Q ${tr + 4} ${(WRIST_TOP_Y + WRIST_BOT_Y) / 2} ${tr - narrowing} ${WRIST_BOT_Y}`,
    `Q ${PALM_CX} ${WRIST_BOT_Y + 6} ${tl + narrowing} ${WRIST_BOT_Y}`,
    `Q ${tl - 4} ${(WRIST_TOP_Y + WRIST_BOT_Y) / 2} ${tl} ${WRIST_TOP_Y}`,
    "Z",
  ].join(" ");
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RealisticHandSVG({
  curls,
  spread,
  wristTilt = 0,
  errorFingers = [],
  width  = 280,
  height = 340,
  className,
}: RealisticHandSVGProps) {
  const errSet = new Set(errorFingers);
  const curlKey  = curls.join(",");
  const sprKey   = spread.join(",");
  const errKey   = errorFingers.join(",");

  const fingers = useMemo<FingerGeo[]>(() => {
    return [0, 1, 2, 3, 4].map((fi) => {
      // spread: positive = outward from center
      const dir = fi <= 2 ? -1 : 1; // left-of-center fingers spread left, right spread right
      const spreadPx = spread[fi] * 16 * (fi === 0 ? 1.8 : 1) * dir;
      return buildFinger(fi, curls[fi], spreadPx);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curlKey, sprKey]);

  const allGeos = fingers;
  const palm  = useMemo(() => palmPath(allGeos),  [curlKey, sprKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const wrist = useMemo(() => wristPath(),         []);

  const uid = "rh"; // stable prefix for gradient IDs (single instance per page)

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible", transform: `rotate(${wristTilt}deg)`, transformOrigin: "50% 80%" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* ── Skin subsurface radial (palm highlight) */}
        <radialGradient id={`${uid}-palm-rg`} cx="42%" cy="36%" r="58%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor={S.palmHi}  />
          <stop offset="38%"  stopColor={S.skin1}   />
          <stop offset="78%"  stopColor={S.palmMid} />
          <stop offset="100%" stopColor={S.palmLow} />
        </radialGradient>

        {/* ── Wrist gradient */}
        <linearGradient id={`${uid}-wrist-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={S.skin1}   />
          <stop offset="55%"  stopColor={S.skin2}   />
          <stop offset="100%" stopColor={S.skin3}   />
        </linearGradient>

        {/* ── Finger skin gradient — vertical, lit from upper-left */}
        <linearGradient id={`${uid}-fing-g`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={S.skin0}   />
          <stop offset="28%"  stopColor={S.skin1}   />
          <stop offset="65%"  stopColor={S.skin2}   />
          <stop offset="100%" stopColor={S.skin3}   />
        </linearGradient>

        {/* ── Error finger fill */}
        <linearGradient id={`${uid}-err-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#ff8888"  />
          <stop offset="50%"  stopColor="#ff4444"  />
          <stop offset="100%" stopColor="#cc2222"  />
        </linearGradient>

        {/* ── Specular highlight */}
        <linearGradient id={`${uid}-spec`} x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%"   stopColor={S.spec}    />
          <stop offset="60%"  stopColor={S.specLow} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"  />
        </linearGradient>

        {/* ── Nail gradient */}
        <linearGradient id={`${uid}-nail`} x1="0%" y1="0%" x2="30%" y2="100%">
          <stop offset="0%"   stopColor={S.nailLit}  />
          <stop offset="45%"  stopColor={S.nailBase} />
          <stop offset="100%" stopColor={S.nailAO}   />
        </linearGradient>

        {/* ── Whole-hand soft shadow */}
        <filter id={`${uid}-shadow`} x="-18%" y="-8%" width="136%" height="124%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor={S.skin4} floodOpacity="0.45" />
        </filter>

        {/* ── SSS edge light on fingers */}
        <filter id={`${uid}-sss`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* ── Error glow */}
        <filter id={`${uid}-errGlow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ff4040" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* ── Whole-hand shadow layer (render first, underneath) */}
      <g filter={`url(#${uid}-shadow)`} opacity="1">
        <path d={wrist} fill={S.skin3} />
        <path d={palm}  fill={S.skin2} />
        {allGeos.map((geo, fi) => (
          <path key={fi} d={fingerOutlinePath(geo)} fill={S.skin2} />
        ))}
      </g>

      {/* ── Wrist */}
      <path d={wrist} fill={`url(#${uid}-wrist-g)`} />
      {/* Wrist crease lines */}
      {[0, 9].map((offset) => (
        <line key={offset}
          x1={PALM_CX - WRIST_HW + 8}  y1={WRIST_TOP_Y + offset + 12}
          x2={PALM_CX + WRIST_HW - 8}  y2={WRIST_TOP_Y + offset + 12}
          stroke={S.skin3} strokeWidth="1.1" strokeLinecap="round" opacity="0.55"
        />
      ))}

      {/* ── Palm */}
      <path d={palm} fill={`url(#${uid}-palm-rg)`} />
      {/* Palm crease lines */}
      <path
        d={`M ${PALM_CX - 46} ${PALM_TOP_Y + 42} Q ${PALM_CX + 4} ${PALM_TOP_Y + 30} ${PALM_CX + 48} ${PALM_TOP_Y + 38}`}
        fill="none" stroke={S.skin3} strokeWidth="1.4" strokeLinecap="round" opacity="0.50"
      />
      <path
        d={`M ${PALM_CX - 40} ${PALM_TOP_Y + 64} Q ${PALM_CX - 6} ${PALM_TOP_Y + 56} ${PALM_CX + 38} ${PALM_TOP_Y + 60}`}
        fill="none" stroke={S.skin3} strokeWidth="1.1" strokeLinecap="round" opacity="0.40"
      />
      <path
        d={`M ${PALM_CX - 30} ${PALM_TOP_Y + 20} Q ${PALM_CX - 50} ${PALM_TOP_Y + 58} ${PALM_CX - 44} ${PALM_TOP_Y + 90}`}
        fill="none" stroke={S.skin3} strokeWidth="1.0" strokeLinecap="round" opacity="0.35"
      />
      {/* Palm SSS highlight (centre glow) */}
      <ellipse
        cx={PALM_CX - 6} cy={PALM_TOP_Y + 44}
        rx={30} ry={22}
        fill={S.sss} opacity="0.9"
      />

      {/* ── Fingers */}
      {allGeos.map((geo, fi) => {
        const isErr = errSet.has(FINGER_NAMES[fi]);
        const outline = fingerOutlinePath(geo);
        const nail    = nailPath(geo);

        return (
          <g key={fi} filter={isErr ? `url(#${uid}-errGlow)` : undefined}>
            {/* Base fill — skin gradient */}
            <path
              d={outline}
              fill={isErr ? `url(#${uid}-err-g)` : `url(#${uid}-fing-g)`}
            />

            {/* SSS edge — subsurface scatter rim light */}
            {!isErr && (
              <path
                d={outline}
                fill="none"
                stroke={S.sssEdge}
                strokeWidth="3.5"
                opacity="0.45"
                filter={`url(#${uid}-sss)`}
              />
            )}

            {/* Specular highlight strip (left-of-centre, upper portion) */}
            {!isErr && geo.joints.length > 1 && (() => {
              const j0 = geo.joints[0];
              const j1 = geo.joints[1];
              const dx = j1.x - j0.x;
              const dy = j1.y - j0.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const nx = -dy / len;
              const ny =  dx / len;
              const hw = geo.segs[0].wBase / 2;
              const specW = hw * 0.28;
              const specX = j0.x + nx * hw * 0.45;
              const specY = j0.y + ny * hw * 0.45;
              const specExX = j1.x + nx * hw * 0.38;
              const specExY = j1.y + ny * hw * 0.38;
              return (
                <path
                  d={`M ${(specX + nx * specW).toFixed(1)} ${(specY + ny * specW).toFixed(1)}
                      L ${(specExX + nx * specW * 0.7).toFixed(1)} ${(specExY + ny * specW * 0.7).toFixed(1)}
                      L ${(specExX - nx * specW * 0.7).toFixed(1)} ${(specExY - ny * specW * 0.7).toFixed(1)}
                      L ${(specX - nx * specW).toFixed(1)} ${(specY - ny * specW).toFixed(1)} Z`}
                  fill={`url(#${uid}-spec)`}
                  opacity="0.55"
                />
              );
            })()}

            {/* Knuckle creases — AO shadow at each joint */}
            {[0, 1].map((si) => (
              <path
                key={si}
                d={knucklePath(geo, si)}
                fill="none"
                stroke={isErr ? "rgba(120,0,0,0.4)" : S.skin3}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.60"
              />
            ))}
            {/* Knuckle AO ellipse highlight */}
            {[1, 2].map((ji) => {
              const j = geo.joints[ji];
              return (
                <ellipse
                  key={ji}
                  cx={j.x} cy={j.y}
                  rx={geo.segs[ji - 1].wTip / 2 * 0.72}
                  ry={3.5}
                  fill={S.skin0}
                  opacity="0.28"
                  transform={`rotate(${(geo.joints[ji].angle * 180 / Math.PI) + 90} ${j.x} ${j.y})`}
                />
              );
            })}

            {/* Nail */}
            {!isErr && (() => {
              const n = nailPath(geo);
              return (
                <>
                  {/* Nail AO shadow under nail */}
                  <path d={n.path} fill={S.nailAO} transform={`translate(0 1.5)`} opacity="0.55" />
                  {/* Nail body */}
                  <path d={n.path} fill={`url(#${uid}-nail)`} opacity="0.90" />
                  {/* Nail lunula — white crescent near base */}
                  <ellipse
                    cx={n.cx - (geo.joints[3].x - geo.joints[2].x) * 0.18}
                    cy={n.cy - (geo.joints[3].y - geo.joints[2].y) * 0.18}
                    rx={n.rx * 0.72}
                    ry={n.ry * 0.80}
                    fill="rgba(255,250,245,0.58)"
                  />
                  {/* Nail specular */}
                  <ellipse
                    cx={n.cx + (geo.joints[3].x - geo.joints[2].x) * 0.05}
                    cy={n.cy - (geo.joints[3].y - geo.joints[2].y) * 0.12}
                    rx={n.rx * 0.38}
                    ry={n.ry * 0.45}
                    fill="rgba(255,255,255,0.42)"
                  />
                </>
              );
            })()}
          </g>
        );
      })}

      {/* ── Inter-finger webbing (subtle depth between base of each pair) */}
      {[0,1,2,3].map((fi) => {
        const gA = allGeos[fi];
        const gB = allGeos[fi + 1];
        if (!gA || !gB) return null;
        const ax = gA.joints[0].x, ay = gA.joints[0].y;
        const bx = gB.joints[0].x, by = gB.joints[0].y;
        const mx = (ax + bx) / 2, my = (ay + by) / 2 + (fi === 0 ? 10 : 6);
        return (
          <path
            key={fi}
            d={`M ${ax.toFixed(1)} ${(ay + 2).toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${(by + 2).toFixed(1)}`}
            fill="none"
            stroke={S.skin2}
            strokeWidth={fi === 0 ? 5 : 4}
            strokeLinecap="round"
            opacity="0.45"
          />
        );
      })}

      {/* ── Top ambient occlusion — slight darkening where fingers meet palm */}
      {allGeos.map((geo, fi) => {
        const j = geo.joints[0];
        return (
          <ellipse
            key={fi}
            cx={j.x} cy={j.y + 3}
            rx={geo.segs[0].wBase / 2 * 0.82}
            ry={5}
            fill={S.palmAO}
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}
