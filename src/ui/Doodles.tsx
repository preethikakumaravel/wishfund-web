import type { ReactNode } from 'react';

// Hand-drawn style doodles for the About scrapbook. Plain strokes with round caps and slightly
// uneven curves, so they read as pen marks rather than icons.

const RED = '#e2263f';
const PINK = '#ff4fa3';
const INK = '#2a2a2a';

export type DoodleName = 'asterisk' | 'arrow' | 'arrow-back' | 'hearts' | 'plane' | 'star';

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
