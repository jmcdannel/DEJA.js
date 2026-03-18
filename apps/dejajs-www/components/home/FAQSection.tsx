'use client';

import { Accordion, AccordionItem } from '@heroui/react';
import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  {
    q: 'What DCC-EX hardware do I need?',
    a: 'Any DCC-EX CommandStation (Arduino Mega or similar) running the DCC-EX EX-CommandStation firmware. Connect it to the computer running DEJA Server via USB.',
  },
  {
    q: 'Does DEJA.js support WiThrottle?',
    a: 'WiThrottle protocol support is in progress but not yet stable. It is coming very soon — we\'ll announce when it\'s ready.',
  },
  {
    q: 'Can I use DEJA.js on my phone?',
    a: 'Yes. The Throttle app is a Progressive Web App (PWA). Open it in Safari (iOS) or Chrome (Android) and add it to your homescreen for a full-screen, native-feel experience — no app store required. Native iOS and Android apps are also in development.',
  },
  {
    q: 'Can I connect multiple CommandStations?',
    a: 'Yes. DEJA.js supports multiple DCC-EX CommandStations per layout, each with independent track mode assignments. Run Main, Programming, DC/PWM, and Booster modes on separate hardware.',
  },
  {
    q: 'What is DEJA Cloud?',
    a: 'DEJA Cloud is the web app for managing your layout configuration — roster, turnouts, signals, effects, and devices. All data is stored in Firebase and syncs in real time to every connected device.',
  },
  {
    q: 'Do I need to keep a computer running?',
    a: 'Yes. DEJA Server must run on a computer physically connected to your CommandStation via USB. It can run on a Raspberry Pi or any always-on computer on your network. The mobile and web apps connect to it over Wi-Fi.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. DEJA.js offers a free tier with limited features. Paid plans unlock the full roster, all apps, and advanced features. See the pricing page for details.',
  },
];

export default function FAQSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <AnimateIn className="flex flex-col items-center gap-4 text-center mb-12">
          <SectionLabel color="cyan">FAQ</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Common questions.
          </h2>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <Accordion
            className="gap-3 flex flex-col"
            itemClasses={{
              base: 'bg-gray-900/80 border border-gray-700 rounded-xl hover:border-deja-cyan/40 transition-colors',
              title: 'font-semibold text-white text-base',
              content: 'text-gray-300 text-sm leading-relaxed px-6 pb-6',
              trigger: 'px-6 py-5',
              indicator: 'text-deja-cyan',
            }}
          >
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.q}
                aria-label={faq.q}
                title={faq.q}
              >
                {faq.a}
              </AccordionItem>
            ))}
          </Accordion>
        </AnimateIn>
      </div>
    </section>
  );
}
