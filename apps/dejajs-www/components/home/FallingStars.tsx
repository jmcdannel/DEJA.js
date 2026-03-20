'use client';

// Deterministic star positions to avoid hydration mismatch
const stars = [
  { id: 1, x: 5, delay: 0.0, duration: 4.2 },
  { id: 2, x: 12, delay: 0.5, duration: 3.8 },
  { id: 3, x: 19, delay: 1.0, duration: 4.5 },
  { id: 4, x: 26, delay: 1.5, duration: 4.0 },
  { id: 5, x: 33, delay: 2.0, duration: 3.6 },
  { id: 6, x: 40, delay: 2.5, duration: 4.8 },
  { id: 7, x: 47, delay: 3.0, duration: 4.2 },
  { id: 8, x: 54, delay: 3.5, duration: 3.9 },
  { id: 9, x: 61, delay: 4.0, duration: 4.4 },
  { id: 10, x: 68, delay: 4.5, duration: 4.1 },
  { id: 11, x: 75, delay: 5.0, duration: 3.7 },
  { id: 12, x: 82, delay: 5.5, duration: 4.6 },
  { id: 13, x: 89, delay: 6.0, duration: 4.0 },
  { id: 14, x: 8, delay: 6.5, duration: 4.3 },
  { id: 15, x: 15, delay: 7.0, duration: 3.8 },
  { id: 16, x: 22, delay: 7.5, duration: 4.7 },
  { id: 17, x: 29, delay: 8.0, duration: 4.1 },
  { id: 18, x: 36, delay: 8.5, duration: 3.9 },
  { id: 19, x: 43, delay: 9.0, duration: 4.5 },
  { id: 20, x: 50, delay: 9.5, duration: 4.2 },
  { id: 21, x: 57, delay: 10.0, duration: 3.7 },
  { id: 22, x: 64, delay: 10.5, duration: 4.4 },
  { id: 23, x: 71, delay: 11.0, duration: 4.0 },
  { id: 24, x: 78, delay: 11.5, duration: 4.8 },
  { id: 25, x: 85, delay: 12.0, duration: 3.8 },
  { id: 26, x: 3, delay: 12.5, duration: 4.3 },
  { id: 27, x: 10, delay: 13.0, duration: 4.6 },
  { id: 28, x: 17, delay: 13.5, duration: 3.9 },
  { id: 29, x: 24, delay: 14.0, duration: 4.1 },
  { id: 30, x: 92, delay: 14.5, duration: 4.2 },
];

export default function FallingStars() {
  return (
    <div className="falling-stars-container" aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="falling-star-item"
          style={
            {
              left: `${star.x}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
