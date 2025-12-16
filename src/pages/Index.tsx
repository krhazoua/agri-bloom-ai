import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { WeatherParticles } from '@/components/WeatherParticles';
import { InteractiveGlobe } from '@/components/InteractiveGlobe';
import { SensorGrid } from '@/components/SensorCard';
import { WeatherStory } from '@/components/WeatherStory';
import { DataChart } from '@/components/DataChart';
import { useMQTTSimulation } from '@/hooks/useMQTTSimulation';
import { MapPin, Clock, Zap, TrendingUp } from 'lucide-react';

const Index = () => {
  const { stations, history, isConnected, getAverageData, getWeatherCondition } = useMQTTSimulation();
  const avgData = getAverageData();
  const condition = getWeatherCondition();

  return (
    <Layout isConnected={isConnected}>
      {/* Weather-based background particles */}
      <WeatherParticles condition={condition} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Info */}
            <div className="flex-1 space-y-6">
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Weather <span className="text-accent glow-text">Intelligence</span>
                </motion.h1>
                <p className="text-muted-foreground text-lg">
                  Real-time IoT monitoring for precision agriculture
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: MapPin, label: 'Active Stations', value: stations.filter(s => s.status === 'online').length },
                  { icon: Zap, label: 'Data Points', value: '24k+' },
                  { icon: Clock, label: 'Update Rate', value: '3s' },
                  { icon: TrendingUp, label: 'Uptime', value: '99.9%' },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="glass-card p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Weather Story */}
              <WeatherStory data={avgData} condition={condition} />
            </div>

            {/* 3D Globe */}
            <motion.div
              className="w-full lg:w-[400px] glass-card overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <InteractiveGlobe stationLocation={stations[0]?.location} />
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{stations[0]?.name || 'Station'}</p>
                    <p className="text-xs text-muted-foreground">Tunisia • {stations[0]?.location.lat.toFixed(4)}°N</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-dot online" />
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Sensor Grid */}
        <motion.section
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Live Sensor Data</h2>
            <span className="text-xs text-muted-foreground">
              Last update: {avgData?.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <SensorGrid data={avgData} />
        </motion.section>

        {/* Charts */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">24-Hour Trends</h2>
          <DataChart history={history} />
        </motion.section>
      </div>
    </Layout>
  );
};

export default Index;
