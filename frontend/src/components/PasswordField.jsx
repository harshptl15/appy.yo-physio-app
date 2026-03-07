import React, { useState } from 'react';

export function PasswordField({ id, label, error, helper, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-app-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`h-12 w-full rounded-xl border bg-slate-50 px-4 pr-16 text-sm text-app-ink placeholder:text-app-muted/80 focus:border-app-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-accent/25 ${error ? 'border-red-500' : 'border-app-line'}`}
          {...props}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-app-muted hover:bg-slate-100"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && helper ? <p className="text-xs text-app-muted">{helper}</p> : null}
    </div>
  );
}
