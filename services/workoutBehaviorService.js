const PLAN_HEURISTICS = {
  15: { minExercises: 3, maxExercises: 3 },
  20: { minExercises: 4, maxExercises: 4 },
  30: { minExercises: 5, maxExercises: 6 },
  45: { minExercises: 7, maxExercises: 8 },
  60: { minExercises: 9, maxExercises: 10 }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getPlanConstraintsFromDuration = (durationMinutes, availableExerciseCount) => {
  const heuristic = PLAN_HEURISTICS[durationMinutes] || PLAN_HEURISTICS[30];
  const targetExerciseCount = clamp(
    heuristic.maxExercises,
    heuristic.minExercises,
    Math.max(1, availableExerciseCount)
  );

  const warmupMinutes = 5;
  const perExerciseMinutes = Math.max(3, Math.floor((durationMinutes - warmupMinutes) / targetExerciseCount));
  const estimatedDurationMinutes = warmupMinutes + perExerciseMinutes * targetExerciseCount;

  return {
    warmupIncluded: true,
    warmupMinutes,
    perExerciseMinutes,
    targetExerciseCount,
    estimatedDurationMinutes
  };
};

const isSuccessfulSession = (session, painFeedback) => {
  const completionRatio = Number(session?.completion_ratio || 0);
  const painScore = painFeedback ? Number(painFeedback.pain_score) : null;
  return completionRatio >= 0.9 && (painScore === null || painScore <= 3);
};

const computeDifficultyAdjustment = ({
  autoAdjustEnabled,
  conservativeProgressionEnabled,
  painFeedbackAfterWorkoutsEnabled,
  currentDifficulty,
  completionRatio,
  latestPainFeedback,
  recentSessions,
  recentFeedbackBySessionId
}) => {
  const before = Number(currentDifficulty || 1.0);

  if (!autoAdjustEnabled) {
    return {
      difficultyAfter: before,
      adjustmentReason: 'Auto-adjust disabled. Difficulty kept fixed.',
      conservativeProgressionApplied: false
    };
  }

  const painScore = latestPainFeedback ? Number(latestPainFeedback.pain_score) : null;
  const painTrend = latestPainFeedback ? latestPainFeedback.trend : null;
  const completion = Number(completionRatio || 0);

  let delta = 0;
  let reason = 'No adjustment applied.';

  if (painFeedbackAfterWorkoutsEnabled && painScore !== null && painScore >= 7) {
    delta = conservativeProgressionEnabled ? -0.06 : -0.1;
    reason = 'High pain score detected; reducing intensity/volume.';
  } else if (painTrend === 'worse') {
    delta = conservativeProgressionEnabled ? -0.04 : -0.08;
    reason = 'Pain trend worsened; reducing next session difficulty.';
  } else if (completion < 0.8) {
    delta = conservativeProgressionEnabled ? -0.03 : -0.06;
    reason = 'Low completion ratio; reducing next session difficulty.';
  } else {
    const canProgress = completion >= 0.95 && (!painFeedbackAfterWorkoutsEnabled || painScore === null || painScore <= 2);

    if (canProgress) {
      if (conservativeProgressionEnabled) {
        const recent = (recentSessions || []).slice(0, 2);
        const successfulCount = recent.filter((session) => {
          const feedback = recentFeedbackBySessionId[session.id] || null;
          return isSuccessfulSession(session, feedback);
        }).length;

        if (painFeedbackAfterWorkoutsEnabled && painScore !== null && painScore >= 4) {
          delta = 0;
          reason = 'Pain score is 4 or higher; conservative mode blocked progression.';
        } else if (successfulCount >= 2) {
          delta = 0.03;
          reason = 'Conservative progression: increasing difficulty by ~3% after 2 successful sessions.';
        } else {
          delta = 0;
          reason = 'Conservative progression requires 2 successful sessions before increasing.';
        }
      } else {
        delta = 0.07;
        reason = 'Strong completion and low pain; increasing difficulty by ~7%.';
      }
    }
  }

  const difficultyAfter = Number((before + delta).toFixed(2));

  return {
    difficultyAfter,
    adjustmentReason: reason,
    conservativeProgressionApplied: !!conservativeProgressionEnabled
  };
};

module.exports = {
  getPlanConstraintsFromDuration,
  computeDifficultyAdjustment
};
