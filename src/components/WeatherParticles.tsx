import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WeatherParticlesProps {
  condition: 'sunny' | 'rainy' | 'night' | 'cloudy';
}

const RainDrop: React.FC<{ delay: number; left: number }> = ({ delay, left }) => (
  <motion.div
    className="absolute w-0.5 h-8 bg-gradient-to-b from-accent/40 to-transparent rounded-full"
    style={{ left: `${left}%` }}
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
    transition={{
      duration: 1 + Math.random() * 0.5,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

const Star: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => (
  <motion.div
    className="absolute rounded-full bg-foreground"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
    }}
    animate={{
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      duration: 2 + Math.random() * 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const SunRay: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="absolute w-1 h-32 bg-gradient-to-b from-warning/30 to-transparent"
    style={{
      left: '50%',
      top: '0',
      transformOrigin: 'bottom center',
      rotate: `${index * 30}deg`,
    }}
    animate={{
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration: 3,
      delay: index * 0.2,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const CloudPuff: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => (
  <motion.div
    className="absolute rounded-full bg-muted-foreground/10 blur-xl"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size * 0.6,
    }}
    animate={{
      x: ['0%', '5%', '0%'],
      opacity: [0.3, 0.5, 0.3],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

export const WeatherParticles: React.FC<WeatherParticlesProps> = ({ condition }) => {
  const particles = useMemo(() => {
    switch (condition) {
      case 'rainy':
        return Array.from({ length: 50 }, (_, i) => (
          <RainDrop key={i} delay={i * 0.05} left={Math.random() * 100} />
        ));
      case 'night':
        return Array.from({ length: 80 }, (_, i) => (
          <Star
            key={i}
            x={Math.random() * 100}
            y={Math.random() * 60}
            size={1 + Math.random() * 2}
            delay={Math.random() * 2}
          />
        ));
      case 'sunny':
        return (
          <div className="absolute top-10 right-10">
            {Array.from({ length: 12 }, (_, i) => (
              <SunRay key={i} index={i} />
            ))}
            <motion.div
              className="absolute w-24 h-24 rounded-full bg-warning/20 blur-2xl -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        );
      case 'cloudy':
        return Array.from({ length: 8 }, (_, i) => (
          <CloudPuff
            key={i}
            x={10 + (i * 12)}
            y={5 + Math.random() * 15}
            size={100 + Math.random() * 100}
            delay={i * 0.5}
          />
        ));
      default:
        return null;
    }
  }, [condition]);

  return (
    <div className="particles-container">
      {particles}
    </div>
  );
};
