import type { Metadata } from 'next';
import ThrottleGuide from '../../../components/guides/ThrottleGuide';

export const metadata: Metadata = {
  title: 'Throttle',
  description: 'A step-by-step walkthrough of the Throttle app — connect, add a locomotive, control speed, throw turnouts, fire routes, and trigger effects.',
};

export default function ThrottlePage() {
  return <ThrottleGuide />;
}
