import type { Metadata } from 'next';
import ServerGuide from '../../../components/guides/ServerGuide';

export const metadata: Metadata = {
  title: 'Server Guide',
  description: 'Install, manage, and configure the DEJA Server — the bridge between your browser and your DCC-EX CommandStation.',
};

export default function ServerGuidePage() {
  return <ServerGuide />;
}
