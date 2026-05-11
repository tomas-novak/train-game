import type { FC } from 'react'
import type { TrainIcon as SvgProps } from '../types'

// ── shared helpers ────────────────────────────────────────────────────────────

const WheelSpoked: FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill="#1c1c1c" stroke="#666" strokeWidth="2" />
    <line x1={cx} y1={cy - r + 2} x2={cx} y2={cy + r - 2} stroke="#666" strokeWidth="1.5" />
    <line x1={cx - r + 2} y1={cy} x2={cx + r - 2} y2={cy} stroke="#666" strokeWidth="1.5" />
    <line
      x1={cx - (r - 2) * 0.7}
      y1={cy - (r - 2) * 0.7}
      x2={cx + (r - 2) * 0.7}
      y2={cy + (r - 2) * 0.7}
      stroke="#666"
      strokeWidth="1.5"
    />
    <line
      x1={cx + (r - 2) * 0.7}
      y1={cy - (r - 2) * 0.7}
      x2={cx - (r - 2) * 0.7}
      y2={cy + (r - 2) * 0.7}
      stroke="#666"
      strokeWidth="1.5"
    />
    <circle cx={cx} cy={cy} r={r * 0.28} fill="#888" />
  </>
)

const WheelPlain: FC<{ cx: number; cy: number; r?: number }> = ({ cx, cy, r = 7 }) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill="#1c1c1c" stroke="#666" strokeWidth="1.5" />
    <circle cx={cx} cy={cy} r={r * 0.38} fill="#888" />
  </>
)

// ── locomotives ───────────────────────────────────────────────────────────────

/** Classic red steam locomotive — faces left (towards signal) */
export const SteamLoco: FC<SvgProps> = ({ size = 80 }) => (
  <svg
    viewBox="0 0 130 70"
    width={size}
    height={(size * 70) / 130}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <g transform="translate(130,0) scale(-1,1)">
      {/* ── track/footplate ── */}
      <rect x="4" y="59" width="122" height="4" rx="1" fill="#555" />

      {/* ── cab (left/rear) ── */}
      <rect x="4" y="24" width="34" height="35" rx="3" fill="#6D3B1F" />
      <rect x="3" y="20" width="36" height="8" rx="2" fill="#5A2D10" />
      {/* cab windows */}
      <rect x="8" y="28" width="12" height="10" rx="2" fill="#87CEEB" stroke="#3a2010" strokeWidth="1" />
      <rect x="22" y="28" width="12" height="10" rx="2" fill="#87CEEB" stroke="#3a2010" strokeWidth="1" />
      {/* cab door */}
      <rect x="14" y="40" width="14" height="18" rx="2" fill="#5A2D10" />

      {/* ── boiler (red, main body) ── */}
      <rect x="35" y="30" width="70" height="26" rx="7" fill="#C0392B" />
      {/* boiler front (smokebox) */}
      <ellipse cx="105" cy="43" rx="13" ry="13" fill="#922B21" />
      {/* boiler bands */}
      <line x1="55" y1="30" x2="55" y2="56" stroke="#A93226" strokeWidth="2.5" opacity="0.7" />
      <line x1="75" y1="30" x2="75" y2="56" stroke="#A93226" strokeWidth="2.5" opacity="0.7" />
      {/* boiler highlight */}
      <rect x="37" y="31" width="66" height="5" rx="3" fill="#E74C3C" opacity="0.5" />

      {/* ── steam dome ── */}
      <ellipse cx="65" cy="29" rx="9" ry="7" fill="#A93226" />

      {/* ── chimney (near front of boiler) ── */}
      <rect x="90" y="12" width="9" height="20" fill="#2c2c2c" />
      <rect x="86" y="9" width="17" height="5" rx="2.5" fill="#404040" />

      {/* ── steam puffs ── */}
      <circle cx="92" cy="5" r="5" fill="white" opacity="0.85" />
      <circle cx="102" cy="3" r="4" fill="white" opacity="0.65" />
      <circle cx="110" cy="6" r="3.5" fill="white" opacity="0.45" />

      {/* ── headlight ── */}
      <circle cx="116" cy="43" r="5" fill="#FFF176" />
      <circle cx="116" cy="43" r="3" fill="#FFEE58" />

      {/* ── cowcatcher (front right) ── */}
      <line x1="118" y1="55" x2="126" y2="63" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="118" y1="59" x2="125" y2="65" stroke="#888" strokeWidth="2" strokeLinecap="round" />
      <line x1="118" y1="54" x2="128" y2="61" stroke="#888" strokeWidth="2" strokeLinecap="round" />

      {/* ── wheels ── */}
      {/* rear small (under cab) */}
      <WheelSpoked cx={20} cy={62} r={9} />
      {/* large driving wheel */}
      <WheelSpoked cx={55} cy={62} r={13} />
      {/* second driving wheel */}
      <WheelSpoked cx={80} cy={62} r={11} />
      {/* front small */}
      <WheelSpoked cx={108} cy={62} r={8} />

      {/* connecting rod */}
      <rect x="22" y="58" width="90" height="4" rx="2" fill="#666" opacity="0.8" />
    </g>
  </svg>
)

/** Streamlined blue electric locomotive — faces left (towards signal) */
export const ElectricLoco: FC<SvgProps> = ({ size = 80 }) => (
  <svg
    viewBox="0 0 130 70"
    width={size}
    height={(size * 70) / 130}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <g transform="translate(130,0) scale(-1,1)">
      {/* ── wheels (2 bogies) ── */}
      <rect x="10" y="53" width="30" height="5" rx="2" fill="#333" />
      <WheelPlain cx={20} cy={62} />
      <WheelPlain cx={34} cy={62} />
      <rect x="88" y="53" width="30" height="5" rx="2" fill="#333" />
      <WheelPlain cx={98} cy={62} />
      <WheelPlain cx={112} cy={62} />

      {/* ── footplate ── */}
      <rect x="6" y="56" width="118" height="3" rx="1" fill="#555" />

      {/* ── main body ── */}
      <path
        d="M8,24 L8,56 L122,56 L122,24 Q118,18 112,18 L14,18 Q9,18 8,24 Z"
        fill="#1565C0"
      />
      {/* streamlined nose (right) */}
      <path d="M118,18 Q128,22 128,37 Q128,52 118,56 L122,56 L122,18 Z" fill="#0D47A1" />
      {/* rear end (left) */}
      <path d="M14,18 Q6,20 5,37 Q6,54 14,56 L8,56 L8,18 Z" fill="#0D47A1" />

      {/* ── yellow speed stripe ── */}
      <rect x="5" y="44" width="123" height="8" fill="#FFD600" />

      {/* ── cab windows (large, front-right) ── */}
      <rect x="108" y="22" width="14" height="14" rx="3" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1.5" />

      {/* ── side windows ── */}
      <rect x="12" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />
      <rect x="27" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />
      <rect x="42" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />
      <rect x="57" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />
      <rect x="72" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />
      <rect x="87" y="22" width="11" height="11" rx="2" fill="#B3E5FC" stroke="#0D47A1" strokeWidth="1" />

      {/* ── roof highlight ── */}
      <rect x="8" y="18" width="114" height="4" rx="2" fill="#1E88E5" opacity="0.5" />

      {/* ── pantograph ── */}
      <line x1="42" y1="18" x2="36" y2="10" stroke="#aaa" strokeWidth="1.5" />
      <line x1="42" y1="18" x2="48" y2="10" stroke="#aaa" strokeWidth="1.5" />
      <rect x="34" y="8" width="16" height="3" rx="1" fill="#ccc" />
      <line x1="72" y1="18" x2="66" y2="10" stroke="#aaa" strokeWidth="1.5" />
      <line x1="72" y1="18" x2="78" y2="10" stroke="#aaa" strokeWidth="1.5" />
      <rect x="64" y="8" width="16" height="3" rx="1" fill="#ccc" />
      {/* overhead wire */}
      <line x1="0" y1="9" x2="130" y2="9" stroke="#bbb" strokeWidth="1" opacity="0.4" />

      {/* ── headlights ── */}
      <circle cx="125" cy="40" r="4" fill="#FFF176" />
      <circle cx="125" cy="40" r="2.5" fill="#FFEE58" />
      <circle cx="125" cy="48" r="3" fill="#FF5252" />
    </g>
  </svg>
)

/** Yellow/black diesel freight locomotive — faces left (towards signal) */
export const DieselLoco: FC<SvgProps> = ({ size = 80 }) => (
  <svg
    viewBox="0 0 130 70"
    width={size}
    height={(size * 70) / 130}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <g transform="translate(130,0) scale(-1,1)">
      {/* ── wheels (2 bogies) ── */}
      <rect x="8" y="53" width="34" height="5" rx="2" fill="#333" />
      <WheelSpoked cx={18} cy={62} r={9} />
      <WheelSpoked cx={36} cy={62} r={9} />
      <rect x="86" y="53" width="34" height="5" rx="2" fill="#333" />
      <WheelSpoked cx={96} cy={62} r={9} />
      <WheelSpoked cx={114} cy={62} r={9} />

      {/* ── footplate ── */}
      <rect x="5" y="56" width="120" height="3" rx="1" fill="#555" />

      {/* ── main body ── */}
      <rect x="6" y="22" width="118" height="35" rx="4" fill="#F9A825" />
      {/* black accent stripe */}
      <rect x="6" y="38" width="118" height="7" fill="#212121" />

      {/* ── short nose (right/front) ── */}
      <rect x="106" y="22" width="18" height="35" rx="3" fill="#F57F17" />
      <rect x="107" y="23" width="16" height="33" rx="2" fill="#F9A825" />

      {/* ── cab section (left-center) ── */}
      <rect x="24" y="14" width="40" height="43" rx="3" fill="#F9A825" />
      <rect x="25" y="15" width="38" height="10" rx="2" fill="#F57F17" />
      {/* cab windows */}
      <rect x="27" y="18" width="16" height="11" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="1" />
      <rect x="46" y="18" width="14" height="11" rx="2" fill="#B3E5FC" stroke="#333" strokeWidth="1" />

      {/* ── long engine hood (left side) ── */}
      {/* grille vents */}
      {[0, 10, 20].map((off) => (
        <rect key={off} x={7 + off} y={26} width={7} height={20} rx="1.5" fill="#E65100" opacity="0.9" />
      ))}
      {/* exhaust stack */}
      <rect x="35" y="8" width="7" height="14" fill="#2c2c2c" />
      <rect x="33" y="6" width="11" height="4" rx="2" fill="#3d3d3d" />
      {/* exhaust puff */}
      <circle cx="37" cy="3" r="4" fill="#aaa" opacity="0.7" />
      <circle cx="44" cy="2" r="3" fill="#aaa" opacity="0.5" />

      {/* ── front details ── */}
      <circle cx="120" cy="33" r="4" fill="#FFF176" />
      <circle cx="120" cy="33" r="2.5" fill="#FFEE58" />
      <circle cx="120" cy="47" r="3" fill="#FF5252" />
      {/* number board */}
      <rect x="108" y="25" width="14" height="5" rx="1" fill="#333" />

      {/* ── back buffer ── */}
      <rect x="4" y="37" width="4" height="10" rx="2" fill="#666" />
    </g>
  </svg>
)

// ── wagons ────────────────────────────────────────────────────────────────────

/** Dark steel hopper wagon with visible coal cargo */
export const HopperWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── hopper body (pronounced V-shape, dark steel) ── */}
    <polygon points="6,19 84,19 76,54 14,54" fill="#455A64" />
    {/* inner shadow to emphasise depth */}
    <polygon points="6,19 46,19 40,54 14,54" fill="#37474F" opacity="0.5" />
    {/* steel ribs */}
    <line x1="22" y1="19" x2="17" y2="54" stroke="#546E7A" strokeWidth="2.5" />
    <line x1="45" y1="19" x2="45" y2="54" stroke="#546E7A" strokeWidth="2.5" />
    <line x1="68" y1="19" x2="73" y2="54" stroke="#546E7A" strokeWidth="2.5" />
    {/* yellow safety stripe on rim */}
    <rect x="3" y="12" width="84" height="8" rx="2" fill="#F9A825" />
    <line x1="20" y1="12" x2="20" y2="20" stroke="#F57F17" strokeWidth="3" />
    <line x1="40" y1="12" x2="40" y2="20" stroke="#F57F17" strokeWidth="3" />
    <line x1="60" y1="12" x2="60" y2="20" stroke="#F57F17" strokeWidth="3" />
    <line x1="80" y1="12" x2="80" y2="20" stroke="#F57F17" strokeWidth="3" />
    {/* ── coal cargo visible inside ── */}
    <ellipse cx="25" cy="19" rx="8" ry="4" fill="#212121" />
    <ellipse cx="45" cy="17" rx="10" ry="5" fill="#212121" />
    <ellipse cx="65" cy="19" rx="8" ry="4" fill="#212121" />
    <ellipse cx="35" cy="15" rx="6" ry="3.5" fill="#37474F" />
    <ellipse cx="55" cy="15" rx="7" ry="3.5" fill="#37474F" />
    {/* discharge gate */}
    <rect x="32" y="49" width="26" height="6" rx="2" fill="#263238" />
    <line x1="32" y1="52" x2="58" y2="52" stroke="#455A64" strokeWidth="1.5" />
    {/* buffers */}
    <rect x="1" y="36" width="5" height="8" rx="2" fill="#777" />
    <rect x="84" y="36" width="5" height="8" rx="2" fill="#777" />
  </svg>
)

/** Silver tank wagon for liquids (milk, fuel) */
export const TankWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── saddle supports ── */}
    <rect x="14" y="41" width="14" height="14" rx="2" fill="#78909C" />
    <rect x="62" y="41" width="14" height="14" rx="2" fill="#78909C" />

    {/* ── main tank body ── */}
    <ellipse cx="45" cy="34" rx="41" ry="19" fill="#CFD8DC" />
    {/* tank highlight (top arc) */}
    <ellipse cx="45" cy="26" rx="35" ry="8" fill="#ECEFF1" opacity="0.6" />
    {/* tank shadow (bottom) */}
    <ellipse cx="45" cy="46" rx="35" ry="8" fill="#90A4AE" opacity="0.5" />

    {/* ── red safety bands ── */}
    <ellipse cx="45" cy="34" rx="14" ry="19" fill="none" stroke="#EF5350" strokeWidth="3" />
    <ellipse cx="45" cy="34" rx="28" ry="19" fill="none" stroke="#EF5350" strokeWidth="3" />

    {/* ── end caps ── */}
    <ellipse cx="5" cy="34" rx="5" ry="19" fill="#B0BEC5" />
    <ellipse cx="85" cy="34" rx="5" ry="19" fill="#B0BEC5" />

    {/* ── top dome + valve ── */}
    <ellipse cx="45" cy="16" rx="9" ry="5" fill="#90A4AE" />
    <rect x="43" y="8" width="4" height="10" fill="#90A4AE" />
    <rect x="40" y="6" width="10" height="4" rx="2" fill="#78909C" />

    {/* ── buffers ── */}
    <rect x="1" y="33" width="5" height="8" rx="2" fill="#777" />
    <rect x="84" y="33" width="5" height="8" rx="2" fill="#777" />
  </svg>
)

/** Bright orange-yellow box car for packaged goods (apples, parcels) */
export const BoxWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── car body (bright orange-yellow) ── */}
    <rect x="5" y="16" width="80" height="40" rx="3" fill="#FFA000" />
    {/* ── roof (darker cap) ── */}
    <rect x="3" y="10" width="84" height="9" rx="3" fill="#E65100" />
    {/* roof highlight */}
    <rect x="5" y="11" width="80" height="3" rx="1.5" fill="#FF6D00" opacity="0.5" />

    {/* ── end panels with X-braces ── */}
    <rect x="5" y="16" width="20" height="40" rx="2" fill="#FB8C00" />
    <line x1="5" y1="16" x2="25" y2="56" stroke="#E65100" strokeWidth="2" />
    <line x1="25" y1="16" x2="5" y2="56" stroke="#E65100" strokeWidth="2" />
    <rect x="65" y="16" width="20" height="40" rx="2" fill="#FB8C00" />
    <line x1="65" y1="16" x2="85" y2="56" stroke="#E65100" strokeWidth="2" />
    <line x1="85" y1="16" x2="65" y2="56" stroke="#E65100" strokeWidth="2" />

    {/* ── large sliding door (centre, brown) ── */}
    <rect x="26" y="16" width="38" height="40" rx="2" fill="#795548" />
    <rect x="27" y="17" width="36" height="38" rx="1" fill="#8D6E63" />
    {/* door X-brace — makes it unmistakably a freight door */}
    <line x1="27" y1="17" x2="63" y2="55" stroke="#6D4C41" strokeWidth="2.5" />
    <line x1="63" y1="17" x2="27" y2="55" stroke="#6D4C41" strokeWidth="2.5" />
    {/* door rail top & bottom */}
    <rect x="25" y="14" width="40" height="4" rx="1" fill="#5D4037" />
    <rect x="25" y="52" width="40" height="4" rx="1" fill="#5D4037" />
    {/* door handle */}
    <rect x="58" y="33" width="5" height="10" rx="2.5" fill="#4E342E" />

    {/* ── buffers ── */}
    <rect x="1" y="34" width="5" height="8" rx="2" fill="#777" />
    <rect x="84" y="34" width="5" height="8" rx="2" fill="#777" />
  </svg>
)

/** Gray flatcar for cars */
export const FlatcarWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── flat deck ── */}
    <rect x="4" y="44" width="82" height="11" rx="2" fill="#607D8B" />
    {/* deck planks */}
    <line x1="18" y1="44" x2="18" y2="55" stroke="#546E7A" strokeWidth="1.5" />
    <line x1="32" y1="44" x2="32" y2="55" stroke="#546E7A" strokeWidth="1.5" />
    <line x1="46" y1="44" x2="46" y2="55" stroke="#546E7A" strokeWidth="1.5" />
    <line x1="60" y1="44" x2="60" y2="55" stroke="#546E7A" strokeWidth="1.5" />
    <line x1="74" y1="44" x2="74" y2="55" stroke="#546E7A" strokeWidth="1.5" />

    {/* ── end stakes ── */}
    <rect x="4" y="30" width="5" height="16" rx="1.5" fill="#455A64" />
    <rect x="81" y="30" width="5" height="16" rx="1.5" fill="#455A64" />
    {/* mid stake */}
    <rect x="42" y="34" width="5" height="12" rx="1.5" fill="#455A64" />

    {/* ── cargo: car silhouette (matches cars cargo type) ── */}
    {/* car body */}
    <rect x="8" y="34" width="74" height="12" rx="4" fill="#1E88E5" />
    {/* cabin */}
    <path d="M20,34 Q24,24 32,22 L58,22 Q66,24 70,34 Z" fill="#1565C0" />
    {/* windshield + rear window */}
    <path d="M23,34 Q26,26 32,24 L45,24 L45,34 Z" fill="#B3E5FC" opacity="0.85" />
    <path d="M45,24 L58,24 Q64,26 67,34 L45,34 Z" fill="#B3E5FC" opacity="0.7" />
    <line x1="45" y1="24" x2="45" y2="34" stroke="#1565C0" strokeWidth="1.5" />
    {/* wheels */}
    <circle cx="22" cy="48" r="6" fill="#1a1a1a" />
    <circle cx="22" cy="48" r="2.5" fill="#888" />
    <circle cx="68" cy="48" r="6" fill="#1a1a1a" />
    <circle cx="68" cy="48" r="2.5" fill="#888" />
    {/* headlight + taillight */}
    <ellipse cx="82" cy="38" rx="2.5" ry="3" fill="#FFF176" />
    <ellipse cx="8"  cy="38" rx="2.5" ry="3" fill="#EF5350" />

    {/* ── buffers ── */}
    <rect x="1" y="44" width="4" height="7" rx="2" fill="#777" />
    <rect x="85" y="44" width="4" height="7" rx="2" fill="#777" />
  </svg>
)

/** Red passenger car with windows */
export const PassengerWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── car body ── */}
    <rect x="5" y="18" width="80" height="38" rx="4" fill="#E53935" />
    {/* ── roof ── */}
    <rect x="3" y="10" width="84" height="12" rx="4" fill="#B71C1C" />
    {/* roof stripe highlight */}
    <rect x="5" y="11" width="80" height="4" rx="2" fill="#E53935" opacity="0.35" />

    {/* ── yellow waist stripe ── */}
    <rect x="5" y="42" width="80" height="9" fill="#FFD600" />

    {/* ── windows ── */}
    <rect x="9" y="22" width="12" height="10" rx="2" fill="#B3E5FC" stroke="#B71C1C" strokeWidth="1" />
    <rect x="25" y="22" width="12" height="10" rx="2" fill="#B3E5FC" stroke="#B71C1C" strokeWidth="1" />
    <rect x="41" y="22" width="12" height="10" rx="2" fill="#B3E5FC" stroke="#B71C1C" strokeWidth="1" />
    <rect x="57" y="22" width="12" height="10" rx="2" fill="#B3E5FC" stroke="#B71C1C" strokeWidth="1" />
    <rect x="73" y="22" width="10" height="10" rx="2" fill="#B3E5FC" stroke="#B71C1C" strokeWidth="1" />

    {/* ── door ── */}
    <rect x="35" y="34" width="20" height="22" rx="2" fill="#C62828" />
    <rect x="36" y="35" width="8" height="20" rx="1" fill="#E53935" />
    <rect x="46" y="35" width="8" height="20" rx="1" fill="#E53935" />
    <circle cx="44" cy="46" r="2" fill="#B71C1C" />

    {/* ── buffers ── */}
    <rect x="1" y="35" width="5" height="8" rx="2" fill="#777" />
    <rect x="84" y="35" width="5" height="8" rx="2" fill="#777" />
  </svg>
)

/** Log car — flatcar with bunk stakes and stacked timber logs */
export const LogcarWagon: FC<SvgProps> = ({ size = 68 }) => (
  <svg
    viewBox="0 0 90 70"
    width={size}
    height={(size * 70) / 90}
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* ── frame ── */}
    <rect x="4" y="54" width="82" height="4" rx="1" fill="#555" />
    {/* ── wheels ── */}
    <WheelPlain cx={18} cy={62} />
    <WheelPlain cx={34} cy={62} />
    <WheelPlain cx={56} cy={62} />
    <WheelPlain cx={72} cy={62} />

    {/* ── flat deck ── */}
    <rect x="4" y="47" width="82" height="8" rx="2" fill="#5D4037" />

    {/* ── bunk stakes (hold logs in place) ── */}
    <rect x="10" y="28" width="6" height="22" rx="2" fill="#4E342E" />
    <rect x="42" y="28" width="6" height="22" rx="2" fill="#4E342E" />
    <rect x="74" y="28" width="6" height="22" rx="2" fill="#4E342E" />

    {/* ── logs: bottom row ── */}
    <ellipse cx="28" cy="44" rx="13" ry="5" fill="#8D6E63" />
    <ellipse cx="28" cy="44" rx="13" ry="5" fill="#795548" opacity="0.4"/>
    <ellipse cx="60" cy="44" rx="13" ry="5" fill="#8D6E63" />
    <ellipse cx="60" cy="44" rx="13" ry="5" fill="#795548" opacity="0.4"/>

    {/* ── logs: middle row ── */}
    <ellipse cx="19" cy="36" rx="13" ry="5" fill="#A1887F" />
    <ellipse cx="45" cy="36" rx="13" ry="5" fill="#A1887F" />
    <ellipse cx="71" cy="36" rx="13" ry="5" fill="#A1887F" />

    {/* ── logs: top row ── */}
    <ellipse cx="28" cy="28" rx="13" ry="5" fill="#BCAAA4" />
    <ellipse cx="60" cy="28" rx="13" ry="5" fill="#BCAAA4" />

    {/* ── log end rings (visible end-grain on right) ── */}
    <ellipse cx="83" cy="36" rx="4" ry="5" fill="#6D4C41" />
    <ellipse cx="83" cy="36" rx="2" ry="3" fill="#8D6E63" />
    <ellipse cx="83" cy="44" rx="4" ry="5" fill="#5D4037" />
    <ellipse cx="83" cy="44" rx="2" ry="3" fill="#795548" />
    <ellipse cx="83" cy="28" rx="4" ry="5" fill="#795548" />
    <ellipse cx="83" cy="28" rx="2" ry="3" fill="#A1887F" />

    {/* ── buffers ── */}
    <rect x="1" y="44" width="4" height="7" rx="2" fill="#777" />
    <rect x="85" y="44" width="4" height="7" rx="2" fill="#777" />
  </svg>
)
