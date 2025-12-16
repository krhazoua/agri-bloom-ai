import { useState, useEffect, useCallback } from 'react';

export interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  airQuality: number;
  rain: boolean;
  light: number;
  battery: number;
  timestamp: Date;
}

export interface StationData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  sensors: SensorData;
  status: 'online' | 'offline';
}

const generateSensorData = (): SensorData => {
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 20;
  const baseTemp = isNight ? 18 : 28;
  
  return {
    temperature: baseTemp + (Math.random() * 8 - 4),
    humidity: 40 + Math.random() * 40,
    pressure: 1000 + Math.random() * 30,
    airQuality: 20 + Math.random() * 60,
    rain: Math.random() > 0.85,
    light: isNight ? Math.random() * 50 : 400 + Math.random() * 600,
    battery: 70 + Math.random() * 30,
    timestamp: new Date(),
  };
};

const stations: Omit<StationData, 'sensors'>[] = [
  { id: 'station-1', name: 'Field Alpha', location: { lat: 36.8065, lng: 10.1815 }, status: 'online' },
  { id: 'station-2', name: 'Field Beta', location: { lat: 36.8165, lng: 10.1915 }, status: 'online' },
];

export const useMQTTSimulation = () => {
  const [data, setData] = useState<StationData[]>([]);
  const [history, setHistory] = useState<{ timestamp: Date; data: SensorData }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const initializeData = useCallback(() => {
    const initialData = stations.map(station => ({
      ...station,
      sensors: generateSensorData(),
    }));
    setData(initialData);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    initializeData();

    // Generate historical data for the last 24 hours
    const historicalData: { timestamp: Date; data: SensorData }[] = [];
    for (let i = 24 * 60; i >= 0; i -= 5) {
      const timestamp = new Date(Date.now() - i * 60 * 1000);
      historicalData.push({
        timestamp,
        data: generateSensorData(),
      });
    }
    setHistory(historicalData);

    // Simulate real-time MQTT updates
    const interval = setInterval(() => {
      setData(prev => prev.map(station => ({
        ...station,
        sensors: generateSensorData(),
      })));

      setHistory(prev => {
        const newEntry = {
          timestamp: new Date(),
          data: generateSensorData(),
        };
        const updated = [...prev, newEntry];
        // Keep last 24 hours only
        return updated.slice(-288);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [initializeData]);

  const getAverageData = useCallback((): SensorData | null => {
    if (data.length === 0) return null;
    
    const sum = data.reduce((acc, station) => ({
      temperature: acc.temperature + station.sensors.temperature,
      humidity: acc.humidity + station.sensors.humidity,
      pressure: acc.pressure + station.sensors.pressure,
      airQuality: acc.airQuality + station.sensors.airQuality,
      rain: acc.rain || station.sensors.rain,
      light: acc.light + station.sensors.light,
      battery: acc.battery + station.sensors.battery,
      timestamp: new Date(),
    }), {
      temperature: 0,
      humidity: 0,
      pressure: 0,
      airQuality: 0,
      rain: false,
      light: 0,
      battery: 0,
      timestamp: new Date(),
    });

    const count = data.length;
    return {
      temperature: sum.temperature / count,
      humidity: sum.humidity / count,
      pressure: sum.pressure / count,
      airQuality: sum.airQuality / count,
      rain: sum.rain,
      light: sum.light / count,
      battery: sum.battery / count,
      timestamp: new Date(),
    };
  }, [data]);

  const getWeatherCondition = useCallback((): 'sunny' | 'rainy' | 'night' | 'cloudy' => {
    const avg = getAverageData();
    if (!avg) return 'sunny';
    
    const hour = new Date().getHours();
    if (hour < 6 || hour > 20) return 'night';
    if (avg.rain) return 'rainy';
    if (avg.humidity > 70) return 'cloudy';
    return 'sunny';
  }, [getAverageData]);

  return {
    stations: data,
    history,
    isConnected,
    getAverageData,
    getWeatherCondition,
  };
};
