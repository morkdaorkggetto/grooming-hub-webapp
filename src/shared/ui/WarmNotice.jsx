import React from 'react';
import Icon from './Icon';

export default function WarmNotice({ title, children, icon = 'clock' }) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: '13px 14px',
        borderRadius: 14,
        border: '1px solid var(--color-warning-border)',
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        fontSize: 12.5,
        lineHeight: 1.55,
      }}
    >
      <Icon name={icon} size={18} style={{ marginTop: 1 }} />
      <div>
        <strong>{title}</strong>{' '}
        {children}
      </div>
    </div>
  );
}
