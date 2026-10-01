const FIDELITY_TIER_META = [
  {
    key: 'bronze',
    label: 'Bronzo',
    activeBackground: '#f6e3cf',
    activeBorder: '#cd7f32',
    activeText: '#7c4a21',
  },
  {
    key: 'silver',
    label: 'Argento',
    activeBackground: '#eef2f7',
    activeBorder: '#94a3b8',
    activeText: '#334155',
  },
  {
    key: 'gold',
    label: 'Oro',
    activeBackground: '#fff3bf',
    activeBorder: '#d4a017',
    activeText: '#7a5c00',
  },
];

const INACTIVE_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: 'var(--color-border)',
  textColor: 'var(--color-secondary)',
};

const getCutoffDate = (monthsWindow, now) => {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - monthsWindow);
  return date;
};

const countVisitsInWindow = (visits = [], monthsWindow, now) => {
  const cutoff = getCutoffDate(monthsWindow, now);

  return visits.filter((visit) => {
    const visitDate = new Date(`${visit.date}T00:00:00`);
    return !Number.isNaN(visitDate.getTime()) && visitDate >= cutoff;
  }).length;
};

const toPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getFidelityTiers = (settings) => {
  const configured = settings?.fidelity_tiers;
  if (!configured || typeof configured !== 'object' || Array.isArray(configured)) return [];

  const tiers = FIDELITY_TIER_META.map((meta) => {
    const threshold = configured[meta.key];
    const visitsRequired = toPositiveInteger(threshold?.visits_required);
    const monthsWindow = toPositiveInteger(threshold?.months_window);
    const pointsRequired = toPositiveInteger(threshold?.points_required);
    if (!visitsRequired || !monthsWindow || !pointsRequired) return null;
    return { ...meta, visitsRequired, monthsWindow, pointsRequired };
  });

  return tiers.every(Boolean) ? tiers : [];
};

// Calendar months, including the fraction between monthly anniversaries.
const historyMonths = (start, today) => {
  let months = (today.getUTCFullYear() - start.getUTCFullYear()) * 12
    + today.getUTCMonth() - start.getUTCMonth();
  const anniversary = (offset) => {
    const value = new Date(start);
    value.setUTCDate(1);
    value.setUTCMonth(value.getUTCMonth() + offset);
    const lastDay = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + 1, 0)).getUTCDate();
    value.setUTCDate(Math.min(start.getUTCDate(), lastDay));
    return value;
  };
  if (anniversary(months) > today) months -= 1;
  return months + (today - anniversary(months)) / (anniversary(months + 1) - anniversary(months));
};

export const getFidelityTierSnapshot = (client, settings = client?.fidelitySettings, now = new Date()) => {
  const visits = Array.isArray(client?.visits) ? client.visits : [];
  const rewardPointsTotal = Number(client?.rewardPointsTotal || 0);
  const hasRewardPoints = rewardPointsTotal > 0;

  const dayParts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(now)).map(({ type, value }) => [type, value]));
  const todayKey = `${dayParts.year}-${dayParts.month}-${dayParts.day}`;
  const today = new Date(`${todayKey}T00:00:00Z`);
  const projection = settings?.fidelity_projection;
  const historyDate = projection?.history_start;
  const historyStart = typeof historyDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(historyDate)
    ? new Date(`${historyDate}T00:00:00Z`) : null;
  const historyEnabled = Array.isArray(projection?.tiers) && projection.tiers.includes('bronze')
    && historyStart && !Number.isNaN(historyStart.getTime())
    && historyStart.toISOString().slice(0, 10) === historyDate && historyStart <= today;
  const monthsObserved = historyEnabled ? historyMonths(historyStart, today) : null;

  const tiers = getFidelityTiers(settings).map((configuredTier) => {
    const projected = Boolean(historyEnabled && configuredTier.key === 'bronze' && monthsObserved < configuredTier.monthsWindow);
    const visitsRequired = projected
      ? Math.ceil(configuredTier.visitsRequired * monthsObserved / configuredTier.monthsWindow)
      : configuredTier.visitsRequired;
    const tier = { ...configuredTier, visitsRequired };
    const visitsInWindow = projected
      ? visits.filter(visit => visit.date >= historyDate && visit.date <= todayKey).length
      : countVisitsInWindow(visits, tier.monthsWindow, now);
    const achievedByVisits = visitsInWindow >= tier.visitsRequired;
    const achievedByPoints = rewardPointsTotal >= tier.pointsRequired;
    const achieved = achievedByVisits || achievedByPoints;

    return {
      ...tier,
      projected,
      historyStart: projected ? historyDate : null,
      visitsInWindow,
      rewardPointsTotal,
      achievedByVisits,
      achievedByPoints,
      achieved,
      remainingVisits: Math.max(0, tier.visitsRequired - visitsInWindow),
      remainingPoints: Math.max(0, tier.pointsRequired - rewardPointsTotal),
      style: achieved
        ? {
            backgroundColor: tier.activeBackground,
            borderColor: tier.activeBorder,
            textColor: tier.activeText,
          }
        : INACTIVE_STYLE,
    };
  });

  const calculatedTier =
    [...tiers].reverse().find((tier) => tier.achieved) || null;
  const visitTier = [...tiers].reverse().find((tier) => tier.achievedByVisits) || null;
  const pointsTier = [...tiers].reverse().find((tier) => tier.achievedByPoints) || null;
  const tierRank = (tier) => tiers.findIndex((candidate) => candidate.key === tier?.key);
  const awardedTier = tiers.find((tier) => tier.key === client?.awarded_fidelity_tier) || null;
  const currentTier = tierRank(awardedTier) > tierRank(calculatedTier)
    ? awardedTier
    : calculatedTier;
  const currentTierRank = tierRank(currentTier);
  const nextTier = tiers.find((tier) => tierRank(tier) > currentTierRank) || null;
  const mode = tierRank(pointsTier) > tierRank(visitTier) ? 'points' : 'visits';
  const awardedTierRank = tierRank(awardedTier);
  const scaleTiers = tiers.map((tier) => {
    const reachedByAward = !tier.achieved && tierRank(tier) <= awardedTierRank;
    const reached = tier.achieved || reachedByAward;

    return {
      ...tier,
      scaleReached: reached,
      scaleReachedByAward: reachedByAward,
      scaleRemainingVisits: reached ? 0 : tier.remainingVisits,
      scaleRemainingPoints: reached ? 0 : tier.remainingPoints,
    };
  });

  return {
    currentTier,
    nextTier,
    calculatedTier,
    awardedTier,
    currentTierSource: tierRank(awardedTier) > tierRank(calculatedTier) ? 'awarded' : mode,
    visitTier,
    pointsTier,
    tiers: scaleTiers,
    mode,
    hasRewardPoints,
    rewardPointsTotal,
  };
};

export const getFidelityBadgeStyle = (tierKey) => {
  if (tierKey === 'gold') {
    return { backgroundColor: '#fff3bf', color: '#7a5c00' };
  }
  if (tierKey === 'silver') {
    return { backgroundColor: '#eef2f7', color: '#334155' };
  }
  if (tierKey === 'bronze') {
    return { backgroundColor: '#f6e3cf', color: '#7c4a21' };
  }
  return { backgroundColor: 'var(--color-bg-main)', color: 'var(--color-secondary)' };
};

export const getStaffFidelityTierReason = (snapshot) => {
  const tier = snapshot?.currentTier;
  if (!tier) return '';
  if (snapshot.currentTierSource === 'awarded') {
    return `${tier.label} · conferito dal salone`;
  }
  if (snapshot.currentTierSource === 'visits') {
    if (tier.projected) {
      const start = new Date(`${tier.historyStart}T12:00:00Z`).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'long' });
      return `${tier.label} · ${tier.visitsInWindow} visite dal ${start}`;
    }
    return `${tier.label} · ${tier.visitsInWindow} visite negli ultimi ${tier.monthsWindow} mesi`;
  }
  return `${tier.label} · ${snapshot.rewardPointsTotal} punti`;
};

export const getFidelityLabel = (tierKey) => {
  if (tierKey === 'gold') return 'Oro';
  if (tierKey === 'silver') return 'Argento';
  if (tierKey === 'bronze') return 'Bronzo';
  return 'Base';
};
