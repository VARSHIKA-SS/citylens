import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CityProvider } from './contexts/CityContext';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MapPage from './pages/MapPage';
import FareEngine from './pages/FareEngine';
import Lingo from './pages/Lingo';
import Souvenirs from './pages/Souvenirs';
import Login from './pages/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
              <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
              <Route path="/fare" element={<PrivateRoute><FareEngine /></PrivateRoute>} />
              <Route path="/lingo" element={<PrivateRoute><Lingo /></PrivateRoute>} />
              <Route path="/souvenirs" element={<PrivateRoute><Souvenirs /></PrivateRoute>} />
            </Routes>
          </Layout>
        </Router>
      </CityProvider>
    </AuthProvider>
  );
}
