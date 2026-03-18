'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';

export default function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-deja-cyan hover:text-deja-cyan/70 transition-colors"
      >
        View plans →
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        size="lg"
        classNames={{
          base: 'bg-gray-900 border border-gray-800',
          header: 'border-b border-gray-800',
          body: 'py-6',
          footer: 'border-t border-gray-800',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-white text-xl">Choose a Plan</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Free tier */}
                  <div className="rounded-xl border border-gray-700 p-5 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-mono text-deja-cyan uppercase tracking-widest mb-1">Free</p>
                      <p className="text-2xl font-bold text-white">$0</p>
                      <p className="text-gray-400 text-sm">Forever free</p>
                    </div>
                    <ul className="flex flex-col gap-2 text-sm text-gray-300">
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> 1 layout</li>
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> Throttle &amp; Monitor apps</li>
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> Community support</li>
                    </ul>
                    <a
                      href="https://cloud.dejajs.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto text-center text-sm font-semibold border border-gray-600 rounded-lg py-2 text-white hover:border-gray-400 transition-colors"
                    >
                      Get Started Free
                    </a>
                  </div>

                  {/* Pro tier */}
                  <div className="rounded-xl border border-deja-cyan/40 bg-deja-cyan/5 p-5 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-mono text-deja-cyan uppercase tracking-widest mb-1">Pro</p>
                      <p className="text-2xl font-bold text-white">$9<span className="text-base font-normal text-gray-400">/mo</span></p>
                      <p className="text-gray-400 text-sm">Billed monthly</p>
                    </div>
                    <ul className="flex flex-col gap-2 text-sm text-gray-300">
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> Unlimited layouts</li>
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> All apps included</li>
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> Priority support</li>
                      <li className="flex gap-2"><span className="text-deja-lime">✓</span> Cloud automation</li>
                    </ul>
                    <a
                      href="/pricing"
                      className="mt-auto text-center text-sm font-semibold bg-deja-lime hover:opacity-90 text-gray-950 rounded-lg py-2 transition-opacity"
                    >
                      Start Free Trial
                    </a>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Full plan details on the{' '}
                  <a href="/pricing" className="text-deja-cyan hover:underline" onClick={onClose}>
                    pricing page
                  </a>
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} className="text-gray-400">
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
