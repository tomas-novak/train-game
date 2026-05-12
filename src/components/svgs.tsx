import { useId } from 'react'
import type { FC } from 'react'
import type { TrainIcon } from '../types'
import { SKY } from '../theme'
import type { SkyTheme } from '../theme'

// ── shared atoms ──────────────────────────────────────────────────────────────

const Wheel: FC<{ cx: number; cy: number; r?: number; wheel: string; wheelHub: string }> = ({
  cx, cy, r = 8, wheel, wheelHub,
}) => (
  <g>
    <circle cx={cx} cy={cy + 1.2} r={r} fill="rgba(0,0,0,0.18)" />
    <circle cx={cx} cy={cy} r={r} fill={wheel} />
    <circle cx={cx} cy={cy - r * 0.25} r={r * 0.55} fill="rgba(255,255,255,0.12)" />
    <circle cx={cx} cy={cy} r={r * 0.35} fill={wheelHub} />
    <circle cx={cx} cy={cy} r={r * 0.15} fill="rgba(0,0,0,0.4)" />
  </g>
)

const GroundShadow: FC<{ y?: number; w?: number; opacity?: number }> = ({
  y = 64, w = 110, opacity = 0.18,
}) => (
  <ellipse cx={w / 2} cy={y} rx={w * 0.42} ry={2.5} fill={`rgba(0,0,0,${opacity})`} />
)

// ── LOCOMOTIVES ───────────────────────────────────────────────────────────────

export const SteamLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).steam as SkyTheme['steam']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`c${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.cab[0]} />
          <stop offset="1" stopColor={s.cab[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <rect x="6" y="58" width="128" height="6" rx="2" fill={s.plate} />
        <path d="M6,24 Q6,18 12,18 L42,18 L42,58 L6,58 Z" fill={`url(#c${id})`} />
        <rect x="8" y="20" width="32" height="4" fill={s.cabHi} opacity={0.5} />
        <rect x="11" y="28" width="13" height="12" rx="2.5" fill={s.window} />
        <rect x="26" y="28" width="13" height="12" rx="2.5" fill={s.window} />
        <rect x="11" y="28" width="13" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="26" y="28" width="13" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="38" y="28" width="74" height="30" rx="9" fill={`url(#b${id})`} />
        <rect x="40" y="29" width="68" height="5" rx="2.5" fill={s.boilerHi} opacity={0.55} />
        <ellipse cx="112" cy="44" rx="13" ry="15" fill={s.body[1]} />
        <circle cx="112" cy="44" r="9" fill={s.body[0]} opacity={0.35} />
        <ellipse cx="64" cy="27" rx="9" ry="7" fill={`url(#b${id})`} />
        <ellipse cx="64" cy="24" rx="6" ry="2.5" fill={s.boilerHi} opacity={0.7} />
        <rect x="92" y="10" width="10" height="22" rx="2" fill={s.chimney} />
        <ellipse cx="97" cy="11" rx="7" ry="2.2" fill={s.chimney} />
        <circle cx="93" cy="6" r="5.5" fill={s.steam} opacity={0.95} />
        <circle cx="103" cy="3" r="4.5" fill={s.steam} opacity={0.8} />
        <circle cx="112" cy="6" r="3.8" fill={s.steam} opacity={0.6} />
        <circle cx="123" cy="44" r="6" fill={s.head} />
        <circle cx="123" cy="44" r="3.5" fill="#fff" opacity={0.85} />
        <Wheel cx={20} cy={64} r={8.5} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={56} cy={64} r={11.5} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={82} cy={64} r={10} wheel={s.wheel} wheelHub={s.wheelHub} />
        <Wheel cx={108} cy={64} r={7} wheel={s.wheel} wheelHub={s.wheelHub} />
        <rect x="22" y="62" width="92" height="3.5" rx="1.5" fill={s.plate} opacity={0.7} />
      </g>
    </svg>
  )
}

export const ElectricLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).electric as SkyTheme['electric']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <path d="M10,24 Q10,18 18,18 L122,18 Q132,22 132,38 Q132,54 122,58 L10,58 Z" fill={`url(#b${id})`} />
        <path d="M122,18 Q132,22 132,38 Q132,54 122,58 Z" fill={s.nose} />
        <rect x="14" y="19" width="106" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <rect x="6" y="45" width="124" height="7" fill={s.stripe} />
        <rect x="6" y="45" width="124" height="2" fill="#fff" opacity={0.25} />
        <path d="M114,24 Q124,26 126,36 L114,36 Z" fill={s.window} />
        <rect x="114" y="24" width="12" height="2" fill={s.windowFrame} opacity={0.4} />
        {([12, 28, 44, 60, 76, 92] as number[]).map((x, i) => (
          <rect key={i} x={x} y={24} width={12} height={11} rx={2} fill={s.window} />
        ))}
        <line x1="42" y1="18" x2="36" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="18" x2="48" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <rect x="34" y="6" width="16" height="3.5" rx="1.5" fill={s.pan} />
        <line x1="76" y1="18" x2="70" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="18" x2="82" y2="9" stroke={s.pan} strokeWidth="2" strokeLinecap="round" />
        <rect x="68" y="6" width="16" height="3.5" rx="1.5" fill={s.pan} />
        <line x1="0" y1="6.5" x2="140" y2="6.5" stroke={s.panRail} strokeWidth="0.8" opacity={0.5} />
        <circle cx="128" cy="40" r="4" fill={s.head} />
        <circle cx="128" cy="40" r="2" fill="#fff" opacity={0.9} />
        <rect x="12" y="56" width="32" height="4" rx="2" fill={s.windowFrame} opacity={0.5} />
        <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={36} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <rect x="92" y="56" width="32" height="4" rx="2" fill={s.windowFrame} opacity={0.5} />
        <Wheel cx={100} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={116} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      </g>
    </svg>
  )
}

export const DieselLoco: FC<TrainIcon> = ({ size = 100, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).diesel as SkyTheme['diesel']
  return (
    <svg viewBox="0 0 140 76" width={size} height={(size * 76) / 140} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={140} />
      <g transform="translate(140,0) scale(-1,1)">
        <rect x="6" y="26" width="124" height="32" rx="4" fill={`url(#b${id})`} />
        <rect x="8" y="27" width="120" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <path d="M112,26 Q130,30 130,42 Q130,54 112,58 Z" fill={s.nose} />
        <rect x="6" y="40" width="124" height="6" fill={s.stripe} opacity={0.9} />
        <rect x="24" y="14" width="44" height="44" rx="3" fill={`url(#b${id})`} />
        <rect x="25" y="15" width="42" height="4" rx="2" fill={s.bodyHi} opacity={0.55} />
        <rect x="27" y="18" width="18" height="13" rx="2.5" fill={s.window} />
        <rect x="48" y="18" width="17" height="13" rx="2.5" fill={s.window} />
        <rect x="27" y="18" width="18" height="3" fill={s.windowFrame} opacity={0.25} />
        <rect x="48" y="18" width="17" height="3" fill={s.windowFrame} opacity={0.25} />
        {([0, 11, 22] as number[]).map((off) => (
          <rect key={off} x={9 + off} y={30} width={7} height={8} rx={1.5} fill={s.grille} opacity={0.85} />
        ))}
        <rect x="36" y="6" width="9" height="12" rx="2" fill={s.grille} />
        <ellipse cx="40.5" cy="7" rx="5.5" ry="2" fill={s.grille} />
        <circle cx="38" cy="2" r="4" fill={s.smoke} opacity={0.7} />
        <circle cx="46" cy="0" r="3" fill={s.smoke} opacity={0.55} />
        <circle cx="123" cy="38" r="4" fill={s.head} />
        <circle cx="123" cy="38" r="2.2" fill="#fff" opacity={0.9} />
        <rect x="10" y="56" width="34" height="4" rx="2" fill={s.grille} opacity={0.6} />
        <Wheel cx={18} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={36} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <rect x="88" y="56" width="34" height="4" rx="2" fill={s.grille} opacity={0.6} />
        <Wheel cx={96} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
        <Wheel cx={114} cy={64} r={8} wheel={s.wheel} wheelHub={s.bodyHi} />
      </g>
    </svg>
  )
}

// ── WAGONS ────────────────────────────────────────────────────────────────────

export const HopperWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).hopper as SkyTheme['hopper']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`bi${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[1]} stopOpacity={0.85} />
          <stop offset="1" stopColor={s.body[1]} stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.body[1]} opacity={0.55} />
      <polygon points="6,22 94,22 84,56 16,56" fill={`url(#b${id})`} />
      <polygon points="12,24 88,24 80,52 20,52" fill={`url(#bi${id})`} />
      <polygon points="12,24 88,24 84,26 16,26" fill={s.body[1]} opacity={0.7} />
      <rect x="4" y="19" width="92" height="5" rx="2" fill={s.bodyHi} opacity={0.95} />
      <rect x="4" y="19" width="92" height="1.5" rx="0.75" fill="#fff" opacity={0.55} />
      <rect x="4" y="34" width="92" height="7" fill={s.stripe} />
      <rect x="4" y="34" width="92" height="2" fill="#fff" opacity={0.3} />
      <rect x="36" y="50" width="28" height="6" rx="2" fill={s.body[1]} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const TankWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).tank as SkyTheme['tank']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="0.45" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <radialGradient id={`cap${id}`} cx="0.35" cy="0.4" r="0.75">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="0.6" stopColor={s.cap} />
          <stop offset="1" stopColor={s.saddle} />
        </radialGradient>
        <linearGradient id={`man${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.bodyHi} />
          <stop offset="1" stopColor={s.cap} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="55" width="92" height="6" rx="2" fill={s.saddle} />
      <rect x="4" y="55" width="92" height="1.5" fill="#fff" opacity={0.25} />
      <rect x="0" y="57" width="6" height="3" rx="1" fill={s.saddle} />
      <rect x="94" y="57" width="6" height="3" rx="1" fill={s.saddle} />
      <path d="M14,55 Q14,42 24,40 L34,40 Q44,42 44,55 Z" fill={s.saddle} />
      <path d="M14,55 Q14,42 24,40 L34,40 Q44,42 44,55 Z" fill="#fff" opacity={0.08} />
      <path d="M56,55 Q56,42 66,40 L76,40 Q86,42 86,55 Z" fill={s.saddle} />
      <path d="M56,55 Q56,42 66,40 L76,40 Q86,42 86,55 Z" fill="#fff" opacity={0.08} />
      <rect x="10" y="24" width="80" height="28" rx="14" fill={`url(#b${id})`} />
      <rect x="14" y="26" width="72" height="3.5" rx="1.75" fill="#fff" opacity={0.5} />
      <rect x="14" y="46" width="72" height="3" rx="1.5" fill={s.body[1]} opacity={0.45} />
      <ellipse cx="10" cy="38" rx="6" ry="14" fill={`url(#cap${id})`} />
      <ellipse cx="10" cy="32" rx="3.5" ry="6" fill={s.bodyHi} opacity={0.65} />
      <ellipse cx="90" cy="38" rx="6" ry="14" fill={`url(#cap${id})`} />
      <ellipse cx="90" cy="32" rx="3.5" ry="6" fill={s.bodyHi} opacity={0.65} />
      <rect x="28" y="24" width="2.5" height="28" fill={s.band} opacity={0.85} />
      <rect x="28" y="24" width="0.8" height="28" fill="#fff" opacity={0.45} />
      <rect x="69.5" y="24" width="2.5" height="28" fill={s.band} opacity={0.85} />
      <rect x="69.5" y="24" width="0.8" height="28" fill="#fff" opacity={0.45} />
      <rect x="36" y="22.5" width="28" height="3" rx="1" fill={s.saddle} />
      <rect x="36" y="22.5" width="28" height="1" rx="0.5" fill="#fff" opacity={0.3} />
      {([40, 46, 52, 58] as number[]).map((x) => (
        <circle key={x} cx={x} cy={24} r="0.5" fill={s.band} opacity={0.7} />
      ))}
      <ellipse cx="50" cy="20" rx="9" ry="3" fill={s.saddle} opacity={0.55} />
      <rect x="41" y="14" width="18" height="8" rx="3" fill={`url(#man${id})`} />
      <rect x="41" y="14" width="18" height="2.5" rx="1.25" fill="#fff" opacity={0.55} />
      {([44, 48, 52, 56] as number[]).map((x) => (
        <circle key={x} cx={x} cy="18" r="0.9" fill={s.saddle} />
      ))}
      <ellipse cx="50" cy="13" rx="7" ry="2.2" fill={s.cap} />
      <ellipse cx="50" cy="12.5" rx="5" ry="1.2" fill={s.bodyHi} opacity={0.8} />
      <rect x="49" y="8" width="2" height="6" fill={s.saddle} />
      <circle cx="50" cy="8" r="3" fill="none" stroke={s.saddle} strokeWidth="1.2" />
      <line x1="47" y1="8" x2="53" y2="8" stroke={s.saddle} strokeWidth="1.2" />
      <line x1="50" y1="5" x2="50" y2="11" stroke={s.saddle} strokeWidth="1.2" />
      <line x1="6" y1="30" x2="6" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      <line x1="14" y1="30" x2="14" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      {([34, 40, 46] as number[]).map((y) => (
        <line key={y} x1="6" y1={y} x2="14" y2={y} stroke={s.saddle} strokeWidth="1" />
      ))}
      <line x1="86" y1="30" x2="86" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      <line x1="94" y1="30" x2="94" y2="52" stroke={s.saddle} strokeWidth="1.4" />
      {([34, 40, 46] as number[]).map((y) => (
        <line key={y} x1="86" y1={y} x2="94" y2={y} stroke={s.saddle} strokeWidth="1" />
      ))}
      <rect x="12" y="58" width="20" height="4" rx="2" fill={s.saddle} opacity={0.85} />
      <rect x="68" y="58" width="20" height="4" rx="2" fill={s.saddle} opacity={0.85} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const BoxWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).box as SkyTheme['box']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.roof[0]} />
          <stop offset="1" stopColor={s.roof[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.roof[1]} opacity={0.6} />
      <rect x="6" y="20" width="88" height="38" rx="3" fill={`url(#b${id})`} />
      <rect x="3" y="14" width="94" height="9" rx="3" fill={`url(#r${id})`} />
      <rect x="6" y="15" width="88" height="3" rx="1.5" fill="#fff" opacity={0.18} />
      <rect x="30" y="22" width="40" height="34" rx="2" fill={s.door} />
      <rect x="31" y="23" width="38" height="6" rx="1" fill={s.doorHi} opacity={0.7} />
      <line x1="50" y1="22" x2="50" y2="56" stroke={s.doorEdge} strokeWidth="1.5" opacity={0.55} />
      <rect x="28" y="20" width="44" height="4" rx="1" fill={s.doorEdge} opacity={0.5} />
      <rect x="28" y="54" width="44" height="4" rx="1" fill={s.doorEdge} opacity={0.5} />
      <rect x="62" y="36" width="5" height="8" rx="2.5" fill={s.doorEdge} />
      <rect x="6" y="22" width="22" height="34" fill={s.bodyHi} opacity={0.25} />
      <rect x="72" y="22" width="22" height="34" fill={s.body[1]} opacity={0.18} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const FlatcarWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).flatcar as SkyTheme['flatcar']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`d${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.deckHi} />
          <stop offset="1" stopColor={s.deck[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="46" width="92" height="12" rx="2" fill={`url(#d${id})`} />
      <rect x="4" y="46" width="92" height="2" fill="#fff" opacity={0.3} />
      {([18, 32, 46, 60, 74] as number[]).map((x) => (
        <line key={x} x1={x} y1="48" x2={x} y2="56" stroke={s.stake} strokeWidth="0.8" opacity={0.35} />
      ))}
      <rect x="4" y="38" width="5" height="10" rx="1.5" fill={s.stake} />
      <rect x="91" y="38" width="5" height="10" rx="1.5" fill={s.stake} />
      <rect x="28" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      <rect x="50" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      <rect x="72" y="40" width="3" height="7" rx="1" fill={s.stake} opacity={0.9} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.deckHi} />
    </svg>
  )
}

export const PassengerWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).passenger as SkyTheme['passenger']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`b${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body[0]} />
          <stop offset="1" stopColor={s.body[1]} />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.roof[0]} />
          <stop offset="1" stopColor={s.roof[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="56" width="92" height="5" rx="2" fill={s.roof[1]} opacity={0.55} />
      <rect x="6" y="22" width="88" height="36" rx="4" fill={`url(#b${id})`} />
      <rect x="4" y="14" width="92" height="12" rx="4" fill={`url(#r${id})`} />
      <rect x="6" y="15" width="88" height="3.5" rx="1.5" fill="#fff" opacity={0.22} />
      <rect x="6" y="46" width="88" height="7" fill={s.stripe} />
      <rect x="6" y="46" width="88" height="2" fill="#fff" opacity={0.3} />
      {([10, 26, 42, 58, 74] as number[]).map((x, i) => (
        <g key={i}>
          <rect x={x} y={28} width={12} height={12} rx={2.5} fill={s.window} />
          <rect x={x} y={28} width={12} height={3} fill={s.windowFrame} opacity={0.22} />
        </g>
      ))}
      <rect x="38" y="36" width="20" height="22" rx="2" fill={s.door} />
      <line x1="48" y1="38" x2="48" y2="56" stroke={s.windowFrame} strokeWidth="1.2" opacity={0.55} />
      <circle cx="55" cy="48" r="1.5" fill={s.windowFrame} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.bodyHi} />
    </svg>
  )
}

export const LogcarWagon: FC<TrainIcon> = ({ size = 80, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).logcar as SkyTheme['logcar']
  return (
    <svg viewBox="0 0 100 76" width={size} height={(size * 76) / 100} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`d${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.deck[0]} />
          <stop offset="1" stopColor={s.deck[1]} />
        </linearGradient>
      </defs>
      <GroundShadow y={70} w={100} />
      <rect x="4" y="48" width="92" height="10" rx="2" fill={`url(#d${id})`} />
      <rect x="4" y="48" width="92" height="2" fill="#fff" opacity={0.25} />
      <rect x="12" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="12" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="47" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="47" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="82" y="22" width="6" height="28" rx="1.5" fill={s.stake} />
      <rect x="82" y="22" width="2" height="28" fill="#fff" opacity={0.18} />
      <rect x="6" y="44" width="88" height="4" rx="1.5" fill={s.stake} opacity={0.85} />
      <rect x="6" y="44" width="88" height="1.2" rx="0.6" fill="#fff" opacity={0.25} />
      <Wheel cx={20} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={38} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={62} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
      <Wheel cx={80} cy={64} r={7} wheel={s.wheel} wheelHub={s.log3} />
    </svg>
  )
}

// ── CARGO ICONS ───────────────────────────────────────────────────────────────

export const CoalCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).coal as SkyTheme['coal']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="54" rx="22" ry="3" fill="rgba(0,0,0,0.15)" />
      <polygon points="6,50 4,36 14,22 28,26 30,42 18,52" fill={s.b} />
      <polygon points="22,52 18,33 36,18 50,24 54,42 42,52" fill={s.a} />
      <polygon points="12,52 8,40 18,30 32,34 32,46 22,54" fill={s.c} opacity={0.85} />
      <polygon points="20,28 32,22 40,24 32,32" fill={s.hi} opacity={0.45} />
      <polygon points="10,38 18,30 22,34 14,42" fill={s.hi} opacity={0.35} />
    </svg>
  )
}

export const SandCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).sand as SkyTheme['sand']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="54" rx="24" ry="3" fill="rgba(0,0,0,0.15)" />
      <path d="M4,54 Q10,28 30,14 Q50,28 56,54 Z" fill={s.b} />
      <path d="M4,54 Q10,28 30,14 Q40,30 30,54 Z" fill={s.a} />
      <path d="M16,50 Q22,28 30,18 Q34,30 30,50 Z" fill={s.hi} opacity={0.5} />
      {([[20, 44], [28, 38], [38, 44], [24, 48], [42, 40], [34, 34]] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.2} fill={s.dot} opacity={0.6} />
      ))}
    </svg>
  )
}

export const MilkCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).milk as SkyTheme['milk']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`m${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.bottle} />
          <stop offset="1" stopColor={s.shadow} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="56" rx="14" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <path d="M20,56 L18,32 Q14,22 18,14 L22,8 L38,8 L42,14 Q46,22 42,32 L40,56 Z" fill={`url(#m${id})`} />
      <path d="M22,16 Q18,22 20,30 L22,30 Q21,22 24,16 Z" fill="#fff" opacity={0.7} />
      <rect x="17" y="32" width="26" height="18" rx="2" fill={s.label} />
      <rect x="17" y="32" width="26" height="3" fill={s.labelHi} opacity={0.55} />
      <circle cx="30" cy="41" r="4.5" fill="#fff" opacity={0.85} />
      <rect x="22" y="4" width="16" height="7" rx="3" fill={s.cap} />
      <rect x="22" y="4" width="16" height="2.5" rx="1" fill="#fff" opacity={0.4} />
    </svg>
  )
}

export const FuelCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).fuel as SkyTheme['fuel']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`f${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.drumHi} />
          <stop offset="0.5" stopColor={s.drum} />
          <stop offset="1" stopColor={s.band} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="56" rx="18" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <rect x="10" y="12" width="40" height="44" rx="3" fill={`url(#f${id})`} />
      <ellipse cx="30" cy="12" rx="20" ry="4" fill={s.drumHi} />
      <rect x="10" y="26" width="40" height="4" fill={s.band} opacity={0.85} />
      <rect x="10" y="40" width="40" height="4" fill={s.band} opacity={0.85} />
      <rect x="14" y="14" width="32" height="10" rx="1.5" fill={s.hazard} />
      {([14, 22, 30, 38] as number[]).map((x) => (
        <line key={x} x1={x} y1="14" x2={x + 6} y2="24" stroke={s.band} strokeWidth="2.5" />
      ))}
      <rect x="24" y="6" width="12" height="7" rx="2" fill={s.cap} />
      <rect x="27" y="3" width="6" height="5" rx="1" fill={s.cap} opacity={0.85} />
    </svg>
  )
}

export const ApplesCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).apples as SkyTheme['apples']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="56" rx="22" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <circle cx="40" cy="38" r="16" fill={s.redDark} />
      <circle cx="40" cy="38" r="13" fill={s.red} />
      <ellipse cx="35" cy="33" rx="5" ry="5" fill={s.hi} opacity={0.55} />
      <path d="M40,22 Q42,16 44,15" stroke={s.stem} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <ellipse cx="48" cy="14" rx="6" ry="3" fill={s.leaf} transform="rotate(-25 48 14)" />
      <circle cx="22" cy="42" r="14" fill={s.redDark} />
      <circle cx="22" cy="42" r="11" fill={s.red} />
      <ellipse cx="18" cy="38" rx="4" ry="4" fill={s.hi} opacity={0.55} />
      <path d="M22,28 Q24,22 26,21" stroke={s.stem} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export const ParcelsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).parcels as SkyTheme['parcels']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="56" rx="22" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <polygon points="8,18 22,10 56,10 44,18" fill={s.top} />
      <polygon points="44,18 56,10 56,46 44,54" fill={s.side} />
      <rect x="8" y="18" width="36" height="36" rx="2" fill={s.front} />
      <rect x="8" y="18" width="36" height="6" fill={s.top} opacity={0.35} />
      <rect x="13" y="26" width="20" height="14" rx="2" fill={s.label} />
      <line x1="15" y1="31" x2="31" y2="31" stroke={s.side} strokeWidth="1.4" />
      <line x1="15" y1="35" x2="27" y2="35" stroke={s.side} strokeWidth="1.4" />
      <line x1="26" y1="18" x2="26" y2="54" stroke={s.twine} strokeWidth="2.5" />
      <line x1="8" y1="36" x2="44" y2="36" stroke={s.twine} strokeWidth="2.5" />
      <line x1="44" y1="36" x2="56" y2="28" stroke={s.twine} strokeWidth="2.5" />
      <line x1="26" y1="18" x2="40" y2="12" stroke={s.twine} strokeWidth="2.5" />
    </svg>
  )
}

export const CarsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const raw = useId()
  const id = raw.replace(/:/g, '')
  const s = (t ?? SKY).cars as SkyTheme['cars']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`c${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={s.body} />
          <stop offset="1" stopColor={s.bodyDark} />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="54" rx="24" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <rect x="3" y="32" width="54" height="16" rx="5" fill={`url(#c${id})`} />
      <path d="M12,32 Q16,16 24,14 L38,14 Q46,16 50,32 Z" fill={s.bodyDark} />
      <path d="M16,32 Q19,20 24,18 L30,18 L30,32 Z" fill={s.window} opacity={0.9} />
      <path d="M30,18 L36,18 Q41,20 44,32 L30,32 Z" fill={s.window} opacity={0.75} />
      <line x1="30" y1="18" x2="30" y2="32" stroke={s.bodyDark} strokeWidth="1.5" />
      <rect x="32" y="38" width="8" height="3" rx="1.5" fill={s.bodyDark} />
      <circle cx="15" cy="50" r="7" fill={s.wheel} />
      <circle cx="15" cy="50" r="3" fill={s.window} />
      <circle cx="45" cy="50" r="7" fill={s.wheel} />
      <circle cx="45" cy="50" r="3" fill={s.window} />
      <ellipse cx="56" cy="38" rx="2.5" ry="3" fill={s.head} />
    </svg>
  )
}

export const PeopleCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).people as SkyTheme['people']
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="56" rx="22" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <path d="M30,54 Q31,38 41,34 Q51,38 52,54 Z" fill={s.shirtB} />
      <circle cx="41" cy="22" r="9" fill={s.skinB} />
      <path d="M32,17 Q33,12 41,11 Q49,12 50,18 Q49,15 41,14 Q33,15 32,17 Z" fill={s.hair} />
      <path d="M8,56 Q10,38 20,34 Q30,38 32,56 Z" fill={s.shirtA} />
      <circle cx="20" cy="22" r="10" fill={s.skinA} />
      <path d="M10,18 Q11,11 20,10 Q29,11 30,18 Q28,14 20,13 Q12,14 10,18 Z" fill={s.hair} />
      <circle cx="17" cy="22" r="1.2" fill={s.hair} />
      <circle cx="23" cy="22" r="1.2" fill={s.hair} />
    </svg>
  )
}

interface LogShapeProps {
  cx: number; cy: number; w: number; h: number
  outer: string; mid: string; inner: string; crack: string
}

function LogShape({ cx, cy, w, h, outer, mid, inner, crack }: LogShapeProps) {
  const bodyLeft = cx - w / 2
  const bodyRight = cx + w / 2
  const capCx = bodyRight - h * 0.45
  const capRx = h * 0.42
  const capRy = h / 2 - 1
  return (
    <g>
      <rect x={bodyLeft} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={outer} />
      <rect x={bodyLeft + 3} y={cy - h / 2 + 1.5} width={w - 6} height={1.5} rx={0.75} fill="#fff" opacity={0.18} />
      <path d={`M${bodyLeft + 4} ${cy - h * 0.22} q3 -1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.55} />
      <path d={`M${bodyLeft + 3} ${cy} q3 1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.55} />
      <path d={`M${bodyLeft + 4} ${cy + h * 0.22} q3 -1.5 6 0 t6 0 t6 0 t6 0`} stroke={crack} strokeWidth="0.9" fill="none" opacity={0.45} />
      <ellipse cx={bodyLeft + 6} cy={cy - h * 0.05} rx="1" ry="0.6" fill={crack} opacity={0.55} />
      <ellipse cx={capCx} cy={cy} rx={capRx} ry={capRy} fill={inner} />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.78} ry={capRy * 0.78} fill="none" stroke={mid} strokeWidth="0.9" />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.5} ry={capRy * 0.5} fill="none" stroke={mid} strokeWidth="0.9" />
      <ellipse cx={capCx} cy={cy} rx={capRx * 0.22} ry={capRy * 0.22} fill={mid} />
      <ellipse cx={capCx + 0.4} cy={cy + 0.3} rx={capRx} ry={capRy} fill="none" stroke={outer} strokeWidth="0.6" opacity={0.5} />
    </g>
  )
}

export const LogsCargo: FC<TrainIcon> = ({ size = 56, t }) => {
  const s = (t ?? SKY).logs as SkyTheme['logs']
  const p = { outer: s.outer, mid: s.mid, inner: s.inner, crack: s.crack }
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="55" rx="24" ry="2.5" fill="rgba(0,0,0,0.18)" />
      <LogShape cx={36} cy={20} w={36} h={14} {...p} />
      <LogShape cx={28} cy={26} w={46} h={15} {...p} />
      <LogShape cx={32} cy={42} w={50} h={16} {...p} />
    </svg>
  )
}
