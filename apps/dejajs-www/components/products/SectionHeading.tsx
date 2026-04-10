// 📐 Reusable section heading: eyebrow + heading + kicker.

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  kicker?: string;
  align?: 'left' | 'center';
  accentClass?: string;
}

export default function SectionHeading({
  eyebrow,
  heading,
  kicker,
  align = 'left',
  accentClass = 'text-deja-cyan',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center mx-auto' : 'text-left';
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow && (
        <span className={`text-xs tracking-[0.2em] uppercase font-mono ${accentClass}`}>
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
        {heading}
      </h2>
      {kicker && (
        <p className="text-lg text-gray-400 max-w-2xl">
          {kicker}
        </p>
      )}
    </div>
  );
}
