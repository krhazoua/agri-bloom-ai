import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { SensorData } from '@/hooks/useMQTTSimulation';

interface DataChartProps {
  history: { timestamp: Date; data: SensorData }[];
  type?: 'temperature' | 'humidity' | 'pressure' | 'all';
}

export const DataChart: React.FC<DataChartProps> = ({ history, type = 'all' }) => {
  const chartData = useMemo(() => {
    return history.slice(-50).map((entry) => ({
      time: entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: entry.data.temperature,
      humidity: entry.data.humidity,
      pressure: entry.data.pressure,
      airQuality: entry.data.airQuality,
    }));
  }, [history]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    
    return (
      <div className="glass-card p-3 border border-border">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
          </p>
        ))}
      </div>
    );
  };

  if (type !== 'all') {
    return (
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 capitalize">{type} Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(168, 100%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(168, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
              <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" fontSize={10} />
              <YAxis stroke="hsl(215, 20%, 65%)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={type}
                stroke="hsl(168, 100%, 50%)"
                strokeWidth={2}
                fill={`url(#gradient-${type})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Multi-Parameter Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
            <XAxis dataKey="time" stroke="hsl(215, 20%, 65%)" fontSize={10} />
            <YAxis yAxisId="left" stroke="hsl(168, 100%, 50%)" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(145, 63%, 42%)" fontSize={10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="hsl(168, 100%, 50%)"
              strokeWidth={2}
              dot={false}
              name="Temperature (°C)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              dot={false}
              name="Humidity (%)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="airQuality"
              stroke="hsl(145, 63%, 42%)"
              strokeWidth={2}
              dot={false}
              name="Air Quality (AQI)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
