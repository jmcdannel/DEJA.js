import React from 'react';
import AnimateIn from '../../home/AnimateIn';
import FeatureCard from './FeatureCard';

export default function FeatureGrid({ items }: { items: { emoji: string; text: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {items.map((item, i) => (
        <AnimateIn key={item.text} delay={i * 0.05}>
          <FeatureCard emoji={item.emoji} text={item.text} />
        </AnimateIn>
      ))}
    </div>
  );
}
