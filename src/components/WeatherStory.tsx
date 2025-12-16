import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SensorData } from '@/hooks/useMQTTSimulation';

interface WeatherStoryProps {
  data: SensorData | null;
  condition: 'sunny' | 'rainy' | 'night' | 'cloudy';
}

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return 'early morning';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
};

const generateStory = (data: SensorData, condition: string): string => {
  const timeOfDay = getTimeOfDay();
  const tempStatus = data.temperature > 30 ? 'warm' : data.temperature < 20 ? 'cool' : 'mild';
  const humidityStatus = data.humidity > 70 ? 'humid' : data.humidity < 40 ? 'dry' : 'comfortable';
  const airStatus = data.airQuality > 50 ? 'moderate' : 'excellent';

  const stories = {
    sunny: `This ${timeOfDay}, your field is bathed in sunlight with ${tempStatus} temperatures of ${data.temperature.toFixed(1)}°C. Air quality is ${airStatus}, perfect for outdoor agricultural activities. Light levels are optimal for photosynthesis.`,
    rainy: `Rain has been detected across your monitoring area. Current humidity is at ${data.humidity.toFixed(0)}% with ${tempStatus} temperatures. Consider postponing any outdoor operations and ensure proper drainage in your fields.`,
    night: `As ${timeOfDay} settles in, temperatures have dropped to ${data.temperature.toFixed(1)}°C. The atmosphere is ${humidityStatus} with ${data.humidity.toFixed(0)}% humidity. All systems are monitoring conditions for overnight frost alerts.`,
    cloudy: `Cloud cover is affecting your field this ${timeOfDay}. Despite reduced sunlight, temperatures remain ${tempStatus} at ${data.temperature.toFixed(1)}°C. Pressure is stable at ${data.pressure.toFixed(0)} hPa, suggesting continued overcast conditions.`,
  };

  return stories[condition as keyof typeof stories] || stories.sunny;
};

export const WeatherStory: React.FC<WeatherStoryProps> = ({ data, condition }) => {
  const story = useMemo(() => {
    if (!data) return 'Connecting to weather stations...';
    return generateStory(data, condition);
  }, [data, condition]);

  const emoji = {
    sunny: '☀️',
    rainy: '🌧️',
    night: '🌙',
    cloudy: '☁️',
  }[condition];

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start gap-4">
        <motion.span
          className="text-4xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {emoji}
        </motion.span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">Weather Story</h3>
          <motion.p
            key={story}
            className="text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {story}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};
