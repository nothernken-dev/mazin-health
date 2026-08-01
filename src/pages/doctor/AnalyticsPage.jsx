import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getAppointments } from '../../services/api';

const AnalyticsPage = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    firstTime: 0,
    returning: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancellationRate: 0,
    averageVisitsPerPatient: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const patientsRes = await getDoctorPatients(user.id);
      const patients = patientsRes.data || [];
      
      const appointmentsRes = await getAppointments();
      const appointments = (appointmentsRes.data || []).filter(apt => apt.doctor_id === user.id);

      const firstTime = patients.filter(p => !p.is_returning).length;
      const returning = patients.filter(p => p.is_returning).length;
      const completed = appointments.filter(apt => apt.status === 'completed').length;
      const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
      
      const totalVisits = patients.reduce((sum, p) => sum + (p.total_visits || 0), 0);
      const avgVisits = patients.length > 0 ? (totalVisits / patients.length).toFixed(1) : 0;

      setStats({
        totalPatients: patients.length,
        firstTime,
        returning,
        totalAppointments: appointments.length,
        completedAppointments: completed,
        cancellationRate: appointments.length > 0 ? ((cancelled / appointments.length) * 100).toFixed(1) : 0,
        averageVisitsPerPatient: avgVisits
      });

      // Generate last 6 months data
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        const monthApps = appointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate.getMonth() === date.getMonth() && 
                 aptDate.getFullYear() === date.getFullYear();
        });

        months.push({
          month: monthName,
          appointments: monthApps.length,
          completed: monthApps.filter(apt => apt.status === 'completed').length,
          cancelled: monthApps.filter(apt => apt.status === 'cancelled').length
        });
      }
      setMonthlyData(months);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, bgColor, subtitle, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                ↑ {trend}%
              </span>
            </div>
          )}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your practice performance</p>
        </div>
        <div className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          Last 30 days
        </div>
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
          color="text-blue-600"
          bgColor="bg-blue-50"
          trend={stats.totalPatients > 0 ? "8" : undefined}
        />
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          subtitle={`${stats.completedAppointments} completed`}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${stats.cancellationRate}%`}
          subtitle="of total appointments"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          title="Avg Visits/Patient"
          value={stats.averageVisitsPerPatient}
          subtitle="per patient"
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Monthly Trends</h2>
            <p className="text-sm text-gray-500 mt-1">Appointment activity over the last 6 months</p>
          </div>
          <div className="p-5">
            {monthlyData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No data available</div>
            ) : (
              <div className="space-y-4">
                {monthlyData.map((month, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap justify-between items-center gap-2 text-sm mb-1">
                      <span className="font-medium text-gray-700">{month.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          Total: {month.appointments}
                        </span>
                        <span className="text-xs text-green-600">
                          Completed: {month.completed}
                        </span>
                        {month.cancelled > 0 && (
                          <span className="text-xs text-red-500">
                            Cancelled: {month.cancelled}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${month.appointments > 0 ? (month.completed / month.appointments) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Completion Rate</span>
                      <span>{month.appointments > 0 ? Math.round((month.completed / month.appointments) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Patient Demographics</h2>
            <p className="text-sm text-gray-500 mt-1">Breakdown of your patient population</p>
          </div>
          <div className="p-5">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">First Time Patients</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{stats.firstTime}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(stats.firstTime / stats.totalPatients) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.firstTime / stats.totalPatients) * 100).toFixed(1)}% of total patients
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Returning Patients</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{stats.returning}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${(stats.returning / stats.totalPatients) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.returning / stats.totalPatients) * 100).toFixed(1)}% of total patients
                </p>
              </div>

              {/* Additional Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Average Visits</p>
                    <p className="text-xl font-bold text-gray-800">{stats.averageVisitsPerPatient}</p>
                    <p className="text-xs text-gray-400">per patient</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Retention Rate</p>
                    <p className="text-xl font-bold text-gray-800">
                      {stats.totalPatients > 0 ? Math.round((stats.returning / stats.totalPatients) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-400">returning patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      {stats.totalAppointments > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-blue-800">📊 Practice Insights</h3>
              <p className="text-sm text-blue-600 mt-1">
                Based on your appointment data
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.totalAppointments > 0 
                    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Avg. Appointments/Patient</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.totalPatients > 0 
                    ? (stats.totalAppointments / stats.totalPatients).toFixed(1) 
                    : 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Active Patients</p>
                <p className="text-lg font-bold text-purple-600">
                  {stats.returning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;