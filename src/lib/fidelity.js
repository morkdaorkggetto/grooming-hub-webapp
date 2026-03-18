const FIDELITY_TIERS = [
  {
    key: 'bronze',
    label: 'Bronzo',
    visitsRequired: 12,
    monthsWindow: 12,
    activeBackground: '#f6e3cf',
    activeBorder: '#cd7f32',
    activeText: '#7c4a21',
  },
  {
    key: 'silver',
    label: 'Argento',
    visitsRequired: 24,
    monthsWindow: 24,
    activeBackground: '#eef2f7',
    activeBorder: '#94a3b8',
    activeText: '#334155',
  },
  {
    key: 'gold',
    label: 'Oro',
    visitsRequired: 36,
    monthsWindow: 36,
    activeBackground: '#fff3bf',
    activeBorder: '#d4a017',
    activeText: '#7a5c00',
  },
];

const INACTIVE_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#e8d5c4',
  textColor: '#8b5a3c',
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

  const tiers = FIDELITY_TIERS.map((tier) => {
    const visitsInWindow = countVisitsInWindow(visits, tier.monthsWindow);
    const achieved = visitsInWindow >= tier.visitsRequired;

    return {
      ...tier,
      visitsInWindow,
      achieved,
      remainingVisits: Math.max(0, tier.visitsRequired - visitsInWindow),
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
  return { backgroundColor: '#faf3f0', color: '#8b5a3c' };
};

export const getFidelityLabel = (tierKey) => {
  if (tierKey === 'gold') return 'Oro';
  if (tierKey === 'silver') return 'Argento';
  if (tierKey === 'bronze') return 'Bronzo';
  return 'Base';
};
