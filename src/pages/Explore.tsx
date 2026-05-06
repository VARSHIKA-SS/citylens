import { useCity } from '../contexts/CityContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Star, MapPin, ExternalLink, Info, ShieldAlert, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Explore() {
  const { intelligence, loading } = useCity();

  if (!intelligence && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Gathered</h2>
        <p className="text-gray-500 mb-8 max-w-md">Search for a city on the home page to unlock street-smart recommendations.</p>
        <Link to="/">
          <Button className="rounded-xl px-8">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-1 rounded-full">
              {intelligence?.state}
            </Badge>
          </div>
          <h2 className="text-5xl font-black tracking-tight text-gray-900">{intelligence?.city}</h2>
        </div>
        <div className="flex gap-2">
          <Link to="/map">
            <Button variant="outline" className="rounded-xl gap-2 border-gray-200">
              <MapPin size={18} /> View on Map
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
              Recommended Shops & Spots
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {(intelligence?.shops || []).map((shop, i) => (
                <motion.div
                  key={shop.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:border-primary/30 transition-all group bg-white">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold py-0 h-5 border-gray-200 text-gray-500">
                                  {shop.category}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${
                                    shop.priceRange === 'low' ? 'bg-green-500' : 
                                    shop.priceRange === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    {shop.priceRange} Budget
                                  </span>
                                </div>
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{shop.name}</h4>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-bold">{shop.rating}</span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Where to buy</p>
                            <p className="text-sm font-bold text-gray-700">{shop.address}</p>
                          </div>
                          <p className="text-gray-500 text-sm mb-4 leading-relaxed">{shop.description}</p>
                          <div className="flex items-center gap-4">
                            <a
                              href={shop.mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary font-bold text-xs hover:underline"
                            >
                              <MapPin size={14} /> View Location <ExternalLink size={12} />
                            </a>
                            <Link 
                              to={`/fare?to=${encodeURIComponent(shop.name)}&lat=${shop?.location?.[0] || 0}&lon=${shop?.location?.[1] || 0}`}
                              className="inline-flex items-center gap-2 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
                            >
                              <Calculator size={14} /> Check Fare
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
              <ShieldAlert size={24} />
              Safety & Scams
            </h3>
            <ul className="space-y-4">
              {(intelligence?.safetyTips || []).map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">
              <Info size={24} />
              Cultural Etiquette
            </h3>
            <ul className="space-y-4">
              {(intelligence?.etiquette || []).map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
