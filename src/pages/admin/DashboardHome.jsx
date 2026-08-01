import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, getAppointments, getUsers } from '../../services/api';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalReceptionists: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    scheduledAppointments: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [patientsRes, appointmentsRes, usersRes] = await Promise.all([
        getPatients(),
        getAppointments(),
        getUsers()
      ]);

      const patients = patientsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const users = usersRes.data || [];

      const doctors = users.filter(u => u.role === 'doctor');
      const receptionists = users.filter(u => u.role === 'receptionist');

      const today = new Date().toDateString();
      const todayApps = appointments.filter(apt => 
        new Date(apt.appointment_date).toDateString() === today
      );

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalReceptionists: receptionists.length,
        totalAppointments: appointments.length,
        todayAppointments: todayApps.length,
        completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
        scheduledAppointments: appointments.filter(apt => apt.status === 'scheduled').length
      });

      setRecentAppointments(appointments.slice(0, 5));

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Hospital Info */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Welcome back, {user.full_name}!</h1>
            <p className="text-red-100 text-sm md:text-base mt-1">
              {user.hospital_name || 'Managing hospital system'}
            </p>
          </div>
          <div className="mt-2 sm:mt-0 bg-white/20 px-4 py-2 rounded-lg">
            <span className="text-sm text-white">Hospital ID: {user.hospital_id}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          link="/admin/patients"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Doctors"
          value={stats.totalDoctors}
          link="/admin/doctors"
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
          link="/admin/receptionists"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          link="/admin/appointments"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Today's Appointments</p>
          <p className="text-2xl font-bold text-green-700">{stats.todayAppointments}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-blue-700">{stats.completedAppointments}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.scheduledAppointments}</p>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Appointments</h2>
          <Link to="/admin/appointments" className="text-sm text-red-600 hover:text-red-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="p-5">
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-2">Patient</th>
                    <th className="pb-2">Doctor</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id} className="text-sm">
                      <td className="py-2 font-medium">{apt.patient_name}</td>
                      <td className="py-2">Dr. {apt.doctor_name}</td>
                      <td className="py-2">{new Date(apt.appointment_date).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {apt.status}
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