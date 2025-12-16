import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  Heart, 
  Settings2, 
  GitCompare, 
  BookOpen,
  Leaf,
  Wifi
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/control', label: 'Control', icon: Settings2 },
  { path: '/compare', label: 'Compare', icon: GitCompare },
  { path: '/docs', label: 'Docs', icon: BookOpen },
];

interface LayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isConnected = true }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 rounded-none">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Leaf className="w-6 h-6 text-accent-foreground" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight">
                  AGRI <span className="text-accent">VISION</span>
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Weather Intelligence
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 flex items-center gap-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-accent' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-accent/10 rounded-lg -z-10"
                        layoutId="nav-indicator"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <Wifi className={`w-4 h-4 ${isConnected ? 'text-success' : 'text-destructive'}`} />
                <span className="text-xs font-medium text-muted-foreground">
                  {isConnected ? 'MQTT Online' : 'Offline'}
                </span>
                <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/50 rounded-none">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};
