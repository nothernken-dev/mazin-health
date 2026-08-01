import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus } from '../../services/api';

const AppointmentsPage = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filter, dateFilter, appointments]);

  const loadAppointments = async () => {
    try {
      const response = await getAppointments();
      const doctorApps = (response.data || []).filter(apt => apt.doctor_id === user.id);
      setAppointments(doctorApps);
      setFilteredAppointments(doctorApps);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showMessage('Error loading appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const today = new Date().toDateString();

    // Apply status filter
    switch (filter) {
      case 'today':
        filtered = appointments.filter(apt => 
          new Date(apt.appointment_date).toDateString() === today
        );
        break;
      case 'upcoming':
        filtered = appointments.filter(apt => 
          apt.status === 'scheduled' && new Date(apt.appointment_date) > new Date()
        );
        break;
      case 'completed':
        filtered = appointments.filter(apt => apt.status === 'completed');
        break;
      case 'scheduled':
        filtered = appointments.filter(apt => apt.status === 'scheduled');
        break;
      default:
        filtered = appointments;
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(apt => 
        new Date(apt.appointment_date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (window.confirm('Mark this appointment as completed?')) {
      try {
        await updateAppointmentStatus(appointmentId, 'completed');
        showMessage('Appointment marked as completed', 'success');
        loadAppointments();
      } catch (error) {
        console.error('Error updating appointment:', error);
        showMessage('Error updating appointment', 'error');
      }
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Scheduled' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} rounded-full text-xs font-medium whitespace-nowrap`}>
        {config.label}
      </span>
    );
  };

  // Calculate stats
  const totalAppointments = appointments.length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;
  const scheduledCount = appointments.filter(apt => apt.status === 'scheduled').length;
  const todayCount = appointments.filter(apt => 
    new Date(apt.appointment_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your patient appointments</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-blue-700">{totalAppointments}</p>
          <p className="text-xs text-blue-500 mt-1">all appointments</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700">{completedCount}</p>
          <p className="text-xs text-green-500 mt-1">finished visits</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-700">{scheduledCount}</p>
          <p className="text-xs text-yellow-500 mt-1">upcoming</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Today</p>
          <p className="text-2xl font-bold text-purple-700">{todayCount}</p>
          <p className="text-xs text-purple-500 mt-1">scheduled today</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Appointments ({totalAppointments})</option>
              <option value="today">Today ({todayCount})</option>
              <option value="upcoming">Upcoming ({scheduledCount})</option>
              <option value="scheduled">Scheduled ({scheduledCount})</option>
              <option value="completed">Completed ({completedCount})</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setDateFilter('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">
                {dateFilter ? 'Try adjusting your filters' : 'You have no appointments scheduled'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {apt.patient_name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                          {apt.patient_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(apt.appointment_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {apt.reason || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCompleteAppointment(apt.id)}
                          className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status === 'completed' && (
                        <span className="text-sm text-gray-400">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with count */}
        {!loading && filteredAppointments.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {scheduledCount > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-700">
                You have <strong>{scheduledCount}</strong> upcoming appointment{scheduledCount !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setFilter('upcoming')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all upcoming →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;