import type { Metadata } from 'next';
import GettingStartedGuide from '../../../components/guides/GettingStartedGuide';

export const metadata: Metadata = {
  title: 'Getting Started',
  description: 'From zero to driving trains in minutes — sign up, install the server, and take control.',
};

export default function GettingStartedPage() {
  return <GettingStartedGuide />;
}
