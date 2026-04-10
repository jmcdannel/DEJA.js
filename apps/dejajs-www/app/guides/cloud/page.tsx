import type { Metadata } from 'next';
import CloudGuide from '../../../components/guides/CloudGuide';

export const metadata: Metadata = {
  title: 'Cloud',
  description: 'A complete guide to DEJA Cloud — manage your roster, configure turnouts, set up effects, wire signals, build routes, and create sensor automations.',
};

export default function CloudPage() {
  return <CloudGuide />;
}
