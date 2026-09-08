import React, { useCallback, useRef, useState } from 'react';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const ParallaxCard: React.FC<ParallaxCardProps> = ({
  children,
  className = '',
  maxTilt = 2.5,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max tilt 2.5 - 3.5 degrees
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      setTilt({ x: rotateX, y: rotateY });
    },
    [maxTilt],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className={`relative transition-transform duration-300 ease-out ${className}`}
    >
      <div
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateZ(4px)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </div>
  );
};
