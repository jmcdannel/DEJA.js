'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArchitectureDiagram } from '../diagrams/ArchitectureDiagram';
import { DIAGRAM_CONFIGS } from '../diagrams/configs';

const VISIBLE_CONFIGS = DIAGRAM_CONFIGS.filter(c => c.id !== 'withrottle');

export default function DiagramSwitcher() {
  const [activeId, setActiveId] = useState('minimal');

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-full border border-gray-700 bg-gray-900 p-1">
          {VISIBLE_CONFIGS.map((config) => (
            <button
              key={config.id}
              onClick={() => setActiveId(config.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
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
      </div>

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
    </div>
  );
}
