import React from 'react';

export default function MdiIcon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}
