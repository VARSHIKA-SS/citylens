import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Compass, Map as MapIcon, Calculator, Languages, Gift, LogOut, User as UserIcon, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Chatbot } from './Chatbot';
import { isNative, initMobile } from '../lib/mobile';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    initMobile();
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/map', icon: MapIcon, label: 'Map' },
    { path: '/fare', icon: Calculator, label: 'Fare Engine' },
    { path: '/lingo', icon: Languages, label: 'Lingo' },
    { path: '/souvenirs', icon: Gift, label: 'Souvenirs' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user && location.pathname !== '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex justify-around p-3 backdrop-blur-md bg-white/90">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-2.5 rounded-xl transition-all ${location.pathname === item.path ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <item.icon size={20} />
          </Link>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter">
              CL
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">CITYLENS</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Street Intelligence</p>
                {isNative() && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                    <Smartphone size={8} /> Native
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4">Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
                location.pathname === item.path
                  ? 'bg-gray-900 text-white shadow-xl shadow-gray-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={location.pathname === item.path ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div layoutId="nav-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-50">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{user?.gender} traveler</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl h-12 px-4 transition-all"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}
