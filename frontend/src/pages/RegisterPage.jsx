import React, { useMemo, useState } from 'react';
import { AuthCard, AuthLayout } from '../components/AuthLayout';
import { InputField } from '../components/InputField';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { usePhysioLanguage } from '../hooks/usePhysioLanguage';
import { parseJsonResponse } from '../utils/http';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { t } = usePhysioLanguage();
  const [form, setForm] = useState({ email: '', name: '', password: '', confirmPassword: '', termsAccepted: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordHint = useMemo(() => {
    if (form.password.length === 0) return t('auth.register.passwordHint', 'Use at least 6 characters.');
    if (form.password.length < 6) return t('auth.register.passwordWeak', 'Password is too short.');
    return t('auth.register.passwordGood', 'Password length looks good.');
  }, [form.password, t]);

  const validateInline = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(form.email)) next.email = 'Invalid email format.';
    if (!form.name.trim()) next.name = 'Username is required.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.';
    if (!form.termsAccepted) next.terms = 'You must agree to the terms and conditions.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validateInline()) return;
    setLoading(true);

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const parsed = await parseJsonResponse(response);
      const payload = parsed.isJson ? parsed.data : null;

      if (!response.ok) {
        if (payload?.errors) setErrors(payload.errors);
        else if (payload?.error) alert(payload.error);
        else alert('Unable to create account right now. Please try again.');
        return;
      }

      window.location.href = '/login';
    } catch (_) {
      alert('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setForm({ email: '', name: '', password: '', confirmPassword: '', termsAccepted: false });
    setErrors({});
  };

  return (
    <AuthLayout
      eyebrow={t('auth.panel.eyebrow', 'Personalized Recovery Companion')}
      title={t('auth.panel.title', 'Move better with a plan built around your recovery.')}
      subtitle={t('auth.panel.subtitle', 'Stay consistent with guided routines, progress insights, and secure account access.')}
    >
      <AuthCard>
        <a href="/" className="text-sm font-medium text-app-muted hover:text-app-ink">{t('auth.backHome', 'Back to home')}</a>
        <h2 className="mt-6 text-3xl font-bold text-app-ink">{t('auth.register.createTitle', 'Create your account')}</h2>
        <p className="mt-2 text-sm text-app-muted">{t('auth.register.subtitle.new', 'Start your recovery journey with a personalized physio experience.')}</p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <InputField
            id="email"
            type="email"
            label={t('auth.register.email', 'Email')}
            placeholder={t('auth.placeholder.email', 'Enter your email')}
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
            required
          />
          <InputField
            id="name"
            label={t('auth.username', 'Username')}
            placeholder={t('auth.placeholder.username', 'Choose a username')}
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            autoComplete="username"
            required
          />
          <PasswordField
            id="password"
            label={t('auth.password', 'Password')}
            placeholder={t('auth.placeholder.createPassword', 'Create a password')}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            helper={passwordHint}
            autoComplete="new-password"
            required
          />
          <PasswordField
            id="confirmPassword"
            label={t('auth.register.retypePassword', 'Confirm Password')}
            placeholder={t('auth.placeholder.confirmPassword', 'Confirm your password')}
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <div className="rounded-xl border border-app-line bg-slate-50 p-4">
            <label className="flex items-start gap-3 text-sm text-app-muted">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-app-line text-app-accent focus:ring-app-accent"
                checked={form.termsAccepted}
                onChange={(e) => setForm((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
              />
              <span>
                {t('auth.register.termsLead', 'I agree to the')}{' '}
                <a href="/terms" className="font-semibold text-app-accent hover:text-app-accentDark">{t('auth.register.termsLink', 'Terms & Conditions')}</a>{' '}
                {t('auth.register.and', 'and')}{' '}
                <a href="/privacy" className="font-semibold text-app-accent hover:text-app-accentDark">{t('auth.register.privacyLink', 'Privacy Policy')}</a>.
              </span>
            </label>
            {errors.terms ? <p className="mt-2 text-sm text-red-600">{errors.terms}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? t('auth.loading', 'Please wait...') : t('auth.register.createButton', 'Create account')}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={onClear}>{t('auth.register.clear', 'Clear')}</SecondaryButton>
          </div>
        </form>

        <p className="mt-6 text-sm text-app-muted">
          {t('auth.register.signInPrompt', 'Already have an account?')}{' '}
          <a className="font-semibold text-app-accent hover:text-app-accentDark" href="/login">
            {t('auth.register.signInLink', 'Sign in')}
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
