import React from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader({
  title,
  subtitle,
  rightContent = null,
  maxWidthClass = 'max-w-6xl',
}) {
  return (
    <header
      style={{ backgroundColor: 'var(--color-primary)' }}
      className="sticky top-0 z-40 shadow-md"
    >
      <div
        className={`${maxWidthClass} mx-auto px-4 py-4 sm:py-6 flex items-start justify-between gap-4`}
      >
        <div className="flex-1 min-w-0">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm sm:text-base uppercase tracking-[0.28em] font-bold text-white/80 mb-2 transition hover:text-white focus:outline-none focus:text-white"
          >
            Grooming Hub
          </Link>
          <h1 className="text-[1.85rem] sm:text-[2.1rem] leading-tight font-semibold text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-white/80 mt-2 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>

        {rightContent ? <div className="flex-shrink-0">{rightContent}</div> : null}
      </div>
    </header>
  );
}
