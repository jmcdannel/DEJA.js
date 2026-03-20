import QRCode from 'react-qr-code';

interface Props {
  url?: string;
  size?: number;
  label?: string;
}

export default function ThrottleLaunchQR({
  url = 'https://throttle.dejajs.com',
  size = 120,
  label = 'Scan to open Throttle',
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-deja-cyan/30 bg-gray-950/80 p-3 inline-flex items-center justify-center">
        <QRCode
          value={url}
          size={size}
          fgColor="#00E5FF"
          bgColor="transparent"
          level="M"
        />
      </div>
      {label && (
        <p className="text-xs text-gray-400 font-mono text-center">{label}</p>
      )}
    </div>
  );
}
