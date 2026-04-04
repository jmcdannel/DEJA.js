import type { Metadata } from 'next';
import IoGuide from '../../../components/guides/IoGuide';

export const metadata: Metadata = {
  title: 'IO Guide — DEJA.js',
  description: 'Control your entire layout with DEJA IO — Arduino, Pico W, Serial, MQTT, and WebSocket hardware integration.',
};

export default function IoGuidePage() {
  return <IoGuide />;
}
