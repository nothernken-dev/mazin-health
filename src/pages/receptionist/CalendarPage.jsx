import React, { useState, useEffect } from 'react';
import { getAppointments } from '../../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarPage = ({ user }) => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDateApps, setSelectedDateApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const selectedDateStr = date.toDateString();
    const filtered = appointments.filter(apt => 
      new Date(apt.appointment_date).toDateString() === selectedDateStr
    );
    setSelectedDateApps(filtered);
  }, [date, appointments]);

  const loadAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayApps = appointments.filter(apt => 
        new Date(apt.appointment_date).toDateString() === date.toDateString()
      );
      
      if (dayApps.length > 0) {
        return (
          <div className="text-xs mt-1">
            <span className="bg-green-100 text-green-800 px-1 rounded">
              {dayApps.length}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Scheduled</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Appointment Calendar</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4 overflow-x-auto">
          <div className="min-w-[300px]">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              className="w-full border-0"
            />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          {selectedDateApps.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No appointments scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {selectedDateApps.map((apt) => (
                <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold">
                        {new Date(apt.appointment_date).getHours()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-sm text-gray-600">Dr. {apt.doctor_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.appointment_date).toLocaleTimeString()}
                      </p>
                      {apt.reason && (
                        <p className="text-xs text-gray-400 mt-1">Reason: {apt.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="self-start sm:self-auto">
                    {getStatusBadge(apt.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedDateApps.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 flex flex-wrap gap-2">
                <span className="font-bold">{selectedDateApps.length}</span> total appointments
                <span>•</span>
                <span className="font-bold">
                  {selectedDateApps.filter(apt => apt.status === 'completed').length}
                </span> completed
                <span>•</span>
                <span className="font-bold">
                  {selectedDateApps.filter(apt => apt.status === 'scheduled').length}
                </span> scheduled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;