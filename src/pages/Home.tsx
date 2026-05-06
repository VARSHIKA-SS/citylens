import React, { useState, useEffect } from 'react';
import { useCity } from '../contexts/CityContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { motion } from 'motion/react';
import { useGeolocation } from '../hooks/useGeolocation';
import { triggerHaptic } from '../lib/mobile';

export default function Home() {
  const [city, setCity] = useState('');
  const { fetchIntelligence, loading: cityLoading, intelligence, fetchCityFromCoords, error } = useCity();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { location: geoLoc, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();

  const loading = cityLoading || geoLoading;

  useEffect(() => {
    if (geoLoc && !intelligence && !loading) {
      fetchCityFromCoords(geoLoc.lat, geoLoc.lon).then((success) => {
        if (success) navigate('/explore');
      });
    }
  }, [geoLoc, intelligence, loading]);

  const handleNearby = () => {
    triggerHaptic();
    if (geoLoc) {
      fetchCityFromCoords(geoLoc.lat, geoLoc.lon).then((success) => {
        if (success) navigate('/explore');
      });
    } else {
      requestLocation();
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    triggerHaptic();
    const success = await fetchIntelligence(city);
    if (success) navigate('/explore');
  };

  const popularCities = ['Mumbai', 'Chennai', 'Kochi', 'Jaipur', 'Varanasi'];

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4">Welcome back</p>
          <h2 className="text-6xl font-black tracking-tighter text-gray-900 mb-4 leading-none">
            Vanakkam, <br />{user?.name}! 👋
          </h2>
          <p className="text-lg text-gray-400 font-medium">Where are we gathering intelligence today?</p>
        </motion.div>
      </header>

      <section className="mb-20">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-gray-300 group-focus-within:text-primary transition-colors">
            <Search size={28} />
          </div>
          <Input
            placeholder="Search city (e.g. Madurai, Kochi, Jaipur...)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full h-24 pl-20 pr-48 text-2xl font-bold rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/30 focus-visible:ring-primary bg-white placeholder:text-gray-200"
          />
          <Button
            type="submit"
            disabled={loading}
            className="absolute right-4 top-4 bottom-4 px-10 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            {loading ? '...' : 'Explore'}
          </Button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNearby}
            disabled={loading}
            className={`rounded-xl h-11 px-6 gap-2 border-primary/20 font-black uppercase tracking-wider transition-all ${geoError ? 'text-red-500 border-red-100' : 'text-primary hover:bg-primary hover:text-white'}`}
          >
            <MapPin size={16} /> 
            {geoLoading ? 'Locating...' : geoError ? 'Retry Location' : 'Nearby'}
          </Button>
          {geoError && <span className="text-[10px] text-red-400 font-bold uppercase tracking-tight">Permission denied or error</span>}
          <div className="w-px h-6 bg-gray-100 mx-2" />
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">Hotspots:</span>
          {popularCities.map((c) => (
            <button
              key={c}
              onClick={() => { setCity(c); fetchIntelligence(c).then((success) => success && navigate('/explore')); }}
              className="px-5 py-2.5 bg-white rounded-xl text-xs font-black text-gray-500 hover:bg-gray-900 hover:text-white transition-all shadow-sm border border-gray-100 uppercase tracking-wider"
            >
              {c}
            </button>
          ))}
        </div>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center"
          >
            {error}
          </motion.div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden group hover:border-blue-200 transition-all">
          <CardContent className="p-8 relative">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Fair Fare Engine</h3>
            <p className="text-gray-400 text-xs font-medium leading-relaxed">Never get overcharged. AI-powered local transport cost estimator.</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden group hover:border-orange-200 transition-all">
          <CardContent className="p-8 relative">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 border border-orange-100">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Street Smart</h3>
            <p className="text-gray-400 text-xs font-medium leading-relaxed">Local secrets, scams to avoid, and cultural etiquette at your fingertips.</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-3xl bg-white overflow-hidden group hover:border-emerald-200 transition-all">
          <CardContent className="p-8 relative">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
              <MapPin size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Local Lingo</h3>
            <p className="text-gray-400 text-xs font-medium leading-relaxed">Bridge the gap with essential phrases in the local script and pronunciation.</p>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"
        >
          <div className="w-24 h-24 relative mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
            />
            <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Gathering Intelligence...</h3>
          <p className="text-gray-500 mt-2">Connecting with local street-smart nodes</p>
        </motion.div>
      )}
    </div>
  );
}
