import React from 'react';
import { useCity } from '../contexts/CityContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent } from '../components/ui/card';
import { Star, ExternalLink, Info, Calculator, Landmark, Utensils, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const getShopIcon = (priceRange: 'low' | 'medium' | 'high') => {
  const color = priceRange === 'low' ? 'green' : priceRange === 'medium' ? 'gold' : 'red';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const pointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapPage() {
  const { intelligence } = useCity();
  const navigate = useNavigate();

  if (!intelligence) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Gathered</h2>
        <p className="text-gray-500 mb-8 max-w-md">Search for a city on the home page to unlock the map view.</p>
        <Link to="/">
          <Button className="rounded-xl px-8">Go Home</Button>
        </Link>
      </div>
    );
  }

  const center: [number, number] = (intelligence.famousPoints?.[0]?.location) || (intelligence.shops?.[0]?.location) || [20.5937, 78.9629];

  const handleCalculateFare = (point: { name: string, location: [number, number] }) => {
    navigate(`/fare?to=${encodeURIComponent(point.name)}&lat=${point.location[0]}&lon=${point.location[1]}`);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Intelligence Map</h2>
          <p className="text-gray-500">Visualizing street-smart spots in {intelligence.city}</p>
        </div>
        <div className="flex gap-4 mb-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Low
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Mid
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" /> High
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Landmark
          </div>
        </div>
      </header>

      <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-white relative z-0">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Shops */}
          {(intelligence.shops || []).map((shop) => (
            <Marker key={shop.name} position={shop.location} icon={getShopIcon(shop.priceRange)}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-2 mb-1">
                    {shop.category === 'restaurant' ? <Utensils size={14} className="text-primary" /> : <ShoppingBag size={14} className="text-primary" />}
                    <h4 className="font-black text-lg tracking-tight">{shop.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold">{shop.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        shop.priceRange === 'low' ? 'bg-green-500' : 
                        shop.priceRange === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{shop.priceRange}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-xs font-bold text-gray-700 mb-2">{shop.address}</p>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{shop.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-[10px] font-bold rounded-lg flex-1 gap-1"
                      onClick={() => handleCalculateFare(shop)}
                    >
                      <Calculator size={12} /> Fare
                    </Button>
                    <a
                      href={shop.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Famous Points */}
          {(intelligence.famousPoints || []).map((point) => (
            <Marker key={point.name} position={point.location} icon={pointIcon}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Landmark size={14} className="text-red-500" />
                    <h4 className="font-bold text-lg">{point.name}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{point.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold rounded-lg gap-1"
                    onClick={() => handleCalculateFare(point)}
                  >
                    <Calculator size={12} /> Calculate Fare to here
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
