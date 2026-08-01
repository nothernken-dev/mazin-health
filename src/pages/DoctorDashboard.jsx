import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorSidebar from '../components/DoctorSidebar';
import DashboardHome from './doctor/DashboardHome';
import PatientsPage from './doctor/PatientsPage';
import AppointmentsPage from './doctor/AppointmentsPage';
import CalendarPage from './doctor/CalendarPage';
import PrescriptionsPage from './doctor/PrescriptionsPage';
import AnalyticsPage from './doctor/AnalyticsPage';
import { getDoctorPatients, getAppointments } from '../services/api';

const DoctorDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    unreadNotifications: 3
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const patientsRes = await getDoctorPatients(user.id);
      const appointmentsRes = await getAppointments();
      
      const today = new Date().toDateString();
      const todayApps = appointmentsRes.data.filter(apt => {
        if (apt.doctor_id === user.id) {
          return new Date(apt.appointment_date).toDateString() === today;
        }
        return false;
      });

      setStats({
        totalPatients: patientsRes.data.length,
        todayAppointments: todayApps.length,
        unreadNotifications: 3
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DoctorSidebar user={user} stats={stats} unreadNotifications={stats.unreadNotifications} />
      
      {/* Main Content */}
      <div className="lg:ml-64 p-4 sm:p-6 md:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome back, Dr. {user.full_name}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome user={user} />} />
          <Route path="/patients" element={<PatientsPage user={user} />} />
          <Route path="/appointments" element={<AppointmentsPage user={user} />} />
          <Route path="/calendar" element={<CalendarPage user={user} />} />
          <Route path="/prescriptions" element={<PrescriptionsPage user={user} />} />
          <Route path="/analytics" element={<AnalyticsPage user={user} />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorDashboard;