import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import DashboardHome from './super-admin/DashboardHome';
import ManageHospitals from './super-admin/ManageHospitals';
import ManageUsers from './super-admin/ManageUsers';
import SystemSettings from './super-admin/SystemSettings';
import { getHospitals, getUsers } from '../services/api';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalUsers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [hospitalsRes, usersRes] = await Promise.all([
        getHospitals(),
        getUsers()
      ]);
      setStats({
        totalHospitals: hospitalsRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SuperAdminSidebar user={user} stats={stats} />
      
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all hospitals and users</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardHome user={user} />} />
          <Route path="/hospitals" element={<ManageHospitals />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;