import React from 'react';

export function StatCard({ label, value, support }) {
  return (
    <article className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-app-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-app-ink">{value}</p>
      <p className="mt-1 text-xs text-app-muted">{support}</p>
    </article>
  );
}

export function ProgressSection({ title, value }) {
  return (
    <section className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-app-ink">{title}</h3>
        <span className="text-sm font-semibold text-app-accent">{value}%</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-app-accent to-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </section>
  );
}
