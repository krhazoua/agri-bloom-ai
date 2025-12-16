import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useMQTTSimulation } from '@/hooks/useMQTTSimulation';
import { 
  GitCompare, 
  Cloud, 
  Cpu, 
  TrendingUp, 
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ExternalWeather {
  temperature: number;
  humidity: number;
  pressure: number;
  description: string;
}

const Compare = () => {
  const { getAverageData } = useMQTTSimulation();
  const avgData = getAverageData();
  
  // Simulated external weather API data
  const [externalData, setExternalData] = useState<ExternalWeather>({
    temperature: 26.5,
    humidity: 55,
    pressure: 1015,
    description: 'Partly cloudy',
  });

  // Simulate external API updates
  useEffect(() => {
    const interval = setInterval(() => {
      setExternalData({
        temperature: 24 + Math.random() * 8,
        humidity: 50 + Math.random() * 20,
        pressure: 1010 + Math.random() * 15,
        description: ['Clear sky', 'Partly cloudy', 'Scattered clouds', 'Light breeze'][Math.floor(Math.random() * 4)],
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Calculate deviations
  const deviations = React.useMemo(() => {
    if (!avgData) return null;

    const tempDiff = avgData.temperature - externalData.temperature;
    const humidityDiff = avgData.humidity - externalData.humidity;
    const pressureDiff = avgData.pressure - externalData.pressure;

    const accuracy = 100 - (Math.abs(tempDiff) + Math.abs(humidityDiff / 2) + Math.abs(pressureDiff / 10));
    const reliability = Math.max(0, Math.min(100, accuracy));

    return {
      temperature: { value: tempDiff, percent: (tempDiff / externalData.temperature) * 100 },
      humidity: { value: humidityDiff, percent: (humidityDiff / externalData.humidity) * 100 },
      pressure: { value: pressureDiff, percent: (pressureDiff / externalData.pressure) * 100 },
      reliability,
    };
  }, [avgData, externalData]);

  // Radar chart data
  const radarData = React.useMemo(() => {
    if (!avgData) return [];

    return [
      { metric: 'Temperature', local: avgData.temperature, external: externalData.temperature, fullMark: 50 },
      { metric: 'Humidity', local: avgData.humidity, external: externalData.humidity, fullMark: 100 },
      { metric: 'Pressure', local: (avgData.pressure - 980) * 2, external: (externalData.pressure - 980) * 2, fullMark: 80 },
    ];
  }, [avgData, externalData]);

  const getDeviationIcon = (value: number) => {
    if (Math.abs(value) < 1) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (value > 0) return <TrendingUp className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-info" />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Data <span className="text-accent">Comparison</span>
          </h1>
          <p className="text-muted-foreground">
            Compare local sensors vs external weather APIs
          </p>
        </motion.div>

        {/* Reliability Score */}
        <motion.div
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20">
                <GitCompare className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Sensor Reliability Score</h3>
                <p className="text-muted-foreground text-sm">Based on comparison with OpenWeather API</p>
              </div>
            </div>
            <div className="text-right">
              <motion.p
                className="text-5xl font-bold text-accent"
                key={deviations?.reliability}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {deviations?.reliability.toFixed(0) || '--'}%
              </motion.p>
              <div className="flex items-center gap-2 mt-1">
                {(deviations?.reliability || 0) > 80 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">Excellent</span>
                  </>
                ) : (deviations?.reliability || 0) > 60 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-warning" />
                    <span className="text-sm text-warning">Good</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">Needs Calibration</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Local Sensors */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
                <Cpu className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Local Sensors</h3>
                <p className="text-xs text-muted-foreground">ESP32 + DHT11 + BMP180</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                <p className="text-2xl font-bold text-foreground">{avgData?.temperature.toFixed(1) || '--'}°C</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                <p className="text-2xl font-bold text-foreground">{avgData?.humidity.toFixed(0) || '--'}%</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Pressure</p>
                <p className="text-2xl font-bold text-foreground">{avgData?.pressure.toFixed(0) || '--'} hPa</p>
              </div>
            </div>
          </motion.div>

          {/* External API */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/20">
                <Cloud className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">OpenWeather API</h3>
                <p className="text-xs text-muted-foreground">{externalData.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                    <p className="text-2xl font-bold text-foreground">{externalData.temperature.toFixed(1)}°C</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeviationIcon(deviations?.temperature.value || 0)}
                    <span className={`text-sm ${Math.abs(deviations?.temperature.value || 0) < 2 ? 'text-success' : 'text-warning'}`}>
                      {deviations?.temperature.value.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                    <p className="text-2xl font-bold text-foreground">{externalData.humidity.toFixed(0)}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeviationIcon(deviations?.humidity.value || 0)}
                    <span className={`text-sm ${Math.abs(deviations?.humidity.value || 0) < 10 ? 'text-success' : 'text-warning'}`}>
                      {deviations?.humidity.value.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pressure</p>
                    <p className="text-2xl font-bold text-foreground">{externalData.pressure.toFixed(0)} hPa</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDeviationIcon(deviations?.pressure.value || 0)}
                    <span className={`text-sm ${Math.abs(deviations?.pressure.value || 0) < 5 ? 'text-success' : 'text-warning'}`}>
                      {deviations?.pressure.value.toFixed(0)} hPa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Radar Comparison Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Comparative Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222, 30%, 20%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }} />
                <Radar name="Local Sensors" dataKey="local" stroke="hsl(168, 100%, 50%)" fill="hsl(168, 100%, 50%)" fillOpacity={0.3} />
                <Radar name="External API" dataKey="external" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.3} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Compare;
