import type { Metadata } from 'next';
import ArchitecturePage from '../../../components/architecture/ArchitecturePage';

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'How DEJA.js works — from a tap on your phone to a train on the track.',
};

export default function ArchitectureGuidePage() {
  return <ArchitecturePage />;
}
