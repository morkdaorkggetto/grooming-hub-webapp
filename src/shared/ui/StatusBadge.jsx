import React from 'react';

/**
 * StatusBadge — pill con pallino colorato per stati appuntamento.
 *
 * Pattern dal bundle Design `proto/proto-dashboard.jsx` (StatusBadge inline).
 * Adattato alla macchina di stato reale di `appointments`:
 *   status: scheduled / completed / cancelled / no_show
 *   approval_status: pending / approved / rejected
 *
 * In Fase 1 il customer vede solo i 'scheduled' (filtrati lato hook).
 * `approval_status='pending'` viene mostrato come "In attesa di conferma"
 * (per richieste customer ancora da approvare); `approved` come "Confermato".
 *
 * Props: { status, approvalStatus, compact? }
 */

const MAP = {
  // chiave composta "status:approval_status" → label + colori
  'scheduled:pending':   { label: 'In attesa di conferma', bg: 'var(--color-warning-bg, #efe3de)',  fg: 'var(--color-warning-text, #7f5d60)', dot: '#c8a89f' },
  'scheduled:approved':  { label: 'Confermato',            bg: 'var(--color-success-bg, #e3f0e7)',  fg: 'var(--color-success-text, #4f8b67)', dot: '#4f8b67' },
  'completed:approved':  { label: 'Completato',            bg: 'var(--color-surface-soft, #f3ece8)', fg: 'var(--color-text-secondary, #7f6f73)', dot: '#7f6f73' },
  'cancelled:approved':  { label: 'Annullato',             bg: 'var(--color-surface-muted, #e5d7d8)', fg: 'var(--color-text-secondary, #7f6f73)', dot: '#7f6f73' },
  'no_show:approved':    { label: 'Mancata visita',        bg: 'var(--color-danger-bg, #f8e6e9)',   fg: 'var(--color-danger-text, #b85e69)', dot: '#b85e69' },
  'scheduled:rejected':  { label: 'Richiesta non accettata', bg: 'var(--color-danger-bg, #f8e6e9)', fg: 'var(--color-danger-text, #b85e69)', dot: '#b85e69' },
};

const FALLBACK = {
  label: 'In programma',
  bg: 'var(--color-surface-soft, #f3ece8)',
  fg: 'var(--color-text-secondary, #7f6f73)',
  dot: '#7f6f73',
};

export default function StatusBadge({ status, approvalStatus = 'approved', compact = false, style = {} }) {
  const key = `${status || 'scheduled'}:${approvalStatus || 'approved'}`;
  const s = MAP[key] || FALLBACK;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: compact ? '3px 10px' : '5px 12px',
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontSize: compact ? 11 : 12,
        fontWeight: 700,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}
