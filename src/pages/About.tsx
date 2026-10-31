import { about } from '../about';

const RED = '#e2263f';

/** Three little "burst" strokes, like a hand-drawn emphasis mark. */
function Burst({ flip }: { flip?: boolean }) {
  return (
    <svg className="burst" viewBox="0 0 40 40" aria-hidden style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <g stroke={RED} strokeWidth="3" strokeLinecap="round">
        <line x1="30" y1="6" x2="22" y2="16" />
        <line x1="36" y1="22" x2="24" y2="22" />
        <line x1="30" y1="36" x2="22" y2="28" />
      </g>
    </svg>
  );
}

interface Note {
  text: string;
  emoji: string;
  boxed?: boolean;
}

function NoteItem({ note, side }: { note: Note; side: 'left' | 'right' }) {
  const emoji = <span className="note__emoji">{note.emoji}</span>;
  return (
    <div className={`note note--${side}`}>
      {side === 'right' && emoji}
      <span className={`note__body ${note.boxed ? 'note--boxed' : ''}`}>
        <span className="note__text">{note.text}</span>
      </span>
      {side === 'left' && emoji}
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="about">
      <div className="about__inner">
        <p className="signoff">{about.signoff}</p>

        <span className="sticker sticker--tl">🌺</span>
        <span className="sticker sticker--tr">🌸</span>

        <p className="about__hi">{about.greeting} ↓</p>
        <h2 className="about__title">
          <Burst flip />
          <small>about</small>
          <span>
            {[...about.name].map((ch, i) => (
              <b key={i} style={{ transform: `rotate(${((i * 37) % 11) - 5}deg)` }}>
                {ch}
              </b>
            ))}
          </span>
          <Burst />
        </h2>
        <p className="about__role">{about.role}</p>

        <div className="collage">
          <div className="notes notes--left">
            {about.leftNotes.map((n) => (
              <NoteItem key={n.text} note={n} side="left" />
            ))}
          </div>

          <figure className="cutout">
            <img src={`${import.meta.env.BASE_URL}${about.photo}`} alt={`Photo of ${about.name}`} />
            <p className="memo">{about.memo}</p>
            <span className="sticker sticker--mic" aria-hidden>
              🎙️
            </span>
          </figure>

          <div className="notes notes--right">
            {about.rightNotes.map((n) => (
              <NoteItem key={n.text} note={n} side="right" />
            ))}
          </div>
        </div>

        <span className="sticker sticker--bl">📸</span>
        <span className="sticker sticker--br">📌</span>
      </div>
    </div>
  );
}
