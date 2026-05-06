import React, { useState, useEffect } from 'react';
import { useCity } from '../contexts/CityContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calculator, Info, Car, Bike, ArrowRight, AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { PlaceAutocomplete } from '../components/PlaceAutocomplete';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function FareEngine() {
  const { intelligence } = useCity();
  const location = useLocation();
  const [from, setFrom] = useState({ name: '', lat: 0, lon: 0 });
  const [to, setTo] = useState({ name: '', lat: 0, lon: 0 });
  const [distance, setDistance] = useState<number | null>(null);
  const [result, setResult] = useState<{ auto: number; taxi: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toName = params.get('to');
    const toLat = params.get('lat');
    const toLon = params.get('lon');
    
    if (toName && toLat && toLon) {
      setTo({ name: toName, lat: parseFloat(toLat), lon: parseFloat(toLon) });
    }
  }, [location]);

  if (!intelligence) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Gathered</h2>
        <p className="text-gray-500 mb-8 max-w-md">Search for a city on the home page to unlock the Fare Engine.</p>
        <Link to="/">
          <Button className="rounded-xl px-8">Go Home</Button>
        </Link>
      </div>
    );
  }

  const handleCalculate = () => {
    if (!from.lat || !to.lat) return;
    
    const d = calculateDistance(from.lat, from.lon, to.lat, to.lon);
    setDistance(parseFloat(d.toFixed(2)));

    const { autoBase, autoPerKm, taxiBase, taxiPerKm } = intelligence.transportFares || { autoBase: 25, autoPerKm: 15, taxiBase: 100, taxiPerKm: 25 };
    
    setResult({
      auto: Math.round(autoBase + (d > 1.5 ? (d - 1.5) * autoPerKm : 0)),
      taxi: Math.round(taxiBase + (d > 2 ? (d - 2) * taxiPerKm : 0))
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Fair Fare Engine</h2>
        <p className="text-gray-500">Localized transport cost estimator for {intelligence.city}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl shadow-gray-100/50 rounded-3xl p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Calculator className="text-primary" /> Trip Planner
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">From</label>
                <PlaceAutocomplete
                  value={from.name}
                  onChange={(name, lat, lon) => setFrom({ name, lat: lat || 0, lon: lon || 0 })}
                  placeholder="Starting point..."
                />
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <ArrowRight size={16} className="rotate-90 md:rotate-0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">To</label>
                <PlaceAutocomplete
                  value={to.name}
                  onChange={(name, lat, lon) => setTo({ name, lat: lat || 0, lon: lon || 0 })}
                  placeholder="Destination..."
                />
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              disabled={!from.lat || !to.lat}
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
            >
              Calculate Fare
            </Button>

            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex gap-3 text-orange-800 text-sm">
              <AlertCircle className="shrink-0" size={18} />
              <p>Fares are estimates based on local intelligence. Night charges (11 PM - 5 AM) usually add 50% extra.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-primary text-white rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-primary/20">
                <div className="flex items-center gap-3">
                  <MapPin size={20} />
                  <span className="font-bold">Total Distance</span>
                </div>
                <span className="text-2xl font-black">{distance} KM</span>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 border border-yellow-100">
                    <Bike size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Auto Rickshaw</h4>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Base: ₹{intelligence.transportFares?.autoBase || 0} + ₹{intelligence.transportFares?.autoPerKm || 0}/km</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900 font-mono tracking-tighter">₹{result.auto}</p>
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Fair Price</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <Car size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Taxi / Cab</h4>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Base: ₹{intelligence.transportFares?.taxiBase || 0} + ₹{intelligence.transportFares?.taxiPerKm || 0}/km</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900 font-mono tracking-tighter">₹{result.taxi}</p>
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Fair Price</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                <Calculator size={32} />
              </div>
              <p className="text-gray-400 font-medium">Select points to see fair prices</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
