import React from 'react';

export function DashboardHeader({ t, username, mobileOpen, onMenuClick }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="rounded-3xl border border-app-line bg-gradient-to-r from-white to-cyan-50 p-6 shadow-sm">
      <button
        className="mb-4 inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-app-line bg-white px-3 lg:hidden"
        onClick={onMenuClick}
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? t('dashboard.menu.close', 'Close menu') : t('dashboard.menu.open', 'Open menu')}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
      <p className="text-sm font-medium text-app-muted">{today}</p>
      <h1 className="mt-1 text-3xl font-bold text-app-ink">{t('dashboard.header.welcomeBack', 'Welcome back')}, {username}</h1>
      <p className="mt-2 text-app-muted">{t('dashboard.header.subtitle', "Here is your recovery progress for today.")}</p>
    </header>
  );
}
