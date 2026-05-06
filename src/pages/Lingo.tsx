import { useCity } from '../contexts/CityContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Languages, Info, Volume2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Lingo() {
  const { intelligence } = useCity();

  if (!intelligence) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Gathered</h2>
        <p className="text-gray-500 mb-8 max-w-md">Search for a city on the home page to unlock the Lingo bridge.</p>
        <Link to="/">
          <Button className="rounded-xl px-8">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Local Lingo</h2>
        <p className="text-gray-500">Essential phrases for {intelligence.city} in the local script</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(intelligence.lingo || []).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white hover:border-emerald-200 transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <MessageSquare size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Meaning</p>
                    <p className="text-sm font-black text-emerald-600 uppercase tracking-tight">{item.meaning}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-4xl font-black text-gray-900 mb-1 tracking-tight">{item.script}</p>
                    <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">{item.phrase}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                    <Volume2 size={16} className="text-gray-400" />
                    <p className="text-xs font-medium text-gray-500">
                      Pronunciation: <span className="text-gray-900 font-mono font-bold">[{item.pronunciation}]</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-emerald-600 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-2xl font-bold mb-2">Street Tip</h3>
          <p className="text-emerald-100 leading-relaxed">
            Locals appreciate when you try to speak their language. Even a simple "Nanni" (Thank you) or "Namaskaram" can open doors and get you better service!
          </p>
        </div>
        <Languages className="absolute right-[-20px] bottom-[-20px] text-white/10 w-64 h-64 rotate-12" />
      </div>
    </div>
  );
}
