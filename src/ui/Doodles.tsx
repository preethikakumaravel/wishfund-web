import type { ReactNode } from 'react';

// Hand-drawn style doodles for the About scrapbook. Plain strokes with round caps and slightly
// uneven curves, so they read as pen marks rather than icons.

const RED = '#e2263f';
const PINK = '#ff4fa3';
const BLUE = '#2f7de1';
const INK = '#2a2a2a';

export type DoodleName =
  | 'asterisk'
  | 'arrow'
  | 'arrow-back'
  | 'hearts'
  | 'plane'
  | 'camera'
  | 'sunflower'
  | 'coffee'
  | 'blue-heart'
  | 'sparkle'
  | 'star'
  | 'speech'
  | 'gamepad';

const stroke = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Svg({ w, h, view, className, children }: { w: number; h: number; view: string; className?: string; children: ReactNode }) {
  return (
    <svg className={`doodle ${className ?? ''}`} width={w} height={h} viewBox={view} aria-hidden>
      {children}
    </svg>
  );
}

export function Doodle({ name, className }: { name: DoodleName; className?: string }) {
  switch (name) {
    case 'asterisk':
      return (
        <Svg w={26} h={26} view="0 0 30 30" className={className}>
          <g {...stroke} stroke={RED} strokeWidth={3}>
            <path d="M15 3 L15.5 27" />
            <path d="M4 9 L26 21" />
            <path d="M25 8 L5 22" />
          </g>
        </Svg>
      );
    case 'arrow':
      return (
        <Svg w={86} h={50} view="0 0 90 52" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.4}>
            <path d="M4 8 C 14 40, 46 50, 82 34" />
            <path d="M70 26 L83 34 L69 43" />
          </g>
        </Svg>
      );
    case 'arrow-back':
      return (
        <Svg w={86} h={50} view="0 0 90 52" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.4}>
            <path d="M86 8 C 76 40, 44 50, 8 34" />
            <path d="M20 26 L7 34 L21 43" />
          </g>
        </Svg>
      );
    case 'hearts':
      return (
        <Svg w={104} h={20} view="0 0 104 20" className={className}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              transform={`translate(${i * 21} ${i % 2 ? 1 : 0})`}
              d="M9 17 C 2 11, 1 6, 4.5 3.5 C 7 2, 9 4, 9 6 C 9 4, 11 2, 13.5 3.5 C 17 6, 16 11, 9 17 Z"
              fill={RED}
            />
          ))}
        </Svg>
      );
    case 'plane':
      return (
        <Svg w={92} h={56} view="0 0 96 58" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2}>
            <path d="M58 22 L92 6 L74 44 L66 30 Z" fill="#fff" />
            <path d="M66 30 L92 6" />
            <path d="M54 34 C 40 44, 24 46, 4 40" strokeDasharray="4 6" />
          </g>
        </Svg>
      );
    case 'camera':
      return (
        <Svg w={52} h={40} view="0 0 52 40" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.2}>
            <path d="M4 12 C 4 10, 5 9, 7 9 L15 9 L18 4 L32 4 L35 9 L45 9 C 47 9, 48 10, 48 12 L48 33 C 48 35, 47 36, 45 36 L7 36 C 5 36, 4 35, 4 33 Z" />
            <circle cx="26" cy="22" r="8" />
            <circle cx="26" cy="22" r="3.5" />
            <path d="M40 14 L43 14" />
          </g>
        </Svg>
      );
    case 'sunflower':
      return (
        <Svg w={44} h={44} view="0 0 44 44" className={className}>
          <g {...stroke} stroke="#d9a400" strokeWidth={2} fill="#ffd94a">
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse key={i} cx="22" cy="9" rx="4" ry="8" transform={`rotate(${i * 36} 22 22)`} />
            ))}
          </g>
          <circle cx="22" cy="22" r="7" fill="#6b3f1d" />
        </Svg>
      );
    case 'coffee':
      return (
        <Svg w={44} h={46} view="0 0 44 46" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.2}>
            <path d="M6 18 L9 42 L29 42 L32 18 Z" />
            <path d="M32 23 C 40 22, 41 33, 31 34" />
            <path d="M14 13 C 11 9, 17 7, 14 2" />
            <path d="M22 13 C 19 9, 25 7, 22 2" />
          </g>
        </Svg>
      );
    case 'blue-heart':
      return (
        <Svg w={40} h={36} view="0 0 40 36" className={className}>
          <path
            d="M20 33 C 6 23, 2 15, 6 8 C 10 2, 18 4, 20 10 C 22 4, 31 2, 35 8 C 39 15, 34 23, 20 33 Z"
            fill="#9cc8ff"
            stroke={BLUE}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <path d="M11 11 C 12 9, 14 8, 15 8" {...stroke} stroke="#fff" strokeWidth={2} />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg w={34} h={34} view="0 0 34 34" className={className}>
          <path d="M17 2 C 18 12, 21 16, 32 17 C 21 18, 18 22, 17 32 C 16 22, 13 18, 2 17 C 13 16, 16 12, 17 2 Z" fill={PINK} />
        </Svg>
      );
    case 'star':
      return (
        <Svg w={150} h={146} view="0 0 150 146" className={className}>
          <path
            d="M76 6 L95 52 L144 56 L106 86 L119 138 L75 110 L30 139 L43 87 L6 57 L55 51 Z"
            fill="#ffc2de"
            stroke={PINK}
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <path
            d="M74 12 L92 55 L136 60 L101 87 L113 131 L76 106 L35 132 L47 88 L14 60 L58 55 Z"
            {...stroke}
            stroke={PINK}
            strokeWidth={1.6}
            opacity={0.7}
          />
        </Svg>
      );
    case 'speech':
      return (
        <Svg w={46} h={40} view="0 0 46 40" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.2}>
            <path d="M6 6 C 16 2, 32 2, 41 6 C 45 12, 45 20, 40 25 C 32 28, 22 28, 16 27 L7 36 L9 26 C 3 22, 2 12, 6 6 Z" />
            <path d="M14 15 L15 15 M22 15 L23 15 M30 15 L31 15" strokeWidth={3.2} />
          </g>
        </Svg>
      );
    case 'gamepad':
      return (
        <Svg w={54} h={36} view="0 0 54 36" className={className}>
          <g {...stroke} stroke={INK} strokeWidth={2.2}>
            <path d="M12 6 L42 6 C 50 6, 54 24, 50 30 C 46 35, 40 30, 36 25 L18 25 C 14 30, 8 35, 4 30 C 0 24, 4 6, 12 6 Z" />
            <path d="M14 12 L14 20 M10 16 L18 16" />
          </g>
          <circle cx="38" cy="13" r="2" fill={PINK} />
          <circle cx="43" cy="18" r="2" fill={BLUE} />
        </Svg>
      );
  }
}

/** Hand-drawn loop around a note, like circling something in pen. */
export function PenCircle() {
  return (
    <svg className="pen-circle" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden>
      <path
        d="M100 6 C 160 4, 196 18, 194 40 C 192 64, 150 76, 96 75 C 40 74, 6 62, 6 40 C 7 18, 46 6, 112 9 C 130 10, 150 13, 160 18"
        {...stroke}
        stroke={RED}
        strokeWidth={2.6}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Slightly wobbly pen underline. */
export function PenUnderline() {
  return (
    <svg className="pen-underline" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
      <path d="M2 6 C 50 3, 120 8, 198 4" {...stroke} stroke={RED} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
