import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHospitals, getUsers } from '../../services/api';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalDoctors: 0,
    totalReceptionists: 0
  });
  const [recentHospitals, setRecentHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [hospitalsRes, usersRes] = await Promise.all([
        getHospitals(),
        getUsers()
      ]);

      const hospitals = hospitalsRes.data || [];
      const users = usersRes.data || [];

      setStats({
        totalHospitals: hospitals.length,
        activeHospitals: hospitals.filter(h => h.is_active).length,
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalDoctors: users.filter(u => u.role === 'doctor').length,
        totalReceptionists: users.filter(u => u.role === 'receptionist').length
      });

      setRecentHospitals(hospitals.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, link }) => (
    <Link to={link} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`${bgColor} p-2 md:p-3 rounded-xl flex-shrink-0 ml-3`}>
            <div className={`w-5 h-5 md:w-6 md:h-6 ${color}`}>{icon}</div>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Welcome, {user.full_name}!</h1>
            <p className="text-purple-100 text-sm md:text-base mt-1">Super Admin Dashboard - Manage all hospitals</p>
          </div>
          <div className="mt-2 sm:mt-0 bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm text-white">System-wide Access</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Hospitals"
          value={stats.totalHospitals}
          link="/super-admin/hospitals"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Hospitals"
          value={stats.activeHospitals}
          link="/super-admin/hospitals"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          link="/super-admin/users"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Admins"
          value={stats.totalAdmins}
          link="/super-admin/users"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Doctors"
          value={stats.totalDoctors}
          link="/super-admin/users"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Receptionists"
          value={stats.totalReceptionists}
          link="/super-admin/users"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Recent Hospitals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Hospitals</h2>
          <Link to="/super-admin/hospitals" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="p-5">
          {recentHospitals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hospitals found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Users</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentHospitals.map((hospital) => (
                    <tr key={hospital.id} className="text-sm">
                      <td className="py-2 font-medium">{hospital.name}</td>
                      <td className="py-2">{hospital.code}</td>
                      <td className="py-2">{hospital.user_count || 0}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          hospital.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {hospital.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;