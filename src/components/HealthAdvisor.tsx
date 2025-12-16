import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Leaf,
  User,
  Umbrella
} from 'lucide-react';
import type { SensorData } from '@/hooks/useMQTTSimulation';

interface HealthAdvisorProps {
  data: SensorData | null;
}

interface HealthMetric {
  name: string;
  value: number;
  status: 'good' | 'moderate' | 'poor';
  icon: React.ComponentType<any>;
  advice: string;
}

const calculateComfortIndex = (temp: number, humidity: number): number => {
  // Heat index approximation
  const hi = temp + (0.5 * humidity);
  // Normalize to 0-100
  return Math.max(0, Math.min(100, 100 - Math.abs(hi - 55)));
};

const calculateCropHealth = (temp: number, humidity: number, light: number): number => {
  let score = 100;
  
  // Optimal temperature 20-28
  if (temp < 15 || temp > 35) score -= 30;
  else if (temp < 20 || temp > 28) score -= 10;
  
  // Optimal humidity 40-60
  if (humidity < 30 || humidity > 80) score -= 30;
  else if (humidity < 40 || humidity > 60) score -= 10;
  
  // Light requirements
  if (light < 200) score -= 20;
  
  return Math.max(0, score);
};

const calculateRespiratoryIndex = (airQuality: number, humidity: number): number => {
  let score = 100;
  
  // AQI impact
  if (airQuality > 100) score -= 50;
  else if (airQuality > 50) score -= 20;
  
  // Humidity impact on respiratory
  if (humidity < 30 || humidity > 70) score -= 15;
  
  return Math.max(0, score);
};

export const HealthAdvisor: React.FC<HealthAdvisorProps> = ({ data }) => {
  const metrics: HealthMetric[] = useMemo(() => {
    if (!data) return [];

    const comfort = calculateComfortIndex(data.temperature, data.humidity);
    const crop = calculateCropHealth(data.temperature, data.humidity, data.light);
    const respiratory = calculateRespiratoryIndex(data.airQuality, data.humidity);
    const outdoor = data.rain ? 30 : (comfort + crop) / 2;

    return [
      {
        name: 'Comfort Index',
        value: comfort,
        status: comfort > 70 ? 'good' : comfort > 40 ? 'moderate' : 'poor',
        icon: User,
        advice: comfort > 70 
          ? 'Perfect conditions for outdoor work' 
          : comfort > 40 
            ? 'Take breaks and stay hydrated' 
            : 'Limit outdoor exposure',
      },
      {
        name: 'Crop Health',
        value: crop,
        status: crop > 70 ? 'good' : crop > 40 ? 'moderate' : 'poor',
        icon: Leaf,
        advice: crop > 70 
          ? 'Optimal growing conditions' 
          : crop > 40 
            ? 'Monitor for stress signs' 
            : 'Consider protective measures',
      },
      {
        name: 'Respiratory Quality',
        value: respiratory,
        status: respiratory > 70 ? 'good' : respiratory > 40 ? 'moderate' : 'poor',
        icon: Activity,
        advice: respiratory > 70 
          ? 'Air quality is excellent' 
          : respiratory > 40 
            ? 'Sensitive groups should limit exposure' 
            : 'Wear protective masks outdoors',
      },
      {
        name: 'Outdoor Suitability',
        value: outdoor,
        status: outdoor > 70 ? 'good' : outdoor > 40 ? 'moderate' : 'poor',
        icon: Umbrella,
        advice: data.rain 
          ? 'Rain detected - indoor activities recommended' 
          : outdoor > 70 
            ? 'Great day for field work' 
            : 'Check conditions before outdoor activities',
      },
    ];
  }, [data]);

  const statusColors = {
    good: 'text-success',
    moderate: 'text-warning',
    poor: 'text-destructive',
  };

  const statusBg = {
    good: 'bg-success/20',
    moderate: 'bg-warning/20',
    poor: 'bg-destructive/20',
  };

  if (!data) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Loading health data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Environmental Health Advisor</h3>
            <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            
            return (
              <motion.div
                key={metric.name}
                className={`p-4 rounded-xl ${statusBg[metric.status]} border border-border/50`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${statusColors[metric.status]}`} />
                    <span className="text-sm font-medium text-foreground">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {metric.status === 'good' && <CheckCircle className="w-4 h-4 text-success" />}
                    {metric.status === 'moderate' && <AlertTriangle className="w-4 h-4 text-warning" />}
                    {metric.status === 'poor' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-muted mb-3">
                  <motion.div
                    className={`h-full rounded-full ${
                      metric.status === 'good' 
                        ? 'bg-success' 
                        : metric.status === 'moderate' 
                          ? 'bg-warning' 
                          : 'bg-destructive'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">{metric.advice}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
