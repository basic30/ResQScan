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
          {/* Emergency page - no navbar, standalone */}
          <Route path="/emergency/:data" element={<Emergency />} />

          {/* All other pages with navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
