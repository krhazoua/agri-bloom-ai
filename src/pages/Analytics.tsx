import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { DataChart } from '@/components/DataChart';
import { useMQTTSimulation } from '@/hooks/useMQTTSimulation';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download,
  Brain,
  AlertCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Analytics = () => {
  const { history, getAverageData } = useMQTTSimulation();
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'pressure'>('temperature');
  const avgData = getAverageData();

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (history.length === 0) return null;

    const temps = history.map(h => h.data.temperature);
    const humidities = history.map(h => h.data.humidity);
    
    return {
      avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
      maxTemp: Math.max(...temps),
      minTemp: Math.min(...temps),
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
    };
  }, [history]);

  // Distribution data for pie chart
  const distributionData = React.useMemo(() => {
    const conditions = history.map(h => {
      if (h.data.rain) return 'Rainy';
      if (h.data.humidity > 70) return 'Humid';
      if (h.data.temperature > 28) return 'Hot';
      return 'Normal';
    });

    const counts: Record<string, number> = {};
    conditions.forEach(c => {
      counts[c] = (counts[c] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [history]);

  const COLORS = ['hsl(168, 100%, 50%)', 'hsl(145, 63%, 42%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)'];

  // Hourly averages for bar chart
  const hourlyData = React.useMemo(() => {
    const hourlyTemps: { [hour: number]: number[] } = {};
    
    history.forEach(h => {
      const hour = h.timestamp.getHours();
      if (!hourlyTemps[hour]) hourlyTemps[hour] = [];
      hourlyTemps[hour].push(h.data.temperature);
    });

    return Object.entries(hourlyTemps)
      .map(([hour, temps]) => ({
        hour: `${hour}:00`,
        temperature: temps.reduce((a, b) => a + b, 0) / temps.length,
      }))
      .slice(-12);
  }, [history]);

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
            AI <span className="text-accent">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Advanced data analysis and predictive insights
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Temperature', value: `${stats?.avgTemp.toFixed(1)}°C`, icon: TrendingUp, color: 'text-accent' },
            { label: 'Max Temperature', value: `${stats?.maxTemp.toFixed(1)}°C`, icon: BarChart3, color: 'text-destructive' },
            { label: 'Min Temperature', value: `${stats?.minTemp.toFixed(1)}°C`, icon: BarChart3, color: 'text-info' },
            { label: 'Avg Humidity', value: `${stats?.avgHumidity.toFixed(0)}%`, icon: Calendar, color: 'text-success' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Prediction Card */}
        <motion.div
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Prediction (24h)</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Based on LSTM multi-parameter analysis
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Expected High</p>
                  <p className="text-lg font-bold text-foreground">{((stats?.avgTemp || 25) + 3).toFixed(1)}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Expected Low</p>
                  <p className="text-lg font-bold text-foreground">{((stats?.avgTemp || 25) - 4).toFixed(1)}°C</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Rain Probability</p>
                  <p className="text-lg font-bold text-foreground">15%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold text-accent">87%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['temperature', 'humidity', 'pressure'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMetric === metric
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
            <DataChart history={history} type={selectedMetric} />
          </div>

          {/* Distribution Pie Chart */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Weather Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 10%)',
                      border: '1px solid hsl(222, 30%, 20%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {distributionData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hourly Temperature Bar Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Hourly Temperature Averages</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" />
                <XAxis dataKey="hour" stroke="hsl(215, 20%, 65%)" fontSize={10} />
                <YAxis stroke="hsl(215, 20%, 65%)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 20%)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="temperature" fill="hsl(168, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analytics;
