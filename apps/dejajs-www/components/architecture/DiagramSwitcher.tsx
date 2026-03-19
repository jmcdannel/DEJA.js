'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchitectureDiagram } from '../diagrams/ArchitectureDiagram';
import { DIAGRAM_CONFIGS } from '../diagrams/configs';

const VISIBLE_CONFIGS = DIAGRAM_CONFIGS.filter(c => c.id !== 'withrottle');

export default function DiagramSwitcher() {
  const [activeId, setActiveId] = useState('tabletop');
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Try native fullscreen, fall back to modal overlay
  const toggleExpanded = useCallback(() => {
    if (expanded) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setExpanded(false);
    } else {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().then(
          () => setExpanded(true),
          () => setExpanded(true) // fallback to overlay even if fullscreen fails
        );
      } else {
        setExpanded(true); // no fullscreen API — use overlay
      }
    }
  }, [expanded]);

  // Sync state when user exits fullscreen via Escape
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setExpanded(false);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Close on Escape when in overlay mode (not native fullscreen)
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        setExpanded(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded]);

  const toggleBar = (
    <div className="flex justify-center mb-6 gap-3 flex-wrap">
      <div className="inline-flex rounded-full border border-gray-700 bg-gray-900 p-1">
        {VISIBLE_CONFIGS.map((config) => (
          <button
            key={config.id}
            onClick={() => setActiveId(config.id)}
            className={`relative px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              activeId === config.id ? 'text-gray-950' : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeId === config.id && (
              <motion.div
                layoutId="diagram-toggle-bg"
                className="absolute inset-0 rounded-full bg-deja-cyan"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{config.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={toggleExpanded}
        className="px-3 py-1.5 rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        title={expanded ? 'Exit fullscreen' : 'View fullscreen'}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
          {expanded ? (
            <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
          ) : (
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          )}
        </svg>
      </button>
    </div>
  );

  const diagram = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeId}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <ArchitectureDiagram config={activeId} />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {/* Normal inline view */}
      <div ref={containerRef}>
        {toggleBar}
        {!expanded && diagram}
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
          <div className="p-4">
            {toggleBar}
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {diagram}
          </div>
        </div>
      )}
    </>
  );
}
