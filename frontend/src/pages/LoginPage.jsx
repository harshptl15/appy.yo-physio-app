import React, { useState } from 'react';
import { AuthCard, AuthLayout } from '../components/AuthLayout';
import { InputField } from '../components/InputField';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton } from '../components/Button';
import { usePhysioLanguage } from '../hooks/usePhysioLanguage';
import { parseJsonResponse } from '../utils/http';

export function LoginPage() {
  const { t } = usePhysioLanguage();
  const [form, setForm] = useState({ name: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const parsed = await parseJsonResponse(response);
      const payload = parsed.isJson ? parsed.data : null;

      if (!response.ok) {
        if (payload?.errors) {
          setErrors(payload.errors);
        } else if (payload?.error) {
          if (payload.error.includes('User not found')) {
            setErrors({ name: payload.error });
          } else if (payload.error.includes('Invalid credentials')) {
            setErrors({ password: payload.error });
          } else {
            alert(payload.error);
          }
        } else {
          alert('Unable to sign in right now. Please try again.');
        }
        return;
      }

      window.location.href = payload?.twofaRequired ? '/twofa/verify' : '/dashboard';
    } catch (_) {
      alert('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={t('auth.panel.eyebrow', 'Personalized Recovery Companion')}
      title={t('auth.panel.title', 'Move better with a plan built around your recovery.')}
      subtitle={t('auth.panel.subtitle', 'Stay consistent with guided routines, progress insights, and secure account access.')}
    >
      <AuthCard>
        <a href="/" className="text-sm font-medium text-app-muted hover:text-app-ink">{t('auth.backHome', 'Back to home')}</a>
        <h2 className="mt-6 text-3xl font-bold text-app-ink">{t('auth.login.welcomeBack', 'Welcome back')}</h2>
        <p className="mt-2 text-sm text-app-muted">{t('auth.login.subtitle.new', 'Sign in to continue your recovery plan and track your progress.')}</p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <InputField
            id="name"
            label={t('auth.usernameOrEmail', 'Username or Email')}
            placeholder={t('auth.placeholder.emailOrUsername', 'Enter your username or email')}
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            error={errors.name}
            autoComplete="username"
            required
          />
          <PasswordField
            id="password"
            label={t('auth.password', 'Password')}
            placeholder={t('auth.placeholder.password', 'Enter your password')}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-app-muted">{t('auth.security.reassurance', 'Secure account access')}</span>
            <a href="/forgot-password" className="font-semibold text-app-accent hover:text-app-accentDark">{t('auth.forgotPassword', 'Forgot password?')}</a>
          </div>

          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.loading', 'Please wait...') : t('auth.login.signIn', 'Sign in')}
          </PrimaryButton>
        </form>

        <p className="mt-6 text-sm text-app-muted">
          {t('auth.login.createAccountPrompt', "Don't have an account?")}{' '}
          <a className="font-semibold text-app-accent hover:text-app-accentDark" href="/register">
            {t('auth.login.createAccountLink', 'Create one')}
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
