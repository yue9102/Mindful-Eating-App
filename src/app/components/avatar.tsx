import { motion } from "motion/react";
import { useState, useEffect } from "react";
import type { AvatarConfig } from "./store";

// Pixel grid helper - each "pixel" is a small rect
function Px({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) {
  return <rect x={x * 4} y={y * 4} width={4 * s} height={4} fill={c} />;
}

// Helper function to adjust color brightness
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Hair style renderers with enhanced shading and highlights
function HairLong({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {/* Top hair with highlights */}
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={2} c={x === 7 || x === 9 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t2${x}`} x={x} y={3} c={x === 8 ? highlight : color} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`t3${x}`} x={x} y={4} c={color} />)}
      {/* Side hair with shadow */}
      {[3,4,12,13].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 3 ? shadow : color} />)}
      {[3,4,12,13].map(x => <Px key={`s2${x}`} x={x} y={6} c={x === 3 ? shadow : color} />)}
      {[3,12,13].map(x => <Px key={`s3${x}`} x={x} y={7} c={x === 3 ? shadow : color} />)}
      {/* Long sides */}
      {[3,13].map(x => [8,9,10,11,12,13,14,15,16].map(y => <Px key={`l${x}${y}`} x={x} y={y} c={x === 3 ? shadow : color} />))}
      {[2,14].map(x => [10,11,12,13,14,15].map(y => <Px key={`ll${x}${y}`} x={x} y={y} c={x === 2 ? shadow : color} />))}
      {/* Hair tips highlight */}
      <Px x={2} y={15} c={highlight} />
      <Px x={14} y={15} c={highlight} />
    </g>
  );
}

function HairBob({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={2} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t2${x}`} x={x} y={3} c={x === 7 || x === 9 ? highlight : color} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`t3${x}`} x={x} y={4} c={color} />)}
      {[3,4,12,13].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 3 ? shadow : color} />)}
      {[3,4,12,13].map(x => <Px key={`s2${x}`} x={x} y={6} c={x === 3 ? shadow : color} />)}
      {[3,13].map(x => [7,8,9,10].map(y => <Px key={`b${x}${y}`} x={x} y={y} c={x === 3 ? shadow : color} />))}
      {[2,14].map(x => [8,9].map(y => <Px key={`bb${x}${y}`} x={x} y={y} c={shadow} />))}
      {/* Bob curve highlights */}
      <Px x={4} y={9} c={highlight} />
      <Px x={12} y={9} c={highlight} />
    </g>
  );
}

function HairPonytail({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={2} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t2${x}`} x={x} y={3} c={x === 8 ? highlight : color} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`t3${x}`} x={x} y={4} c={color} />)}
      {[3,4,12,13].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 3 ? shadow : color} />)}
      {/* Ponytail on right with volume */}
      {[13,14].map(x => [5,6,7,8,9,10,11,12].map(y => <Px key={`p${x}${y}`} x={x} y={y} c={x === 14 && (y === 7 || y === 10) ? highlight : color} />))}
      {[14,15].map(x => [7,8,9,10,11,12,13].map(y => <Px key={`pp${x}${y}`} x={x} y={y} c={x === 15 ? shadow : color} />))}
      {/* Ponytail band */}
      <Px x={13} y={5} c="#E88B9E" />
      <Px x={14} y={5} c="#E88B9E" />
    </g>
  );
}

function HairShort({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {[6,7,8,9,10].map(x => <Px key={`t${x}`} x={x} y={2} c={x === 8 ? highlight : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`t2${x}`} x={x} y={3} c={x === 7 || x === 9 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t3${x}`} x={x} y={4} c={color} />)}
      {[4,5,11,12].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 4 ? shadow : (x === 11 ? highlight : color)} />)}
      {/* Short bangs */}
      <Px x={7} y={5} c={highlight} />
      <Px x={9} y={5} c={highlight} />
    </g>
  );
}

function HairBuns({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={3} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t2${x}`} x={x} y={4} c={color} />)}
      {[4,5,11,12].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 4 ? shadow : color} />)}
      {/* Left bun with depth */}
      {[2,3,4].map(x => [1,2,3].map(y => <Px key={`lb${x}${y}`} x={x} y={y} c={x === 2 ? shadow : (x === 4 && y === 2 ? highlight : color)} />))}
      {/* Right bun with depth */}
      {[12,13,14].map(x => [1,2,3].map(y => <Px key={`rb${x}${y}`} x={x} y={y} c={x === 14 ? shadow : (x === 12 && y === 2 ? highlight : color)} />))}
    </g>
  );
}

function HairWavy({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 25);
  return (
    <g>
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={2} c={x === 7 || x === 9 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`t2${x}`} x={x} y={3} c={x === 8 ? highlight : color} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`t3${x}`} x={x} y={4} c={color} />)}
      {[3,4,12,13].map(x => <Px key={`s${x}`} x={x} y={5} c={x === 3 ? shadow : color} />)}
      {[3,4,12,13].map(x => <Px key={`s2${x}`} x={x} y={6} c={x === 3 ? shadow : color} />)}
      {/* Wavy sides with highlights */}
      {[2,3].map(x => [7,8,9,10,11,12,13].map(y => <Px key={`wl${x}${y}`} x={x} y={y} c={x === 3 && (y === 8 || y === 11) ? highlight : (x === 2 ? shadow : color)} />))}
      {[13,14].map(x => [7,8,9,10,11,12,13].map(y => <Px key={`wr${x}${y}`} x={x} y={y} c={x === 13 && (y === 8 || y === 11) ? highlight : (x === 14 ? shadow : color)} />))}
      {/* Wavy tips */}
      <Px x={1} y={11} c={highlight} /><Px x={1} y={13} c={shadow} />
      <Px x={15} y={11} c={highlight} /><Px x={15} y={13} c={shadow} />
    </g>
  );
}

const HAIR_RENDERERS = [HairLong, HairBob, HairPonytail, HairShort, HairBuns, HairWavy];

// Outfit renderers with enhanced details and shading
function OutfitBasic({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 20);
  return (
    <g>
      {[5,6,7,8,9,10,11].map(x => <Px key={`o${x}`} x={x} y={12} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o3${x}`} x={x} y={14} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o5${x}`} x={x} y={16} c={color} />)}
      {/* Center highlight */}
      <Px x={8} y={14} c={highlight} />
    </g>
  );
}

function OutfitDress({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 20);
  const skirtLight = adjustBrightness(color, 35);
  return (
    <g>
      {/* Top part */}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o${x}`} x={x} y={12} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 4 || x === 12) ? shadow : color} />)}
      {/* Skirt with gradient */}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`o3${x}`} x={x} y={14} c={x === 8 ? highlight : (x === 3 || x === 13 ? shadow : skirtLight)} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 3 || x === 13) ? shadow : skirtLight} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o5${x}`} x={x} y={16} c={skirtLight} />)}
      {/* Belt detail */}
      {[6,7,8,9,10].map(x => <Px key={`b${x}`} x={x} y={13} c="#FFFFFF55" />)}
    </g>
  );
}

function OutfitSweater({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 20);
  return (
    <g>
      {/* Collar */}
      {[7,8,9].map(x => <Px key={`c${x}`} x={x} y={11} c={highlight} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o${x}`} x={x} y={12} c={x === 8 ? highlight : color} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 3 || x === 13) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o3${x}`} x={x} y={14} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o5${x}`} x={x} y={16} c={color} />)}
      {/* Knit pattern */}
      {[6,8,10].map(x => <Px key={`s${x}`} x={x} y={14} c="#FFFFFF22" />)}
      {[7,9].map(x => <Px key={`s2${x}`} x={x} y={15} c="#FFFFFF22" />)}
    </g>
  );
}

function OutfitBlazer({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 20);
  return (
    <g>
      {/* White inner shirt */}
      {[7,8,9].map(x => <Px key={`i${x}`} x={x} y={12} c="#F5F0EB" />)}
      {[5,6,10,11].map(x => <Px key={`o${x}`} x={x} y={12} c={x === 5 ? shadow : (x === 11 ? highlight : color)} />)}
      {[4,5,6,10,11,12].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[7,8,9].map(x => <Px key={`i2${x}`} x={x} y={13} c="#F5F0EB" />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o3${x}`} x={x} y={14} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o5${x}`} x={x} y={16} c={color} />)}
      {/* Collar lines */}
      <line x1={28} y1={48} x2={32} y2={52} stroke="#00000022" strokeWidth={0.8} />
      <line x1={36} y1={48} x2={32} y2={52} stroke="#00000022" strokeWidth={0.8} />
      {/* Buttons */}
      <circle cx={32} cy={56} r={1.2} fill="#FFFFFFAA" stroke="#00000033" strokeWidth={0.5} />
      <circle cx={32} cy={60} r={1.2} fill="#FFFFFFAA" stroke="#00000033" strokeWidth={0.5} />
    </g>
  );
}

function OutfitOveralls({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  return (
    <g>
      {/* White tee */}
      {[5,6,7,8,9,10,11].map(x => <Px key={`t${x}`} x={x} y={12} c="#F5F0EB" />)}
      {/* Overalls straps */}
      {[5,6,10,11].map(x => <Px key={`s${x}`} x={x} y={12} c={color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o3${x}`} x={x} y={14} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o5${x}`} x={x} y={16} c={color} />)}
      {/* Pocket detail */}
      <rect x={26} y={56} width={5} height={5} rx={0.5} fill="none" stroke="#00000033" strokeWidth={0.5} />
      <rect x={33} y={56} width={5} height={5} rx={0.5} fill="none" stroke="#00000033" strokeWidth={0.5} />
      {/* Buttons */}
      <circle cx={24} cy={50} r={1.5} fill="#D4AA6A" stroke="#00000033" strokeWidth={0.5} />
      <circle cx={40} cy={50} r={1.5} fill="#D4AA6A" stroke="#00000033" strokeWidth={0.5} />
    </g>
  );
}

function OutfitTurtleneck({ color }: { color: string }) {
  const shadow = adjustBrightness(color, -25);
  const highlight = adjustBrightness(color, 20);
  return (
    <g>
      {/* High neck */}
      {[7,8,9].map(x => <Px key={`c1${x}`} x={x} y={10} c={color} />)}
      {[6,7,8,9,10].map(x => <Px key={`c2${x}`} x={x} y={11} c={x === 8 ? highlight : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o${x}`} x={x} y={12} c={x === 8 ? highlight : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o2${x}`} x={x} y={13} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o3${x}`} x={x} y={14} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`o4${x}`} x={x} y={15} c={(x === 4 || x === 12) ? shadow : color} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`o5${x}`} x={x} y={16} c={color} />)}
      {/* Ribbed texture */}
      <line x1={24} y1={52} x2={24} y2={64} stroke="#00000008" strokeWidth={0.5} />
      <line x1={32} y1={52} x2={32} y2={64} stroke="#00000008" strokeWidth={0.5} />
      <line x1={40} y1={52} x2={40} y2={64} stroke="#00000008" strokeWidth={0.5} />
    </g>
  );
}

const OUTFIT_RENDERERS = [OutfitBasic, OutfitDress, OutfitSweater, OutfitBlazer, OutfitOveralls, OutfitTurtleneck];

// Accessory renderers with improved details
function AccessoryNone() { return null; }

function AccessoryGlasses() {
  return (
    <g>
      {/* Left lens */}
      <rect x={18} y={26} width={10} height={7} rx={2} fill="#FFFFFF08" stroke="#2D2926" strokeWidth={1.3} />
      {/* Right lens */}
      <rect x={36} y={26} width={10} height={7} rx={2} fill="#FFFFFF08" stroke="#2D2926" strokeWidth={1.3} />
      {/* Bridge */}
      <line x1={28} y1={29.5} x2={36} y2={29.5} stroke="#2D2926" strokeWidth={1.3} />
      {/* Lens glare effect */}
      <rect x={20} y={27} width={4} height={2.5} rx={0.5} fill="#FFFFFFAA" />
      <rect x={38} y={27} width={4} height={2.5} rx={0.5} fill="#FFFFFFAA" />
      <circle cx={22} cy={28.5} r={0.8} fill="#FFFFFF" />
      <circle cx={40} cy={28.5} r={0.8} fill="#FFFFFF" />
    </g>
  );
}

function AccessoryBow({ color }: { color?: string }) {
  const c = color || "#E88B9E";
  const shadow = adjustBrightness(c, -20);
  const highlight = adjustBrightness(c, 25);
  return (
    <g>
      {/* Left bow part */}
      <Px x={10} y={3} c={c} />
      <Px x={11} y={3} c={c} />
      <Px x={11} y={2} c={highlight} />
      <Px x={11} y={4} c={shadow} />
      {/* Center knot */}
      <Px x={12} y={2} c={shadow} />
      <Px x={12} y={3} c={c} />
      <Px x={12} y={4} c={shadow} />
      {/* Right bow part */}
      <Px x={13} y={3} c={c} />
      <Px x={13} y={2} c={highlight} />
      <Px x={13} y={4} c={shadow} />
      <Px x={14} y={3} c={c} />
      {/* Sparkle effect */}
      <circle cx={48} cy={10} r={0.8} fill="#FFFFFF88" />
    </g>
  );
}

function AccessoryEarring() {
  return (
    <g>
      {/* Left earring - gold with shine */}
      <circle cx={14} cy={40} r={3} fill="#D4AA6A" stroke="#00000022" strokeWidth={0.6} />
      <circle cx={14} cy={40} r={1.2} fill="#FFEB99" />
      <circle cx={13.2} cy={39.2} r={0.6} fill="#FFFFFF" />
      {/* Right earring */}
      <circle cx={50} cy={40} r={3} fill="#D4AA6A" stroke="#00000022" strokeWidth={0.6} />
      <circle cx={50} cy={40} r={1.2} fill="#FFEB99" />
      <circle cx={49.2} cy={39.2} r={0.6} fill="#FFFFFF" />
    </g>
  );
}

function AccessoryHat({ color }: { color?: string }) {
  const c = color || "#F5E6D0";
  const shadow = adjustBrightness(c, -20);
  const highlight = adjustBrightness(c, 20);
  return (
    <g>
      {/* Hat crown with shading */}
      {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`h${x}`} x={x} y={2} c={x === 8 ? highlight : (x === 4 || x === 12 ? shadow : c)} />)}
      {[3,4,5,6,7,8,9,10,11,12,13].map(x => <Px key={`h2${x}`} x={x} y={3} c={(x === 3 || x === 13) ? shadow : (x === 8 ? highlight : c)} />)}
      {[5,6,7,8,9,10,11].map(x => <Px key={`h3${x}`} x={x} y={4} c={x === 8 ? highlight : c} />)}
      {/* Brim with shadow */}
      {[5,6,7,8,9,10,11].map(x => <Px key={`b${x}`} x={x} y={5} c={shadow} />)}
      {/* Hat band */}
      <rect x={20} y={14} width={24} height={3} fill="#C4856C" />
      <rect x={20} y={14} width={24} height={1} fill="#D09B83" />
    </g>
  );
}

const ACCESSORY_RENDERERS = [AccessoryNone, AccessoryGlasses, AccessoryBow, AccessoryEarring, AccessoryHat];

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  isEating?: boolean;
  specialAction?: "drink" | "happy" | "idle" | null;
  showCard?: boolean;
}

export function Avatar({
  config,
  size = 120,
  isEating = false,
  specialAction = null,
  showCard = false,
}: AvatarProps) {
  const [eyeState, setEyeState] = useState<"open" | "closed" | "happy">("open");
  const [mouthPhase, setMouthPhase] = useState(0);
  const [armPhase, setArmPhase] = useState(0);
  const [chewPuff, setChewPuff] = useState(false);

  // Fallback config if undefined
  const safeConfig: AvatarConfig = config ?? {
    hairStyle: 0,
    hairColor: "#5C3A1E",
    skinTone: "#F5D5C0",
    outfitStyle: 0,
    outfitColor: "#C4856C",
    accessory: 0,
    bgColor: "#B8C9E8",
  };

  // Blink
  useEffect(() => {
    const blink = () => {
      setEyeState("closed");
      setTimeout(() => setEyeState(specialAction === "happy" ? "happy" : "open"), 180);
    };
    const interval = setInterval(blink, 3500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [specialAction]);

  // Eating mouth animation - 6 phases for smoother chewing
  useEffect(() => {
    if (!isEating) { setMouthPhase(0); setArmPhase(0); setChewPuff(false); return; }
    const interval = setInterval(() => {
      setMouthPhase(p => (p + 1) % 6);
    }, 220);
    return () => clearInterval(interval);
  }, [isEating]);

  // Arm animation for eating (chopstick movement)
  useEffect(() => {
    if (!isEating) return;
    const interval = setInterval(() => {
      setArmPhase(p => (p + 1) % 8);
    }, 350);
    return () => clearInterval(interval);
  }, [isEating]);

  // Cheek puff cycle
  useEffect(() => {
    if (!isEating) return;
    const interval = setInterval(() => {
      setChewPuff(true);
      setTimeout(() => setChewPuff(false), 600);
    }, 1800);
    return () => clearInterval(interval);
  }, [isEating]);

  // If uploaded image, show that instead
  if (safeConfig.uploadedImage) {
    return (
      <div
        className="relative overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: showCard ? 12 : "50%",
          border: showCard ? `3px solid ${safeConfig.bgColor}` : "none",
        }}
      >
        <img
          src={safeConfig.uploadedImage}
          alt="avatar"
          className="w-full h-full object-cover"
          style={{ imageRendering: "auto" }}
        />
        {isEating && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 flex justify-center pb-1"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <span style={{ fontSize: size * 0.15 }}>🍽</span>
          </motion.div>
        )}
      </div>
    );
  }

  const HairComponent = HAIR_RENDERERS[safeConfig.hairStyle % HAIR_RENDERERS.length];
  const OutfitComponent = OUTFIT_RENDERERS[safeConfig.outfitStyle % OUTFIT_RENDERERS.length];
  const AccessoryComponent = ACCESSORY_RENDERERS[safeConfig.accessory % ACCESSORY_RENDERERS.length];

  // Enhanced chewing mouth rendering with 6 phases
  const renderMouth = () => {
    if (isEating) {
      switch (mouthPhase) {
        case 0: // closed
          return (
            <>
              <Px x={7} y={9} c="#2D2926" />
              <Px x={8} y={9} c="#2D2926" />
              <Px x={9} y={9} c="#2D2926" />
            </>
          );
        case 1: // open wide - bite
          return (
            <>
              <Px x={7} y={9} c="#2D2926" />
              <Px x={8} y={9} c="#2D2926" />
              <Px x={9} y={9} c="#2D2926" />
              <Px x={7} y={10} c="#2D2926" />
              <Px x={8} y={10} c="#C95D5D" />
              <Px x={9} y={10} c="#2D2926" />
            </>
          );
        case 2: // chew left
          return (
            <>
              <Px x={6} y={9} c="#2D2926" />
              <Px x={7} y={9} c="#C95D5D" />
              <Px x={8} y={9} c="#2D2926" />
            </>
          );
        case 3: // chew right
          return (
            <>
              <Px x={8} y={9} c="#2D2926" />
              <Px x={9} y={9} c="#C95D5D" />
              <Px x={10} y={9} c="#2D2926" />
            </>
          );
        case 4: // chew small
          return (
            <>
              <Px x={7} y={9} c="#2D2926" />
              <Px x={8} y={9} c="#C95D5D" />
              <Px x={9} y={9} c="#2D2926" />
            </>
          );
        case 5: // swallow
          return (
            <>
              <Px x={7} y={9} c="#2D2926" />
              <Px x={8} y={9} c="#2D2926" />
              <Px x={9} y={9} c="#2D2926" />
            </>
          );
        default:
          return <Px x={8} y={9} c="#2D2926" />;
      }
    }
    if (specialAction === "drink") {
      return (
        <>
          <Px x={8} y={9} c="#2D2926" />
          <circle cx={33} cy={38} r={1.5} fill="none" stroke="#2D2926" strokeWidth={0.8} />
        </>
      );
    }
    // Default smile
    return (
      <>
        <Px x={7} y={9} c="#2D2926" />
        <Px x={8} y={9} c="#2D2926" />
        <Px x={9} y={9} c="#2D2926" />
      </>
    );
  };

  // Enhanced arm with chopsticks animation
  const renderArm = () => {
    if (!isEating) return null;
    const isRaised = armPhase >= 3 && armPhase <= 5;
    const chopstickColor = "#8B7355";
    const foodColor = "#94B8A0";

    if (isRaised) {
      return (
        <g>
          {/* Right arm raised */}
          <Px x={12} y={11} c={safeConfig.skinTone} />
          <Px x={13} y={10} c={safeConfig.skinTone} />
          {/* Chopsticks with better positioning */}
          <line x1={53} y1={38} x2={46} y2={34} stroke={chopstickColor} strokeWidth={1.2} />
          <line x1={54} y1={40} x2={47} y2={35} stroke={chopstickColor} strokeWidth={1.2} />
          {/* Food morsel with highlight */}
          <circle cx={45} cy={33} r={2} fill={foodColor} />
          <circle cx={44.5} cy={32.5} r={0.6} fill="#FFFFFF66" />
        </g>
      );
    }
    return (
      <g>
        {/* Right arm down */}
        <Px x={12} y={12} c={safeConfig.skinTone} />
        <Px x={13} y={13} c={safeConfig.skinTone} />
        {/* Chopsticks resting */}
        <line x1={54} y1={52} x2={50} y2={48} stroke={chopstickColor} strokeWidth={1.2} />
        <line x1={55} y1={53} x2={51} y2={49} stroke={chopstickColor} strokeWidth={1.2} />
      </g>
    );
  };

  // Enhanced drinking arm
  const renderDrinkArm = () => {
    if (specialAction !== "drink") return null;
    return (
      <g>
        <Px x={12} y={11} c={safeConfig.skinTone} />
        <Px x={13} y={10} c={safeConfig.skinTone} />
        {/* Cup with gradient */}
        <rect x={49} y={35} width={7} height={9} rx={1.5} fill="#7EB5C4" opacity={0.85} stroke="#5A9AAA" strokeWidth={0.8} />
        <rect x={49} y={35} width={7} height={3} rx={1} fill="#B8DCE8" opacity={0.6} />
        {/* Cup shine */}
        <rect x={50} y={36} width={2} height={3} rx={0.5} fill="#FFFFFF44" />
      </g>
    );
  };

  const pixelChar = (
    <svg
      viewBox="0 0 68 72"
      width={size}
      height={size * (72/68)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Background for card mode */}
      {showCard && (
        <>
          <rect x={0} y={0} width={68} height={72} rx={4} fill={safeConfig.bgColor} />
          <rect x={2} y={4} width={64} height={64} rx={3} fill={safeConfig.bgColor} stroke="#FFFFFF33" strokeWidth={1} />
          {/* Heart decoration */}
          <g transform="translate(29, 0)">
            <Px x={0} y={0} c="#E88B9E" />
            <Px x={1} y={0} c="#E88B9E" />
            <rect x={4} y={0} width={4} height={4} fill="#E88B9E" />
            <rect x={0} y={0} width={12} height={4} rx={2} fill="#E88B9E" />
          </g>
        </>
      )}

      <g transform={showCard ? "translate(2, 6)" : "translate(0, 2)"}>
        {/* Face outline - black border for definition */}
        <ellipse cx={32} cy={30} rx={18} ry={16} fill="none" stroke="#00000018" strokeWidth={0.5} />
        
        {/* Face/head with enhanced shading */}
        {[5,6,7,8,9,10,11].map(x => <Px key={`f1${x}`} x={x} y={5} c={safeConfig.skinTone} />)}
        {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`f2${x}`} x={x} y={6} c={safeConfig.skinTone} />)}
        {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`f3${x}`} x={x} y={7} c={safeConfig.skinTone} />)}
        {[4,5,6,7,8,9,10,11,12].map(x => <Px key={`f4${x}`} x={x} y={8} c={safeConfig.skinTone} />)}
        {[5,6,7,8,9,10,11].map(x => <Px key={`f5${x}`} x={x} y={9} c={safeConfig.skinTone} />)}
        {[6,7,8,9,10].map(x => <Px key={`f6${x}`} x={x} y={10} c={safeConfig.skinTone} />)}
        
        {/* Neck */}
        {[7,8,9].map(x => <Px key={`n${x}`} x={x} y={11} c={safeConfig.skinTone} />)}

        {/* Simplified cute eyes - Q version style */}
        {eyeState === "open" ? (
          <>
            {/* Left eye - simple dark dot */}
            <circle cx={26} cy={29} r={2.5} fill="#2D2926" />
            {/* Right eye - simple dark dot */}
            <circle cx={38} cy={29} r={2.5} fill="#2D2926" />
            {/* Tiny white shine for life */}
            <circle cx={27} cy={28} r={0.9} fill="white" />
            <circle cx={39} cy={28} r={0.9} fill="white" />
          </>
        ) : eyeState === "closed" ? (
          <>
            {/* Closed eyes - simple lines */}
            <line x1={24} y1={29} x2={28} y2={29} stroke="#2D2926" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={36} y1={29} x2={40} y2={29} stroke="#2D2926" strokeWidth={1.5} strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Happy eyes - upward curves */}
            <path d="M 24 30 Q 26 28 28 30" stroke="#2D2926" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <path d="M 36 30 Q 38 28 40 30" stroke="#2D2926" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Squint effect when chewing */}
        {isEating && (mouthPhase === 2 || mouthPhase === 3 || mouthPhase === 4) && (
          <>
            <rect x={23} y={33} width={6} height={1} rx={0.5} fill="#2D2926" opacity={0.2} />
            <rect x={35} y={33} width={6} height={1} rx={0.5} fill="#2D2926" opacity={0.2} />
          </>
        )}

        {/* Enhanced blush with gradient effect */}
        <circle cx={20} cy={33} r={2.5} fill={chewPuff ? "#E88B9E" : "#F0A0A0"} opacity={0.5} />
        <circle cx={44} cy={33} r={2.5} fill={chewPuff ? "#E88B9E" : "#F0A0A0"} opacity={0.5} />
        {chewPuff && (
          <>
            {/* Extra puff for cute effect */}
            <circle cx={19} cy={34} r={1.8} fill="#E88B9E" opacity={0.25} />
            <circle cx={45} cy={34} r={1.8} fill="#E88B9E" opacity={0.25} />
          </>
        )}

        {/* Mouth */}
        {renderMouth()}

        {/* Hair (rendered on top) */}
        <HairComponent color={safeConfig.hairColor} />

        {/* Outfit */}
        <OutfitComponent color={safeConfig.outfitColor} />

        {/* Arms */}
        {renderArm()}
        {renderDrinkArm()}

        {/* Accessory */}
        <AccessoryComponent />

        {/* Subtle character outline for polish */}
        <ellipse cx={32} cy={48} rx={16} ry={2} fill="#00000011" />
      </g>
    </svg>
  );

  // Enhanced head bob animation
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={
        isEating
          ? {
              y: [0, -3, -1, -3, 0],
              rotate: [0, -0.8, 0.8, -0.8, 0],
            }
          : specialAction === "drink"
          ? { rotate: [0, -5, -8, -5, 0] }
          : { y: [0, -2, 0] }
      }
      transition={
        isEating
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : specialAction === "drink"
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {pixelChar}
    </motion.div>
  );
}

// Mini avatar for lists
export function AvatarMini({ config, size = 40 }: { config: AvatarConfig; size?: number }) {
  const safeConfig: AvatarConfig = config ?? {
    hairStyle: 0,
    hairColor: "#5C3A1E",
    skinTone: "#F5D5C0",
    outfitStyle: 0,
    outfitColor: "#C4856C",
    accessory: 0,
    bgColor: "#B8C9E8",
  };

  if (safeConfig.uploadedImage) {
    return (
      <div
        className="overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <img src={safeConfig.uploadedImage} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center"
      style={{ 
        width: size, 
        height: size, 
        backgroundColor: safeConfig.bgColor,
        border: `2px solid ${adjustBrightness(safeConfig.bgColor, -15)}`
      }}
    >
      <Avatar config={safeConfig} size={size * 0.8} />
    </div>
  );
}