import React from 'react';

const navGroups = [
  {
    titleKey: 'sidebar.group.main',
    items: [
      { href: '/dashboard', key: 'common.nav.dashboard', fallback: 'Dashboard', icon: '🏠' },
      { href: '/muscleGroup?fresh=1', key: 'dashboard.nav.exercises', fallback: 'Exercises', icon: '💪' },
      { href: '/showRoutine', key: 'dashboard.nav.routines', fallback: 'Routines', icon: '📅' },
      { href: '/goals', key: 'dashboard.nav.viewGoals', fallback: 'View goals', icon: '🎯' },
      { href: '/getAndShowFavourites', key: 'dashboard.nav.favourites', fallback: 'Favourites', icon: '⭐' }
    ]
  },
  {
    titleKey: 'sidebar.group.support',
    items: [
      { href: '/info', key: 'dashboard.nav.howto', fallback: 'How to Use', icon: '📘' },
      { href: '/about', key: 'dashboard.nav.about', fallback: 'About Us', icon: 'ℹ️' }
    ]
  },
  {
    titleKey: 'sidebar.group.account',
    items: [
      { href: '/settings', key: 'dashboard.nav.settings', fallback: 'Settings', icon: '⚙️' },
      { href: '/twofa/setup', key: 'dashboard.nav.enable2fa', fallback: 'Enable 2FA', icon: '🔒' },
      { href: '/twofa/disable', key: 'dashboard.nav.disable2fa', fallback: 'Disable 2FA', icon: '🔓' }
    ]
  }
];

function SideContent({ t, username, currentPath, onNavigate, mobile = false }) {
  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PhysioFit</p>
        <p className="mt-2 text-lg font-semibold">{t('dashboard.header.welcomeBack', 'Welcome back')}, {username}</p>
        <p className="text-sm text-slate-400">{t('dashboard.header.subtitle', "Here is your recovery progress for today.")}</p>
      </div>

      <nav className="mt-6 min-h-0 flex-1 space-y-5 overflow-y-auto pb-3 pr-1">
        {navGroups.map((group) => (
          <div key={group.titleKey}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t(group.titleKey, group.titleKey)}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const normalizedHref = item.href.includes('?') ? item.href.split('?')[0] : item.href;
                const isActive = currentPath === normalizedHref;

                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                        isActive
                          ? 'bg-slate-700/70 text-white'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span>{t(item.key, item.fallback)}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <a
        href="/logout"
        onClick={onNavigate}
        className={`mt-4 inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-sm font-semibold text-white hover:bg-slate-800 ${
          mobile ? 'mb-20' : 'mb-2'
        }`}
      >
        {t('dashboard.logout', 'Logout')}
      </a>
    </div>
  );
}

export function SidebarNav({ t, username, currentPath, mobileMounted, mobileOpen, onClose }) {
  const handleNavigate = () => {
    onClose();
  };

  return (
    <>
      <aside className="hidden min-h-0 w-72 border-r border-slate-800 bg-app-nav px-5 py-6 text-slate-100 lg:flex lg:h-[100dvh] lg:flex-col lg:overflow-hidden">
        <SideContent t={t} username={username} currentPath={currentPath} onNavigate={handleNavigate} />
      </aside>

      {mobileMounted ? (
        <>
          <button
            className={`fixed inset-0 z-20 bg-slate-950/50 transition-opacity duration-200 lg:hidden ${
              mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={onClose}
            aria-label={t('dashboard.menu.close', 'Close navigation')}
          />
          <aside
            className={`fixed inset-y-0 left-0 z-30 flex h-[100dvh] min-h-0 w-80 flex-col overflow-hidden border-r border-slate-800 bg-app-nav px-5 pb-10 pt-6 text-slate-100 shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <SideContent t={t} username={username} currentPath={currentPath} onNavigate={handleNavigate} mobile />
          </aside>
        </>
      ) : null}
    </>
  );
}
