import type { FC } from 'react'
import type { TrainIcon as SvgProps } from '../types'

// ── 🪨 Coal ───────────────────────────────────────────────────────────────────
export const CoalCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* rough coal chunks */}
    <polygon points="6,52 4,36 14,20 26,24 28,40 18,54" fill="#37474F" />
    <polygon points="24,50 20,33 34,16 50,22 54,40 44,52" fill="#455A64" />
    <polygon points="13,54 8,42 16,28 30,32 32,48 22,56" fill="#263238" />
    {/* shine highlights */}
    <polygon points="7,38 11,24 20,21 17,29 10,36" fill="#607D8B" opacity="0.55" />
    <polygon points="30,36 34,22 44,20 42,30 34,38" fill="#78909C" opacity="0.45" />
  </svg>
)

// ── 🏖️ Sand ───────────────────────────────────────────────────────────────────
export const SandCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* sand heap */}
    <ellipse cx="30" cy="52" rx="27" ry="6" fill="#F9A825" />
    <path d="M6,52 Q10,28 30,14 Q50,28 54,52 Z" fill="#FBC02D" />
    {/* sunlit face */}
    <path d="M16,48 Q20,28 30,18 Q36,28 34,48 Z" fill="#FFD54F" opacity="0.55" />
    {/* grain dots */}
    <circle cx="20" cy="42" r="1.5" fill="#F57F17" opacity="0.6" />
    <circle cx="28" cy="38" r="1.5" fill="#F57F17" opacity="0.6" />
    <circle cx="38" cy="44" r="1.5" fill="#F57F17" opacity="0.6" />
    <circle cx="24" cy="48" r="1.5" fill="#F57F17" opacity="0.6" />
    <circle cx="42" cy="40" r="1.5" fill="#F57F17" opacity="0.6" />
    <circle cx="34" cy="34" r="1"   fill="#F57F17" opacity="0.5" />
    <circle cx="22" cy="32" r="1"   fill="#F57F17" opacity="0.5" />
  </svg>
)

// ── 🥛 Milk ───────────────────────────────────────────────────────────────────
export const MilkCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* bottle body */}
    <path d="M20,56 L18,32 Q14,22 18,14 L22,8 L38,8 L42,14 Q46,22 42,32 L40,56 Z"
          fill="#FAFAFA" stroke="#B0BEC5" strokeWidth="1.5" />
    {/* blue label */}
    <rect x="17" y="32" width="26" height="18" rx="2" fill="#1E88E5" />
    {/* white wavy stripe on label */}
    <path d="M17,40 Q23,36 30,40 Q37,44 43,40 L43,44 Q37,48 30,44 Q23,40 17,44 Z"
          fill="white" opacity="0.35" />
    {/* cap */}
    <rect x="22" y="4" width="16" height="7" rx="3" fill="#42A5F5" />
    {/* shoulder highlight */}
    <path d="M21,15 Q17,22 18,30 L21,30 Q20,22 24,16 Z" fill="white" opacity="0.4" />
  </svg>
)

// ── ⛽ Fuel ───────────────────────────────────────────────────────────────────
export const FuelCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* drum body */}
    <ellipse cx="30" cy="54" rx="20" ry="5"  fill="#B71C1C" />
    <rect   x="10" y="12"  width="40" height="42" fill="#E53935" />
    <ellipse cx="30" cy="12" rx="20" ry="5"  fill="#EF9A9A" />
    {/* metal bands */}
    <rect x="10" y="26" width="40" height="5" fill="#B71C1C" />
    <rect x="10" y="40" width="40" height="5" fill="#B71C1C" />
    {/* hazard stripe panel */}
    <rect x="14" y="14" width="32" height="10" fill="#F57F17" />
    <line x1="14" y1="14" x2="20" y2="24" stroke="#E53935" strokeWidth="3" />
    <line x1="22" y1="14" x2="28" y2="24" stroke="#E53935" strokeWidth="3" />
    <line x1="30" y1="14" x2="36" y2="24" stroke="#E53935" strokeWidth="3" />
    <line x1="38" y1="14" x2="44" y2="24" stroke="#E53935" strokeWidth="3" />
    {/* bung / cap */}
    <rect x="24" y="7"  width="12" height="7" rx="2" fill="#78909C" />
    <rect x="27" y="4"  width="6"  height="5" rx="1" fill="#546E7A" />
  </svg>
)

// ── 🍎 Apples ─────────────────────────────────────────────────────────────────
export const ApplesCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* left apple */}
    <circle cx="22" cy="40" r="17" fill="#E53935" />
    <circle cx="15" cy="32" r="6"  fill="#EF9A9A" opacity="0.55" />
    {/* left stem */}
    <line x1="22" y1="23" x2="24" y2="14" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
    {/* left leaf */}
    <ellipse cx="29" cy="13" rx="7" ry="3.5" fill="#43A047" transform="rotate(-25,29,13)" />
    <line x1="25" y1="15" x2="30" y2="12" stroke="#2E7D32" strokeWidth="1" />

    {/* right apple (slightly behind) */}
    <circle cx="41" cy="38" r="15" fill="#C62828" />
    <circle cx="35" cy="31" r="5"  fill="#EF9A9A" opacity="0.45" />
    {/* right stem */}
    <line x1="41" y1="23" x2="43" y2="15" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
    {/* right leaf */}
    <ellipse cx="48" cy="14" rx="6" ry="3" fill="#43A047" transform="rotate(-20,48,14)" />
    <line x1="44" y1="16" x2="49" y2="13" stroke="#2E7D32" strokeWidth="1" />
  </svg>
)

// ── 📫 Parcels ────────────────────────────────────────────────────────────────
export const ParcelsCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* 3-D box — right face */}
    <polygon points="44,14 56,22 56,50 44,42" fill="#6D4C41" />
    {/* 3-D box — top face */}
    <polygon points="8,14 20,6  56,6  44,14" fill="#A1887F" />
    {/* 3-D box — front face */}
    <rect x="8" y="14" width="36" height="28" rx="2" fill="#8D6E63" />
    {/* address label */}
    <rect x="12" y="22" width="22" height="14" rx="2" fill="#ECEFF1" />
    <line x1="14" y1="27" x2="32" y2="27" stroke="#B0BEC5" strokeWidth="1.5" />
    <line x1="14" y1="31" x2="28" y2="31" stroke="#B0BEC5" strokeWidth="1.5" />
    {/* twine — vertical */}
    <line x1="26" y1="14" x2="26" y2="42" stroke="#FFA000" strokeWidth="2.5" />
    {/* twine — horizontal */}
    <line x1="8"  y1="28" x2="44" y2="28" stroke="#FFA000" strokeWidth="2.5" />
    {/* bow knot */}
    <ellipse cx="26" cy="28" rx="5" ry="3.5" fill="none" stroke="#FF8F00" strokeWidth="2" />
    <circle  cx="26" cy="28" r="2" fill="#FF8F00" />
  </svg>
)

// ── 🚙 Cars ───────────────────────────────────────────────────────────────────
export const CarsCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* car body */}
    <rect x="3" y="32" width="54" height="18" rx="5" fill="#1E88E5" />
    {/* cabin */}
    <path d="M12,32 Q16,16 24,14 L38,14 Q46,16 50,32 Z" fill="#1565C0" />
    {/* windshield + rear window */}
    <path d="M16,32 Q19,20 24,18 L30,18 L30,32 Z" fill="#B3E5FC" opacity="0.85" />
    <path d="M30,18 L36,18 Q41,20 44,32 L30,32 Z" fill="#B3E5FC" opacity="0.7" />
    <line x1="30" y1="18" x2="30" y2="32" stroke="#1565C0" strokeWidth="2" />
    {/* door line */}
    <line x1="30" y1="32" x2="30" y2="50" stroke="#1976D2" strokeWidth="1.5" />
    {/* door handle */}
    <rect x="32" y="40" width="8" height="3" rx="1.5" fill="#0D47A1" />
    {/* wheels */}
    <circle cx="15" cy="52" r="8" fill="#1a1a1a" />
    <circle cx="15" cy="52" r="3.5" fill="#888" />
    <circle cx="45" cy="52" r="8" fill="#1a1a1a" />
    <circle cx="45" cy="52" r="3.5" fill="#888" />
    {/* headlight */}
    <ellipse cx="57" cy="38" rx="3" ry="4" fill="#FFF176" />
    {/* taillight */}
    <ellipse cx="3"  cy="38" rx="3" ry="4" fill="#EF5350" />
  </svg>
)

// ── 👨 People ─────────────────────────────────────────────────────────────────
export const PeopleCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* person 1 — orange */}
    <circle cx="18" cy="14" r="9" fill="#FF8F00" />
    <path d="M6,54 Q8,34 18,30 Q28,34 30,54 Z" fill="#FF8F00" />
    <line x1="8"  y1="38" x2="4"  y2="50" stroke="#FF8F00" strokeWidth="5" strokeLinecap="round" />
    <line x1="28" y1="38" x2="32" y2="50" stroke="#FF8F00" strokeWidth="5" strokeLinecap="round" />
    {/* person 2 — blue */}
    <circle cx="42" cy="16" r="8"  fill="#1565C0" />
    <path d="M30,56 Q32,36 42,32 Q52,36 54,56 Z" fill="#1565C0" />
    <line x1="32" y1="40" x2="28" y2="52" stroke="#1565C0" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="52" y1="40" x2="56" y2="52" stroke="#1565C0" strokeWidth="4.5" strokeLinecap="round" />
  </svg>
)

// ── 🪵 Logs ───────────────────────────────────────────────────────────────────
export const LogsCargo: FC<SvgProps> = ({ size = 52 }) => (
  <svg viewBox="0 0 60 60" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* log 1 — large, back-left */}
    <circle cx="18" cy="36" r="18" fill="#4E342E" />
    <circle cx="18" cy="36" r="14" fill="#5D4037" />
    <circle cx="18" cy="36" r="9"  fill="#6D4C41" />
    <circle cx="18" cy="36" r="5"  fill="#795548" />
    <circle cx="18" cy="36" r="2"  fill="#8D6E63" />
    {/* crack */}
    <line x1="18" y1="18" x2="22" y2="36" stroke="#3E2723" strokeWidth="1.5" opacity="0.7" />
    <line x1="8"  y1="26" x2="18" y2="36" stroke="#3E2723" strokeWidth="1"   opacity="0.5" />

    {/* log 2 — smaller, front-right */}
    <circle cx="42" cy="44" r="14" fill="#4E342E" />
    <circle cx="42" cy="44" r="10" fill="#5D4037" />
    <circle cx="42" cy="44" r="6"  fill="#6D4C41" />
    <circle cx="42" cy="44" r="3"  fill="#795548" />
    <circle cx="42" cy="44" r="1.2" fill="#8D6E63" />
    {/* crack */}
    <line x1="42" y1="30" x2="44" y2="44" stroke="#3E2723" strokeWidth="1.2" opacity="0.6" />
  </svg>
)
