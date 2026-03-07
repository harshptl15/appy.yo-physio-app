import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePhysioLanguage } from '../hooks/usePhysioLanguage';
import { SidebarNav } from '../components/SidebarNav';
import { DashboardHeader } from '../components/DashboardHeader';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { ProgressSection, StatCard } from '../components/StatCard';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { fetchJson } from '../utils/http';

function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, options);
}

function formatDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function DashboardPage({ data }) {
  const { t } = usePhysioLanguage();
  const drawerAnimationMs = 200;
  const [mobileMounted, setMobileMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState('');
  const closeTimerRef = useRef(null);
  const { dashboardData, isLoading, error, refresh } = useDashboardSummary(data);

  const metrics = dashboardData?.metrics || null;

  const openMobileMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMobileMounted(true);
    requestAnimationFrame(() => {
      setMobileOpen(true);
    });
  };

  const closeMobileMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    setMobileOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setMobileMounted(false);
      closeTimerRef.current = null;
    }, drawerAnimationMs);
  };

  const toggleMobileMenu = () => {
    if (mobileOpen) {
      closeMobileMenu();
      return;
    }
    openMobileMenu();
  };

  useEffect(() => {
    if (!mobileMounted) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMounted]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const lastWorkoutValue = useMemo(() => {
    if (!metrics?.lastWorkoutAt) {
      return t('dashboard.empty.noWorkouts', 'No workouts yet');
    }

    const title = metrics.lastWorkoutTitle || t('dashboard.workout.defaultTitle', 'Completed workout');
    const dateLabel = formatDate(metrics.lastWorkoutAt);
    return dateLabel ? `${title} · ${dateLabel}` : title;
  }, [metrics?.lastWorkoutAt, metrics?.lastWorkoutTitle, t]);

  const nextRestLabel = useMemo(() => {
    const dateLabel = formatDate(metrics?.nextRestDate, { weekday: 'long' });
    return dateLabel || t('dashboard.empty.notScheduled', 'Not scheduled');
  }, [metrics?.nextRestDate, t]);

  const nextWorkoutLabel = useMemo(() => {
    return formatDateTime(metrics?.nextScheduledWorkoutAt) || t('dashboard.empty.notScheduled', 'Not scheduled');
  }, [metrics?.nextScheduledWorkoutAt, t]);

  const onNotificationClick = async (id) => {
    if (!id) return;
    try {
      await fetch(`/api/notifications/${id}/click`, { method: 'POST' });
      refresh();
    } catch (_) {
      // no-op
    }
  };

  const onCheckinSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setStatus(t('dashboard.checkin.saving', 'Saving...'));

    const payload = {
      notificationId: Number(form.get('notificationId') || 0),
      mood: String(form.get('mood') || '').trim(),
      painAvg: form.get('painAvg'),
      mobilityRating: form.get('mobilityRating'),
      notes: String(form.get('notes') || '').trim()
    };

    try {
      await fetchJson('/api/progress-checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setStatus(t('dashboard.checkin.saved', 'Check-in saved.'));
      event.currentTarget.reset();
      refresh();
    } catch (submitError) {
      setStatus(submitError.message || t('dashboard.checkin.failed', 'Failed to submit check-in.'));
    }
  };

  return (
    <div className="min-h-screen bg-app-bg lg:flex">
      <SidebarNav
        t={t}
        username={dashboardData?.user?.username || 'Member'}
        currentPath={dashboardData?.currentPath || '/dashboard'}
        mobileMounted={mobileMounted}
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <main className="w-full p-4 sm:p-6 lg:p-8">
        <DashboardHeader
          t={t}
          username={dashboardData?.user?.username || 'Member'}
          mobileOpen={mobileOpen}
          onMenuClick={toggleMobileMenu}
        />

        {error ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t('dashboard.stat.streakNew', 'Current streak')}
            value={metrics ? `${metrics.streakDays} ${t('dashboard.unit.days', 'days')}` : t('dashboard.loading', 'Loading...')}
            support={t('dashboard.stat.streakSupport', 'Keep your recovery momentum')}
          />
          <StatCard
            label={t('dashboard.stat.lastWorkoutNew', 'Last completed workout')}
            value={metrics ? lastWorkoutValue : t('dashboard.loading', 'Loading...')}
            support={t('dashboard.stat.lastWorkoutSupport', 'Latest completed session')}
          />
          <StatCard
            label={t('dashboard.stat.nextRestNew', 'Next rest day')}
            value={metrics ? nextRestLabel : t('dashboard.loading', 'Loading...')}
            support={metrics ? `${t('dashboard.stat.nextWorkout', 'Next workout')}: ${nextWorkoutLabel}` : t('dashboard.loading', 'Loading...')}
          />
          <StatCard
            label={t('dashboard.stat.goalProgressNew', 'Goal progress')}
            value={metrics ? `${metrics.goalProgressPercent}%` : t('dashboard.loading', 'Loading...')}
            support={metrics ? `${metrics.completedGoals}/${metrics.totalGoals} ${t('dashboard.goal.completed', 'goals completed')}` : t('dashboard.loading', 'Loading...')}
          />
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          <a href="/workouts"><PrimaryButton>{t('dashboard.cta.startWorkoutNew', 'Start workout')}</PrimaryButton></a>
          <a href="/goals"><SecondaryButton>{t('dashboard.cta.goalsNew', 'View goals')}</SecondaryButton></a>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            {dashboardData?.routineRecommendation ? (
              <article className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-app-ink">{t('dashboard.todayPlan', "Today's plan")}</h2>
                <p className="mt-2 text-sm text-app-muted"><strong>{dashboardData.routineRecommendation.title}</strong> · {dashboardData.routineRecommendation.duration} min · {dashboardData.routineRecommendation.difficulty}</p>
                <p className="mt-2 text-sm text-app-muted">{dashboardData.routineRecommendation.rationale}</p>
                <a
                  href={dashboardData.routineRecommendation.ctaLink}
                  onClick={() => onNotificationClick(dashboardData.routineRecommendation.notificationId)}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-app-accent px-4 text-sm font-semibold text-white hover:bg-app-accentDark"
                >
                  {dashboardData.routineRecommendation.ctaLabel}
                </a>
              </article>
            ) : (
              <article className="rounded-2xl border border-app-line bg-white p-5 text-sm text-app-muted shadow-sm">
                {isLoading
                  ? t('dashboard.loading.plan', 'Loading your plan...')
                  : t('dashboard.empty.plan', 'No routine recommendation yet. Start a workout to generate a plan.')}
              </article>
            )}

            {(dashboardData?.inAppNotificationCards || []).map((card) => (
              <article key={card.id} className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold capitalize text-app-ink">{String(card.type || '').replaceAll('_', ' ')}</h3>
                <p className="mt-2 text-sm text-app-muted">{card.message}</p>
                <a
                  href={card.ctaLink}
                  onClick={() => onNotificationClick(card.id)}
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-app-line bg-slate-50 px-4 text-sm font-semibold text-app-ink hover:bg-slate-100"
                >
                  {card.ctaLabel}
                </a>
              </article>
            ))}

            {dashboardData?.progressCheckInPrompt ? (
              <article className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-app-ink">{t('dashboard.checkin.title', 'Weekly progress check-in')}</h3>
                <p className="mt-2 text-sm text-app-muted">{dashboardData.progressCheckInPrompt.message}</p>
                <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onCheckinSubmit}>
                  <input type="hidden" name="notificationId" value={dashboardData.progressCheckInPrompt.notificationId} />
                  <input name="mood" placeholder={t('dashboard.checkin.mood', 'Mood (optional)')} className="h-11 rounded-xl border border-app-line px-3 text-sm focus:border-app-accent focus:outline-none" />
                  <input type="number" min="0" max="10" name="painAvg" placeholder={t('dashboard.checkin.pain', 'Average pain (0-10)')} className="h-11 rounded-xl border border-app-line px-3 text-sm focus:border-app-accent focus:outline-none" />
                  <input type="number" min="1" max="5" name="mobilityRating" placeholder={t('dashboard.checkin.mobility', 'Mobility rating (1-5)')} className="h-11 rounded-xl border border-app-line px-3 text-sm focus:border-app-accent focus:outline-none" />
                  <input name="notes" placeholder={t('dashboard.checkin.notes', 'Notes (optional)')} className="h-11 rounded-xl border border-app-line px-3 text-sm focus:border-app-accent focus:outline-none" />
                  <div className="sm:col-span-2">
                    <PrimaryButton type="submit">{t('dashboard.checkin.submit', 'Submit check-in')}</PrimaryButton>
                    {status ? <p className="mt-2 text-sm text-app-muted">{status}</p> : null}
                  </div>
                </form>
              </article>
            ) : null}
          </div>

          <div className="space-y-4">
            <ProgressSection
              title={t('dashboard.progress.weekly', 'Weekly completion')}
              value={metrics ? metrics.weeklyCompletionPercent : 0}
            />
            <article className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-app-ink">{t('dashboard.tip.title', 'Recovery tip')}</h3>
              <p className="mt-2 text-sm text-app-muted">{t('dashboard.tip.body', 'Short mobility sessions on rest days can improve consistency and lower next-day soreness.')}</p>
            </article>
            <article className="rounded-2xl border border-app-line bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-app-ink">{t('dashboard.reminder.title', 'Upcoming routine')}</h3>
              <p className="mt-2 text-sm text-app-muted">{metrics ? `${t('dashboard.stat.nextWorkout', 'Next workout')}: ${nextWorkoutLabel}` : t('dashboard.loading', 'Loading...')}</p>
              <a href="/showRoutine" className="mt-3 inline-flex text-sm font-semibold text-app-accent hover:text-app-accentDark">{t('dashboard.reminder.link', 'View routine')}</a>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
