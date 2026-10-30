// Pixel-art sprites drawn from character grids, rendered as crisp SVG.

const PALETTE: Record<string, string> = {
  K: '#1b1530', // outline
  W: '#ffffff',
  Y: '#ffd23f',
  O: '#ff9f1c',
  P: '#ff4fa3',
  L: '#ffb3d9',
  G: '#5dfc8d',
  V: '#8f7cff',
  C: '#dcd6ff',
  R: '#ff3b5c',
};

const SPRITES = {
  star: `
....KK....
...KYYK...
...KYYK...
KKKKYYKKKK
KYYYYYYYYK
.KYYKYKYK.
..KYYYYK..
.KYYYYYYK.
.KYYKKYYK.
.KKK..KKK.`,
  heart: `
.KK...KK.
KPPK.KPLK
KPPPKPPLK
KPPPPPPPK
.KPPPPPK.
..KPPPK..
...KPK...
....K....`,
  coin: `
..KKKK..
.KYYYYK.
KYYOOYYK
KYOYYOYK
KYOYYOYK
KYYOOYYK
.KYYYYK.
..KKKK..`,
  cloud: `
.....KKKK.......
....KWWWWK.KKK..
..KKWWWWWWKWWWK.
.KWWWWWWWWWWWWWK
KWWWWWWWWWWWWCCK
KCWWWWWWWWWWCCCK
.KCCCWWWWCCCCCK.
..KKKKKKKKKKKK..`,
  gift: `
..KK..KK..
.KPPKKPPK.
..KKPPKK..
KKKKYYKKKK
KPPPYYPPPK
KKKKYYKKKK
KLLLYYLLLK
KLLLYYLLLK
KLLLYYLLLK
KKKKKKKKKK`,
  sparkle: `
...K...
...W...
...W...
KWWWWWK
...W...
...W...
...K...`,
};

export type SpriteName = keyof typeof SPRITES;

export function Pixel({
  name,
  size = 4,
  className,
  title,
}: {
  name: SpriteName;
  size?: number;
  className?: string;
  title?: string;
}) {
  const rows = SPRITES[name].trim().split('\n');
  const w = rows[0].length;
  const h = rows.length;
  return (
    <svg
      className={className}
      width={w * size}
      height={h * size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          PALETTE[c] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETTE[c]} /> : null,
        ),
      )}
    </svg>
  );
}
