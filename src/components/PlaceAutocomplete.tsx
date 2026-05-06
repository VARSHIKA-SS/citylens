import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Loader2 } from 'lucide-react';

interface Place {
  display_name: string;
  lat: string;
  lon: string;
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string, lat?: number, lon?: number) => void;
  placeholder?: string;
  className?: string;
}

export function PlaceAutocomplete({ value, onChange, placeholder, className }: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`, {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CityLens-App/1.0'
          }
        });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Autocomplete failed', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="rounded-xl pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {loading ? <Loader2 className="animate-spin text-gray-400" size={18} /> : <MapPin className="text-gray-400" size={18} />}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {suggestions.map((place, i) => (
              <li
                key={i}
                onClick={() => {
                  onChange(place.display_name, parseFloat(place.lat), parseFloat(place.lon));
                  setShowSuggestions(false);
                }}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-none flex items-start gap-3"
              >
                <MapPin className="text-primary shrink-0 mt-0.5" size={14} />
                <span className="line-clamp-2">{place.display_name}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
