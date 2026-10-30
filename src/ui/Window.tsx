import type { ReactNode } from 'react';

/** Retro OS-style window with a title bar, used for every panel. */
export function Window({
  title,
  children,
  tone = 'pink',
  className = '',
  onClose,
}: {
  title: string;
  children: ReactNode;
  tone?: 'pink' | 'green' | 'violet' | 'cream';
  className?: string;
  onClose?: () => void;
}) {
  return (
    <section className={`win win--${tone} ${className}`}>
      <header className="win__bar">
        <span className="win__dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <h3 className="win__title">{title}</h3>
        {onClose ? (
          <button type="button" className="win__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        ) : (
          <span className="win__close win__close--fake" aria-hidden>
            ▢
          </span>
        )}
      </header>
      <div className="win__body">{children}</div>
    </section>
  );
}

export function LevelHeading({ level, title, subtitle }: { level: string; title: string; subtitle: string }) {
  return (
    <div className="level-heading">
      <h2 className="level-heading__level">Level {level}</h2>
      <p className="level-heading__sub">{subtitle}</p>
      <p className="level-heading__title">{title}</p>
    </div>
  );
}
