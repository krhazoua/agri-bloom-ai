import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { HealthAdvisor } from '@/components/HealthAdvisor';
import { useMQTTSimulation } from '@/hooks/useMQTTSimulation';
import { 
  Heart, 
  Leaf, 
  Wind, 
  Droplets,
  Sun,
  ThermometerSun,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const Health = () => {
  const { getAverageData, history } = useMQTTSimulation();
  const avgData = getAverageData();

  // Calculate weekly health score
  const weeklyScore = React.useMemo(() => {
    if (history.length < 10) return 85;
    
    let score = 100;
    const recentData = history.slice(-100);
    
    recentData.forEach(h => {
      if (h.data.temperature > 35 || h.data.temperature < 10) score -= 0.2;
      if (h.data.airQuality > 100) score -= 0.3;
      if (h.data.humidity > 85 || h.data.humidity < 25) score -= 0.2;
    });
    
    return Math.max(0, Math.min(100, score));
  }, [history]);

  const recommendations = React.useMemo(() => {
    if (!avgData) return [];
    
    const recs = [];
    
    if (avgData.temperature > 30) {
      recs.push({
        type: 'warning',
        icon: ThermometerSun,
        title: 'High Temperature Alert',
        description: 'Consider irrigation during early morning or late evening hours.',
      });
    }
    
    if (avgData.humidity < 40) {
      recs.push({
        type: 'info',
        icon: Droplets,
        title: 'Low Humidity',
        description: 'Increase irrigation frequency to maintain soil moisture.',
      });
    }
    
    if (avgData.airQuality > 50) {
      recs.push({
        type: 'warning',
        icon: Wind,
        title: 'Moderate Air Quality',
        description: 'Limit outdoor activities for sensitive individuals.',
      });
    }
    
    if (avgData.light < 300) {
      recs.push({
        type: 'info',
        icon: Sun,
        title: 'Low Light Conditions',
        description: 'Consider supplemental lighting for greenhouse crops.',
      });
    }
    
    if (recs.length === 0) {
      recs.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Optimal Conditions',
        description: 'All environmental parameters are within healthy ranges.',
      });
    }
    
    return recs;
  }, [avgData]);

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
            Environmental <span className="text-accent">Health</span>
          </h1>
          <p className="text-muted-foreground">
            Comprehensive health analysis and smart recommendations
          </p>
        </motion.div>

        {/* Health Score */}
        <motion.div
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-muted"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <motion.circle
                  className="text-accent"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{ strokeDasharray: `${(weeklyScore / 100) * 352} 352` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{weeklyScore.toFixed(0)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Overall Health Score</h3>
              <p className="text-muted-foreground text-sm mb-3">Based on 24-hour analysis</p>
              <div className="flex items-center gap-2">
                {weeklyScore > 80 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm text-success font-medium">Excellent Conditions</span>
                  </>
                ) : weeklyScore > 60 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span className="text-sm text-warning font-medium">Moderate Conditions</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Needs Attention</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Health Advisor */}
        <div className="mb-8">
          <HealthAdvisor data={avgData} />
        </div>

        {/* Smart Recommendations */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20">
              <Leaf className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Smart Recommendations</h3>
              <p className="text-sm text-muted-foreground">AI-powered agricultural advice</p>
            </div>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const bgColor = rec.type === 'warning' 
                ? 'bg-warning/10' 
                : rec.type === 'success' 
                  ? 'bg-success/10' 
                  : 'bg-info/10';
              const iconColor = rec.type === 'warning' 
                ? 'text-warning' 
                : rec.type === 'success' 
                  ? 'text-success' 
                  : 'text-info';

              return (
                <motion.div
                  key={index}
                  className={`p-4 rounded-xl ${bgColor} border border-border/50`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Health;
