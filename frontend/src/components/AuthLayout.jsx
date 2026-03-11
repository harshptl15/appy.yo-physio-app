import React from 'react';

export function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-3xl border border-app-line bg-white shadow-soft md:min-h-[calc(100vh-4rem)] md:grid-cols-2">
        <section className="relative hidden bg-gradient-to-br from-[#e5f6f5] via-[#d7edf3] to-[#dce9ff] p-12 md:flex md:flex-col md:justify-between">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-app-accent/25 blur-2xl" />
          <div className="absolute bottom-10 left-10 h-36 w-36 rounded-full bg-cyan-200/70 blur-xl" />
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-app-ink">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-app-accent text-white">P</span>
              PhysioFit
            </a>
            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">{eyebrow}</p>
            <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight text-app-ink">{title}</h1>
            <p className="mt-4 max-w-md text-base text-app-muted">{subtitle}</p>
          </div>
          <p className="max-w-sm text-sm text-app-muted">Your recovery data stays private and your plan adapts to your progress.</p>
        </section>
        <section className="flex items-center justify-center bg-app-bg/50 p-4 sm:p-8">{children}</section>
      </div>
    </div>
  );
}

export function AuthCard({ children }) {
  return (
    <div className="w-full max-w-[480px] rounded-3xl border border-app-line bg-white p-6 shadow-soft sm:p-8">{children}</div>
  );
}
