const ORDINALS = ['prima', 'seconda', 'terza', 'quarta', 'quinta', 'sesta', 'settima', 'ottava', 'nona', 'decima', 'undicesima', 'dodicesima'];
const ordinal = number => ORDINALS[number - 1] || `${number}ª`;

export function petCardCopy(pet, snapshot) {
  const { currentTier, nextTier } = snapshot;
  if (!snapshot.tiers.length) return { title: 'La tua tessera.', detail: '', rule: '' };
  if (!nextTier && currentTier) {
    const period = currentTier.monthsWindow === 36 ? 'tre anni' : `${currentTier.monthsWindow} mesi`;
    return {
      title: `${pet.name} è ${currentTier.label}.`,
      detail: `${currentTier.visitsInWindow} visite da noi negli ultimi ${period}.`,
      rule: 'Il livello più alto della tessera.',
    };
  }
  const { visitsInWindow: done, visitsRequired: total, label, monthsWindow, projected, historyStart } = nextTier;
  const destination = label === 'Argento' ? 'l’Argento' : label === 'Oro' ? 'l’Oro' : `il ${label}`;
  const period = projected
    ? `dal ${new Date(`${historyStart}T12:00:00Z`).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'long' })}`
    : `degli ultimi ${monthsWindow} mesi`;
  return {
    title: currentTier ? `${pet.name} è ${currentTier.label}.`
      : done * 2 === total ? `A metà strada verso il ${label}.`
      : `La prossima è la ${ordinal(done + 1)}.`,
    detail: currentTier ? `Verso ${destination}: ${done} visite di ${total}.`
      : `Il ${label} arriva alla ${ordinal(total)} visita.`,
    rule: `Ogni visita da noi è un timbro · contano quelle ${period}.`,
  };
}
