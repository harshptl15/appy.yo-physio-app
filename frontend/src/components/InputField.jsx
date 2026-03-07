import React from 'react';

export function InputField({
  id,
  label,
  error,
  helper,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-app-ink">
        {label}
      </label>
      <input
        id={id}
        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-app-ink placeholder:text-app-muted/80 focus:border-app-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-app-accent/25 ${error ? 'border-red-500' : 'border-app-line'} ${className}`}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && helper ? <p className="text-xs text-app-muted">{helper}</p> : null}
    </div>
  );
}
