import React from 'react';

const base = 'inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

export function PrimaryButton({ className = '', ...props }) {
  return (
    <button
      className={`${base} bg-app-accent text-white shadow-soft hover:bg-app-accentDark ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = '', ...props }) {
  return (
    <button
      className={`${base} border border-app-line bg-white text-app-ink hover:bg-slate-50 ${className}`}
      {...props}
    />
  );
}
