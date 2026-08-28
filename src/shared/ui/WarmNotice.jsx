import React from 'react';
import Icon from './Icon';

export default function WarmNotice({ title, children, icon = 'clock', staff = false, className = '' }) {
  return (
    <div
      role="status"
      className={`${staff ? 'gh-notice--staff' : ''} ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: staff ? 7 : 11,
        padding: staff ? '7px 10px' : '13px 14px',
        borderRadius: staff ? 9 : 14,
        border: '1px solid var(--color-warning-border)',
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        fontSize: staff ? 11.5 : 12.5,
        lineHeight: staff ? 1.45 : 1.55,
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
