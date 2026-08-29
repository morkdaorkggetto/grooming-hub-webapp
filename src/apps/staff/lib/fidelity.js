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

const getCutoffDate = (monthsWindow) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - monthsWindow);
  return date;
};

const countVisitsInWindow = (visits = [], monthsWindow) => {
  const cutoff = getCutoffDate(monthsWindow);

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

export const getFidelityTierSnapshot = (client, settings = client?.fidelitySettings) => {
  const visits = Array.isArray(client?.visits) ? client.visits : [];
  const rewardPointsTotal = Number(client?.rewardPointsTotal || 0);
  const hasRewardPoints = rewardPointsTotal > 0;

  const tiers = getFidelityTiers(settings).map((tier) => {
    const visitsInWindow = countVisitsInWindow(visits, tier.monthsWindow);
    const achievedByVisits = visitsInWindow >= tier.visitsRequired;
    const achievedByPoints = rewardPointsTotal >= tier.pointsRequired;
    const achieved = achievedByVisits || achievedByPoints;

    return {
      ...tier,
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

  const currentTier =
    [...tiers].reverse().find((tier) => tier.achieved) || null;
  const nextTier = tiers.find((tier) => !tier.achieved) || null;
  const visitTier = [...tiers].reverse().find((tier) => tier.achievedByVisits) || null;
  const pointsTier = [...tiers].reverse().find((tier) => tier.achievedByPoints) || null;
  const tierRank = (tier) => tiers.findIndex((candidate) => candidate.key === tier?.key);
  const mode = tierRank(pointsTier) > tierRank(visitTier) ? 'points' : 'visits';

  return {
    currentTier,
    nextTier,
    visitTier,
    pointsTier,
    tiers,
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

export const getFidelityLabel = (tierKey) => {
  if (tierKey === 'gold') return 'Oro';
  if (tierKey === 'silver') return 'Argento';
  if (tierKey === 'bronze') return 'Bronzo';
  return 'Base';
};
