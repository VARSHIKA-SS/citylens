import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'motion/react';

export default function Login() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(name, gender, password);
      } else {
        await register(name, gender, password);
      }
      navigate('/');
    } catch (err: any) {
      alert(`Authentication failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl shadow-primary/20">
            CL
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">CityLens</h1>
          <p className="text-gray-500 mt-2">Your street-smart travel companion</p>
        </div>

        <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="pb-0">
            <Tabs defaultValue="login" onValueChange={(v) => setIsLogin(v === 'login')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Login</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Register</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-primary"
                  required
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Gender</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant={gender === g ? 'default' : 'outline'}
                        onClick={() => setGender(g as any)}
                        className="rounded-xl capitalize"
                      >
                        {g}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-gray-200 focus:ring-primary"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold mt-4 shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isLogin ? 'Welcome Back' : 'Start Journey'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6">
            <p className="text-xs text-center text-gray-400 w-full">
              By continuing, you agree to our street-smart terms of service.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
