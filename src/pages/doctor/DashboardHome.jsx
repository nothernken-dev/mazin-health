import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getAppointments } from '../../services/api';
import { Link } from 'react-router-dom';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    firstTime: 0,
    returning: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedToday: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const patientsRes = await getDoctorPatients(user.id);
      const patients = patientsRes.data;
      
      const firstTime = patients.filter(p => !p.is_returning).length;
      const returning = patients.filter(p => p.is_returning).length;
      
      setStats(prev => ({
        ...prev,
        totalPatients: patients.length,
        firstTime,
        returning
      }));

      setRecentPatients(patients.slice(0, 5));

      const appointmentsRes = await getAppointments();
      const today = new Date().toDateString();
      
      const todayApps = appointmentsRes.data.filter(apt => {
        if (apt.doctor_id === user.id) {
          const aptDate = new Date(apt.appointment_date).toDateString();
          return aptDate === today;
        }
        return false;
      });

      const completedToday = todayApps.filter(apt => apt.status === 'completed').length;
      const upcomingToday = todayApps.filter(apt => apt.status === 'scheduled').length;

      setStats(prev => ({
        ...prev,
        todayAppointments: todayApps.length,
        upcomingAppointments: upcomingToday,
        completedToday
      }));

      setTodaySchedule(todayApps.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, trend }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2">↑ {trend}% from last month</p>
          )}
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <div className={`w-6 h-6 ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Dr. {user.full_name}!</h1>
        <p className="text-blue-100 mt-2">Here's what's happening with your practice today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="text-blue-600"
          bgColor="bg-blue-100"
          trend="12"
        />
        <StatCard
          title="First Time"
          value={stats.firstTime}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Returning"
          value={stats.returning}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <Link to="/doctor/appointments" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((apt) => (
                <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      apt.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.appointment_date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    apt.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Upcoming: {stats.upcomingAppointments}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Completed: {stats.completedToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Recent Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No patients yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-sm">
                        {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{patient.first_name} {patient.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {patient.is_returning ? `${patient.total_visits} visits` : 'First visit'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                    patient.is_returning ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {patient.is_returning ? 'Returning' : 'New'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/doctor/patients"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="bg-blue-500 p-3 rounded-lg mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">View Patients</p>
              <p className="text-sm text-gray-500 truncate">{stats.totalPatients} total</p>
            </div>
          </Link>

          <Link
            to="/doctor/appointments"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="bg-purple-500 p-3 rounded-lg mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">Today's Schedule</p>
              <p className="text-sm text-gray-500 truncate">{stats.todayAppointments} appointments</p>
            </div>
          </Link>

          <Link
            to="/doctor/prescriptions"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="bg-green-500 p-3 rounded-lg mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">Prescriptions</p>
              <p className="text-sm text-gray-500 truncate">Manage medications</p>
            </div>
          </Link>

          <Link
            to="/doctor/analytics"
            className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <div className="bg-yellow-500 p-3 rounded-lg mr-3 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">Analytics</p>
              <p className="text-sm text-gray-500 truncate">View insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;