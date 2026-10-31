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

export function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-heading">
      <h2 className="page-heading__title">{title}</h2>
      <p className="page-heading__sub">{subtitle}</p>
    </div>
  );
}
