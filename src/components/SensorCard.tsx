import React from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  CloudRain, 
  Sun, 
  Battery 
} from 'lucide-react';
import type { SensorData } from '@/hooks/useMQTTSimulation';

interface SensorCardProps {
  type: keyof SensorData;
  value: number | boolean;
  unit?: string;
  label: string;
  index?: number;
}

const iconMap = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Gauge,
  airQuality: Wind,
  rain: CloudRain,
  light: Sun,
  battery: Battery,
  timestamp: Sun,
};

const getStatusColor = (type: string, value: number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'text-info' : 'text-success';
  }

  switch (type) {
    case 'temperature':
      if (value > 35) return 'text-destructive';
      if (value > 28) return 'text-warning';
      return 'text-success';
    case 'humidity':
      if (value > 80) return 'text-info';
      if (value < 30) return 'text-warning';
      return 'text-success';
    case 'airQuality':
      if (value > 100) return 'text-destructive';
      if (value > 50) return 'text-warning';
      return 'text-success';
    case 'battery':
      if (value < 20) return 'text-destructive';
      if (value < 50) return 'text-warning';
      return 'text-success';
    default:
      return 'text-accent';
  }
};

export const SensorCard: React.FC<SensorCardProps> = ({ 
  type, 
  value, 
  unit = '', 
  label,
  index = 0 
}) => {
  const Icon = iconMap[type] || Sun;
  const statusColor = getStatusColor(type, value);
  const displayValue = typeof value === 'boolean' 
    ? (value ? 'Detected' : 'Clear')
    : value.toFixed(1);

  return (
    <motion.div
      className="sensor-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="sensor-icon">
          <Icon className={`w-7 h-7 ${statusColor}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot online" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="data-label">{label}</p>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={displayValue}
            className="data-value"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {displayValue}
          </motion.span>
          {unit && <span className="text-xl text-muted-foreground">{unit}</span>}
        </div>
      </div>

      {/* Progress bar for numeric values */}
      {typeof value === 'number' && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-success"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((value / (type === 'pressure' ? 1100 : 100)) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
};

interface SensorGridProps {
  data: SensorData | null;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ data }) => {
  if (!data) return null;

  const sensors = [
    { type: 'temperature' as const, value: data.temperature, unit: '°C', label: 'Temperature' },
    { type: 'humidity' as const, value: data.humidity, unit: '%', label: 'Humidity' },
    { type: 'pressure' as const, value: data.pressure, unit: 'hPa', label: 'Pressure' },
    { type: 'airQuality' as const, value: data.airQuality, unit: 'AQI', label: 'Air Quality' },
    { type: 'rain' as const, value: data.rain, label: 'Rain Status' },
    { type: 'light' as const, value: data.light, unit: 'lux', label: 'Light Intensity' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sensors.map((sensor, index) => (
        <SensorCard
          key={sensor.type}
          {...sensor}
          index={index}
        />
      ))}
    </div>
  );
};
