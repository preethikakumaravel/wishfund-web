import type { CSSProperties } from 'react';

import { about } from '../about';
import type { AboutNote } from '../about';
import { Doodle, PenCircle, PenUnderline } from '../ui/Doodles';

/** Cut-out magazine letters: each one gets its own paper colour, typeface and tilt. */
const PAPERS = [
  { bg: '#1b1530', fg: '#ffffff' },
  { bg: '#ffd23f', fg: '#1b1530' },
  { bg: '#9cc8ff', fg: '#0b3a75' },
  { bg: '#ff4fa3', fg: '#ffffff' },
  { bg: '#ffffff', fg: '#e2263f' },
  { bg: '#f6e7c8', fg: '#2f7de1' },
  { bg: '#5dfc8d', fg: '#1b1530' },
];
const FACES = ["'Abril Fatface', serif", "'Archivo Black', sans-serif", "'Special Elite', monospace", "'Playfair Display', serif"];

function RansomName({ name }: { name: string }) {
  return (
    <span className="ransom" aria-label={name}>
      {[...name].map((ch, i) => {
        const paper = PAPERS[(i * 3 + 1) % PAPERS.length];
        const style: CSSProperties = {
          background: paper.bg,
          color: paper.fg,
          fontFamily: FACES[(i * 5 + 2) % FACES.length],
          fontStyle: i % 4 === 3 ? 'italic' : 'normal',
          transform: `rotate(${((i * 37) % 13) - 6}deg) translateY(${((i * 17) % 9) - 4}px)`,
          // Uneven scissor cuts.
          clipPath: `polygon(${(i * 7) % 6}% 0, 100% ${(i * 5) % 8}%, ${100 - ((i * 3) % 7)}% 100%, 0 ${100 - ((i * 11) % 9)}%)`,
        };
        return (
          <b key={i} style={style} aria-hidden>
            {i % 2 ? ch.toUpperCase() : ch.toLowerCase()}
          </b>
        );
      })}
    </span>
  );
}

/** Where each note sits on the board (desktop); on phones they stack instead. */
const SLOTS: { side: 'left' | 'right'; y: number; x: number; rot: number }[] = [
  { side: 'left', y: 8, x: 2, rot: -3 },
  { side: 'left', y: 120, x: 0, rot: 2 },
  { side: 'left', y: 232, x: 2, rot: -2 },
  { side: 'left', y: 340, x: 1, rot: 3 },
  { side: 'left', y: 445, x: 1, rot: -2 },
  { side: 'left', y: 565, x: 0, rot: 2 },
  { side: 'right', y: 0, x: 1, rot: 3 },
  { side: 'right', y: 122, x: 2, rot: -2 },
  { side: 'right', y: 222, x: 0, rot: 2 },
  { side: 'right', y: 322, x: 1, rot: -3 },
  { side: 'right', y: 455, x: 0, rot: 2 },
  { side: 'right', y: 590, x: 6, rot: -2 },
];

const STICKERS = `${import.meta.env.BASE_URL}stickers/`;

/** Doodles that hang below the words (arrows, hearts) rather than sitting beside them. */
const BELOW: ReadonlySet<string> = new Set(['arrow', 'arrow-back', 'hearts']);

function Scrap({ note, index }: { note: AboutNote; index: number }) {
  const slot = SLOTS[index % SLOTS.length];
  const style = {
    '--y': `${slot.y}px`,
    '--x': `${slot.x}%`,
    '--rot': `${slot.rot}deg`,
  } as CSSProperties;
  const below = note.doodle && BELOW.has(note.doodle);
  return (
    <div className={`scrap scrap--${slot.side} ${note.big ? 'scrap--big' : ''}`} style={style}>
      {note.sticker && <img className="scrap__sticker" src={STICKERS + note.sticker} alt="" loading="lazy" />}
      <div className="scrap__words">
        <span className="scrap__line">
          {note.doodle && !below && <Doodle name={note.doodle} className="scrap__doodle" />}
          <span className={`scrap__text ${note.circled ? 'scrap__text--circled' : ''}`}>
            {note.text}
            {note.circled && <PenCircle />}
            {note.underlined && <PenUnderline />}
          </span>
        </span>
        {note.doodle && below && <Doodle name={note.doodle} className="scrap__below" />}
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="about">
      {about.corners.map((file, i) => (
        <img key={file} className={`corner corner--${i}`} src={STICKERS + file} alt="" loading="lazy" />
      ))}
      <div className="about__inner">
        <p className="signoff">{about.signoff}</p>

        <h2 className="about__title">
          <span className="about__word">about</span>
          <RansomName name={about.name} />
        </h2>
        <p className="about__role">{about.role}</p>

        <div className="board">
          <figure className="cutout">
            <img src={`${import.meta.env.BASE_URL}${about.photo}`} alt={`Photo of ${about.name}`} />
            <p className="memo">{about.memo}</p>
          </figure>

          {about.notes.map((n, i) => (
            <Scrap key={n.text} note={n} index={i} />
          ))}

          <Doodle name="star" className="board__star" />
        </div>
      </div>
    </div>
  );
}
