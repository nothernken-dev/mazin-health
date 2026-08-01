import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, getAppointments, getDoctors } from '../../services/api';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    firstTime: 0,
    returning: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedToday: 0,
    availableDoctors: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const patientsRes = await getPatients();
      const patients = patientsRes.data || [];
      
      const firstTime = patients.filter(p => !p.is_returning).length;
      const returning = patients.filter(p => p.is_returning).length;
      
      const appointmentsRes = await getAppointments();
      const appointments = appointmentsRes.data || [];
      
      const doctorsRes = await getDoctors();
      
      const today = new Date().toDateString();
      const todayApps = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date).toDateString();
        return aptDate === today;
      });

      const completedToday = todayApps.filter(apt => apt.status === 'completed').length;
      const upcomingToday = todayApps.filter(apt => apt.status === 'scheduled').length;

      setStats({
        totalPatients: patients.length,
        firstTime,
        returning,
        totalAppointments: appointments.length,
        todayAppointments: todayApps.length,
        upcomingAppointments: upcomingToday,
        completedToday,
        availableDoctors: doctorsRes.data?.length || 0
      });

      setRecentPatients(patients.slice(0, 5));
      setTodaySchedule(todayApps.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} p-2 md:p-3 rounded-xl flex-shrink-0 ml-3`}>
          <div className={`w-5 h-5 md:w-6 md:h-6 ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-xl md:text-2xl font-bold">Welcome back, {user.full_name}!</h1>
        <p className="text-green-100 text-sm md:text-base mt-1">Here's what's happening at the reception today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          subtitle={`${stats.firstTime} new, ${stats.returning} returning`}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          subtitle={`${stats.completedToday} completed, ${stats.upcomingAppointments} upcoming`}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Available Doctors"
          value={stats.availableDoctors}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Today's Schedule and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
            <Link to="/receptionist/appointments" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all →
            </Link>
          </div>
          
          <div className="p-5">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-gray-500">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((apt) => (
                  <div key={apt.id} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        apt.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">{apt.patient_name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          Dr. {apt.doctor_name} • {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                      apt.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Scheduled: {stats.upcomingAppointments}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Completed: {stats.completedToday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Recent Registrations</h2>
            <Link to="/receptionist/patients" className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all →
            </Link>
          </div>

          <div className="p-5">
            {recentPatients.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <p className="mt-2 text-gray-500">No patients registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-medium text-sm">
                          {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {patient.is_returning ? `${patient.total_visits} visits` : 'New patient'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                      patient.is_returning ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {patient.is_returning ? 'Returning' : 'First'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/receptionist/register"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group"
        >
          <div className="bg-green-500 p-3 rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Register New Patient</p>
            <p className="text-sm text-gray-500">Add a new patient to the system</p>
          </div>
        </Link>

        <Link
          to="/receptionist/appointments"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group"
        >
          <div className="bg-blue-500 p-3 rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Book Appointment</p>
            <p className="text-sm text-gray-500">Schedule for new or returning patients</p>
          </div>
        </Link>

        <Link
          to="/receptionist/search"
          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group"
        >
          <div className="bg-purple-500 p-3 rounded-xl shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Find Patient</p>
            <p className="text-sm text-gray-500">Search for existing patients</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;