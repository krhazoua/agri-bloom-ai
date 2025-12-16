import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { useMQTTSimulation } from '@/hooks/useMQTTSimulation';
import { 
  Settings2, 
  Power, 
  RefreshCw, 
  Bell, 
  Wifi,
  Battery,
  Cpu,
  HardDrive,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';

const Control = () => {
  const { stations, isConnected } = useMQTTSimulation();
  const [alerts, setAlerts] = useState({
    temperature: true,
    humidity: true,
    rain: true,
    airQuality: false,
  });
  const [refreshInterval, setRefreshInterval] = useState(3);

  const handleAlertToggle = (type: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [type]: !prev[type] }));
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} alerts ${!alerts[type] ? 'enabled' : 'disabled'}`);
  };

  const handleRefresh = () => {
    toast.success('Refreshing sensor data...');
  };

  const handleRestart = (stationId: string) => {
    toast.info(`Restarting station ${stationId}...`);
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
            Station <span className="text-accent">Control</span>
          </h1>
          <p className="text-muted-foreground">
            Manage and configure your IoT weather stations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station List */}
          <motion.div
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/20">
                  <Cpu className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Active Stations</h3>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {stations.map((station, index) => (
                <motion.div
                  key={station.id}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${station.status === 'online' ? 'bg-success' : 'bg-destructive'}`} />
                      <span className="font-medium text-foreground">{station.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      station.status === 'online' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {station.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Strong</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{station.sensors.battery.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">2.1GB</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestart(station.id)}
                      className="flex-1 py-2 px-3 rounded-lg bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
                    >
                      Restart
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                      Configure
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alert Settings */}
          <div className="space-y-6">
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/20">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Alert Settings</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(alerts).map(([key, enabled]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{key} Alerts</p>
                      <p className="text-xs text-muted-foreground">
                        {enabled ? 'Notifications enabled' : 'Notifications disabled'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAlertToggle(key as keyof typeof alerts)}
                      className="text-accent"
                    >
                      {enabled ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/20">
                  <Settings2 className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">System Status</h3>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'MQTT Broker', status: isConnected },
                  { name: 'Database', status: true },
                  { name: 'API Server', status: true },
                  { name: 'Weather API', status: true },
                ].map((service, index) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm text-foreground">{service.name}</span>
                    <div className="flex items-center gap-2">
                      {service.status ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-xs text-success">Online</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-xs text-destructive">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Refresh Interval */}
            <motion.div
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Data Refresh Interval</h3>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map((interval) => (
                  <button
                    key={interval}
                    onClick={() => {
                      setRefreshInterval(interval);
                      toast.success(`Refresh interval set to ${interval}s`);
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      refreshInterval === interval
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {interval}s
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Control;
