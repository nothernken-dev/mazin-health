import React, { useState, useEffect } from 'react';
import { getAppointments, updateAppointmentStatus, getDoctors, createAppointment } from '../../services/api';
import AppointmentForm from '../../components/AppointmentForm';

const AppointmentsPage = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [filter, dateFilter, appointments]);

  const loadData = async () => {
    try {
      const [appsRes, docsRes] = await Promise.all([
        getAppointments(),
        getDoctors()
      ]);
      setAppointments(appsRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('Error loading appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status === filter);
    }

    if (dateFilter) {
      filtered = filtered.filter(apt => 
        new Date(apt.appointment_date).toDateString() === new Date(dateFilter).toDateString()
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateAppointmentStatus(appointmentId, 'cancelled');
        showMessage('Appointment cancelled successfully', 'success');
        loadData();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        showMessage('Error cancelling appointment', 'error');
      }
    }
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      const data = {
        ...appointmentData,
        receptionist_id: user.id
      };
      
      await createAppointment(data);
      showMessage('Appointment booked successfully!', 'success');
      setShowBookingForm(false);
      loadData();
    } catch (error) {
      console.error('Error booking appointment:', error);
      showMessage('Error booking appointment', 'error');
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

  // Calculate summary stats
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <button
          onClick={() => setShowBookingForm(true)}
          className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Appointment
        </button>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-700">{scheduledCount}</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-red-700">{cancelledCount}</p>
            </div>
            <div className="bg-red-200 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Appointments ({appointments.length})</option>
              <option value="scheduled">Scheduled ({scheduledCount})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="cancelled">Cancelled ({cancelledCount})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter('all');
                setDateFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new appointment</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
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
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-green-600 font-medium text-sm">
                            {apt.patient_name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                          {apt.patient_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-700">Dr. {apt.doctor_name}</span>
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
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
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

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-4 w-full max-w-full sm:max-w-2xl min-h-screen sm:min-h-0 shadow-xl rounded-none sm:rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h2 className="text-xl font-bold text-gray-800">Book New Appointment</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AppointmentForm
              doctors={doctors}
              initialPatient={null}
              isNewPatient={true}
              onSubmit={handleAppointmentSubmit}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;