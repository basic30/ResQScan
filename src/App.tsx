// ============================================
// ResQScan - Main Application
// Safety That Travels With You
// Emergency Medical QR Card System
// ============================================

import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import ScanCard from './pages/ScanCard';

// Layout with Navbar for main pages
function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Scan Card page - no navbar, standalone, public */}
          <Route path="/scan/:data" element={<ScanCard />} />

          {/* Emergency page - no navbar, standalone (legacy) */}
          <Route path="/emergency/:data" element={<Emergency />} />

          {/* All other pages with navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
