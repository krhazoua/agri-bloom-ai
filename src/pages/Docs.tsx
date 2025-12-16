import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { 
  BookOpen, 
  Code, 
  Database, 
  Wifi, 
  Cpu, 
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  code?: string;
}

const docSections: DocSection[] = [
  {
    id: 'mqtt-topics',
    title: 'MQTT Topics',
    icon: Wifi,
    content: 'The system uses wildcard MQTT topics for flexible data routing. Each station publishes sensor data to its dedicated topic namespace.',
    code: `// MQTT Topic Structure
station/+/temperature    // °C float
station/+/humidity       // % float
station/+/pressure       // hPa float
station/+/air_quality    // AQI integer
station/+/rain           // boolean
station/+/light          // lux float
station/+/battery        // % float

// Example subscription
mqttClient.subscribe('station/+/#');`,
  },
  {
    id: 'hardware',
    title: 'Hardware Setup',
    icon: Cpu,
    content: 'AGRI VISION uses ESP32 microcontrollers with various environmental sensors for comprehensive weather monitoring.',
    code: `// Hardware Configuration
ESP32 (x2) - Main processing units
├── DHT11  - Temperature & Humidity
├── BMP180 - Barometric Pressure
├── MQ135  - Air Quality
├── YL-83  - Rain Detection
└── LDR    - Light Intensity

Arduino Uno
├── LCD Display (16x2)
└── Buzzer (alerts)`,
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    content: 'RESTful API endpoints for data access and station management. All endpoints return JSON responses.',
    code: `// API Endpoints
GET  /api/stations              // List all stations
GET  /api/stations/:id          // Get station details
GET  /api/stations/:id/data     // Get sensor data
POST /api/stations/:id/config   // Update config

// WebSocket Events
ws://host/realtime
├── sensor_update
├── alert_triggered
└── station_status

// Example Response
{
  "station_id": "station-1",
  "temperature": 25.5,
  "humidity": 65,
  "timestamp": "2024-01-15T10:30:00Z"
}`,
  },
  {
    id: 'database',
    title: 'Database Schema',
    icon: Database,
    content: 'PostgreSQL database schema for persistent data storage and historical analysis.',
    code: `-- Stations Table
CREATE TABLE stations (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  location POINT,
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Sensor Readings
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  station_id UUID REFERENCES stations(id),
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  pressure DECIMAL(7,2),
  air_quality INTEGER,
  rain BOOLEAN,
  light DECIMAL(7,2),
  recorded_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_readings_station 
  ON readings(station_id);
CREATE INDEX idx_readings_time 
  ON readings(recorded_at DESC);`,
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: Layers,
    content: 'Multi-tier architecture with frontend, backend, and IoT layers communicating through MQTT and REST.',
    code: `┌─────────────────────────────────────────┐
│           AGRI VISION ARCHITECTURE        │
├─────────────────────────────────────────┤
│                                           │
│  ┌─────────┐      ┌─────────────────┐   │
│  │ ESP32   │─────▶│ MQTT Mosquitto  │   │
│  │ Sensors │      │    Broker       │   │
│  └─────────┘      └────────┬────────┘   │
│                            │             │
│  ┌─────────┐      ┌────────▼────────┐   │
│  │ React   │◀────▶│   Node.js       │   │
│  │ Frontend│      │   Backend       │   │
│  └─────────┘      └────────┬────────┘   │
│                            │             │
│                   ┌────────▼────────┐   │
│                   │  PostgreSQL     │   │
│                   │  Database       │   │
│                   └─────────────────┘   │
│                                           │
└─────────────────────────────────────────┘`,
  },
];

const Docs = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('mqtt-topics');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, sectionId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(sectionId);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
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
            <span className="text-accent">Documentation</span>
          </h1>
          <p className="text-muted-foreground">
            Interactive technical documentation for AGRI VISION
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {docSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setExpandedSection(section.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  expandedSection === section.id
                    ? 'bg-accent/20 border border-accent/50'
                    : 'bg-muted/50 border border-border/50 hover:border-accent/30'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${expandedSection === section.id ? 'text-accent' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium text-foreground">{section.title}</p>
              </button>
            );
          })}
        </motion.div>

        {/* Documentation Sections */}
        <div className="space-y-4">
          {docSections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <motion.div
                key={section.id}
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isExpanded ? 'bg-accent/20' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isExpanded ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{section.content}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-accent" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-muted-foreground mb-4">{section.content}</p>
                    
                    {section.code && (
                      <div className="relative">
                        <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-xl border border-border/50 border-b-0">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Code Example</span>
                          </div>
                          <button
                            onClick={() => handleCopy(section.code!, section.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                          >
                            {copiedCode === section.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-background p-4 rounded-b-xl border border-border/50 overflow-x-auto">
                          <code className="text-sm text-foreground font-mono whitespace-pre">
                            {section.code}
                          </code>
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Expert Mode Toggle */}
        <motion.div
          className="glass-card p-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/20">
                <Code className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Expert Mode</h3>
                <p className="text-sm text-muted-foreground">View raw MQTT payloads and technical diagnostics</p>
              </div>
            </div>
            <button
              onClick={() => toast.info('Expert mode coming soon!')}
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Enable
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Docs;
