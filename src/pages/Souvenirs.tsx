import React, { useState } from 'react';
import { useCity } from '../contexts/CityContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Gift, Info, ShoppingBag, MapPin, Sparkles, Search, Calculator, Filter, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';

export default function Souvenirs() {
  const { intelligence, searchSpecific, loading } = useCity();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'food' | 'craft' | 'clothing' | 'restaurant' | 'market'>('all');

  if (!intelligence) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Gathered</h2>
        <p className="text-gray-500 mb-8 max-w-md">Search for a city on the home page to unlock the Souvenir guide.</p>
        <Link to="/">
          <Button className="rounded-xl px-8">Go Home</Button>
        </Link>
      </div>
    );
  }

  const allItems = [
    ...(intelligence.souvenirs || []).map(s => ({ ...s, type: 'souvenir' as const })),
    ...(intelligence.shops || []).map(s => ({ 
      ...s, 
      type: 'shop' as const, 
      whereToBuy: s.address, 
      fairPrice: s.priceRange === 'low' ? 'Budget Friendly' : s.priceRange === 'medium' ? 'Moderate' : 'Premium' 
    }))
  ];

  const filteredItems = allItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                           item.description.toLowerCase().includes(search.toLowerCase()) ||
                           item.category.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = filter === 'all' || item.category === filter;
      
      // Smart mapping for filters
      if (filter === 'food' && item.category === 'restaurant') matchesFilter = true;
      if (filter === 'market' && item.category === 'craft') matchesFilter = true;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleCalculateFare = (placeName: string) => {
    navigate(`/fare?to=${encodeURIComponent(placeName)}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Local Specialties & Spots</h2>
          <p className="text-gray-500">Discover the best of {intelligence.city} - from food to crafts</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search biryani, hotels, etc..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl h-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {(['all', 'food', 'craft', 'clothing', 'restaurant', 'market'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f as any)}
                className="rounded-full h-11 px-6 capitalize font-bold"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.name}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white h-full flex flex-col group hover:border-primary/30 transition-all">
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold py-0 h-5 border-gray-200 text-gray-500">
                          {item.category}
                        </Badge>
                        {item.type === 'souvenir' ? (
                          <Sparkles size={12} className="text-yellow-500" />
                        ) : (
                          <ShoppingBag size={12} className="text-blue-500" />
                        )}
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">{item.description}</p>
                  
                  <div className="mb-6 flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 w-fit">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      {item.type === 'shop' ? 'Budget:' : 'Fair Price:'}
                    </span>
                    <span className="text-sm font-black text-emerald-700">{item.fairPrice}</span>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Where to buy</p>
                          <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{item.whereToBuy}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl shrink-0 h-10 px-4 gap-2 border-gray-200 text-gray-500 hover:text-primary hover:border-primary"
                        onClick={() => handleCalculateFare(item.whereToBuy)}
                      >
                        <Calculator size={16} /> <span className="text-xs font-bold">Fare</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <Search size={32} />
          </div>
          <p className="text-gray-400 font-medium mb-6">No specialties found matching your search.</p>
          {search && (
            <Button 
              onClick={() => searchSpecific(search)} 
              disabled={loading}
              className="rounded-xl gap-2 h-12 px-8"
            >
              {loading ? 'Searching...' : `Search deeper for "${search}"`}
            </Button>
          )}
        </div>
      )}

      <div className="mt-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <ShoppingBag size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Bargaining Tip</h3>
        <p className="text-gray-500 max-w-md">
          In local markets, always start at 50% of the quoted price and work your way up. Be polite but firm!
        </p>
      </div>
    </div>
  );
}
