import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import DashboardHome from './admin/DashboardHome';
import ManageDoctors from './admin/ManageDoctors';
import ManageReceptionists from './admin/ManageReceptionists';
import AllPatients from './admin/AllPatients';
import AllAppointments from './admin/AllAppointments';
import { getPatients, getAppointments, getUsers } from '../services/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patientsRes, appointmentsRes, usersRes] = await Promise.all([
        getPatients(),
        getAppointments(),
        getUsers()
      ]);

      const users = usersRes.data || [];
      const doctors = users.filter(u => u.role === 'doctor');
      const receptionists = users.filter(u => u.role === 'receptionist');

      setStats({
        totalPatients: patientsRes.data?.length || 0,
        totalDoctors: doctors.length,
        totalReceptionists: receptionists.length,
        totalAppointments: appointmentsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={user} stats={stats} unreadNotifications={0} />
      
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your hospital system</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome user={user} />} />
          <Route path="/doctors" element={<ManageDoctors />} />
          <Route path="/receptionists" element={<ManageReceptionists />} />
          <Route path="/patients" element={<AllPatients />} />
          <Route path="/appointments" element={<AllAppointments />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;