import React, { useState, useEffect } from 'react';
import { getAppointments } from '../../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarPage = ({ user }) => {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDateApps, setSelectedDateApps] = useState([]);

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
      const doctorApps = response.data.filter(apt => apt.doctor_id === user.id);
      setAppointments(doctorApps);
    } catch (error) {
      console.error('Error loading appointments:', error);
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
            <span className="bg-blue-100 text-blue-800 px-1 rounded">
              {dayApps.length}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>

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
            <div className="space-y-3">
              {selectedDateApps.map((apt) => (
                <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">
                        {new Date(apt.appointment_date).getHours()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.appointment_date).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{apt.reason || 'No reason'}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;