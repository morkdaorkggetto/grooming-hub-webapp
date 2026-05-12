const FIDELITY_TIERS = [
  {
    key: 'bronze',
    label: 'Bronzo',
    visitsRequired: 12,
    monthsWindow: 12,
    pointsRequired: 100,
    activeBackground: '#f6e3cf',
    activeBorder: '#cd7f32',
    activeText: '#7c4a21',
  },
  {
    key: 'silver',
    label: 'Argento',
    visitsRequired: 24,
    monthsWindow: 24,
    pointsRequired: 250,
    activeBackground: '#eef2f7',
    activeBorder: '#94a3b8',
    activeText: '#334155',
  },
  {
    key: 'gold',
    label: 'Oro',
    visitsRequired: 36,
    monthsWindow: 36,
    pointsRequired: 500,
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

export const getFidelityTierSnapshot = (client) => {
  const visits = Array.isArray(client?.visits) ? client.visits : [];
  const rewardPointsTotal = Number(client?.rewardPointsTotal || 0);
  const useRewardPoints = rewardPointsTotal > 0;

  const tiers = FIDELITY_TIERS.map((tier) => {
    const visitsInWindow = countVisitsInWindow(visits, tier.monthsWindow);
    const achieved = useRewardPoints
      ? rewardPointsTotal >= tier.pointsRequired
      : visitsInWindow >= tier.visitsRequired;

    return {
      ...tier,
      visitsInWindow,
      rewardPointsTotal,
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

  return {
    currentTier,
    nextTier,
    tiers,
    mode: useRewardPoints ? 'points' : 'visits',
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
