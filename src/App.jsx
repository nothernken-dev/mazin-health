import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Loaded user from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    console.log('Setting user:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  console.log('Current user role:', user.role);
  console.log('Is super admin:', user.is_super_admin);

  // Determine which dashboard to show based on role
  let DashboardComponent;
  let basePath;

  if (user.is_super_admin) {
    DashboardComponent = SuperAdminDashboard;
    basePath = '/super-admin';
  } else if (user.role === 'admin') {
    DashboardComponent = AdminDashboard;
    basePath = '/admin';
  } else if (user.role === 'doctor') {
    DashboardComponent = DoctorDashboard;
    basePath = '/doctor';
  } else if (user.role === 'receptionist') {
    DashboardComponent = ReceptionistDashboard;
    basePath = '/receptionist';
  } else {
    // Fallback - logout
    handleLogout();
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path={`${basePath}/*`} element={<DashboardComponent user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to={basePath} replace />} />
      </Routes>
    </Router>
  );
}

export default App;