import React, { useState, useEffect } from 'react';
import { getPatients, getPatientAppointments, getDoctors, createAppointment } from '../../services/api';
import PatientList from '../../components/PatientList';
import PatientHistory from '../../components/PatientHistory';
import QuickReturnBooking from '../../components/QuickReturnBooking';
import AppointmentForm from '../../components/AppointmentForm';

const PatientsPage = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitFilter, setVisitFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showQuickReturnForm, setShowQuickReturnForm] = useState(false);
  const [showFirstTimeForm, setShowFirstTimeForm] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients, visitFilter]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await getPatients();
      console.log('Patients loaded:', response.data);
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
      showMessage('Error loading patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await getDoctors();
      console.log('Doctors loaded:', response.data);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (visitFilter === 'first') {
      filtered = filtered.filter(patient => !patient.is_returning);
    } else if (visitFilter === 'returning') {
      filtered = filtered.filter(patient => patient.is_returning);
    }

    setFilteredPatients(filtered);
  };

  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    try {
      const appointmentsRes = await getPatientAppointments(patient.id);
      setPatientHistory({
        ...patient,
        appointments: appointmentsRes.data
      });
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  const handleBookAppointment = (patient) => {
    setSelectedPatient(patient);
    if (patient.is_returning) {
      setShowQuickReturnForm(true);
    } else {
      setShowFirstTimeForm(true);
    }
  };

  const handleAppointmentSubmit = async (appointmentData) => {
    try {
      // Prepare data for API
      const data = {
        ...appointmentData,
        receptionist_id: user.id,
        is_new_patient: !selectedPatient
      };
      
      console.log('Creating appointment:', data);
      const response = await createAppointment(data);
      console.log('Appointment created:', response.data);
      
      showMessage('Appointment booked successfully!', 'success');
      setShowFirstTimeForm(false);
      setShowQuickReturnForm(false);
      setSelectedPatient(null);
      loadPatients(); // Refresh patient list
    } catch (error) {
      console.error('Error booking appointment:', error);
      showMessage('Error booking appointment: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const getPatientBadge = (patient) => {
    if (!patient.is_returning) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
          First Visit
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
          <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
          {patient.total_visits} {patient.total_visits === 1 ? 'visit' : 'visits'}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
        {/* <button
          onClick={() => {
            setSelectedPatient(null);
            setShowFirstTimeForm(true);
          }}
          className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Register New Patient
        </button> */}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value)}
            >
              <option value="all">All Patients ({patients.length})</option>
              <option value="first">First Time ({patients.filter(p => !p.is_returning).length})</option>
              <option value="returning">Returning ({patients.filter(p => p.is_returning).length})</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setVisitFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'all' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            onClick={() => setVisitFilter('first')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'first' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🆕 First ({patients.filter(p => !p.is_returning).length})
          </button>
          <button
            onClick={() => setVisitFilter('returning')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'returning' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔄 Returning ({patients.filter(p => p.is_returning).length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <PatientList
            patients={filteredPatients}
            loading={loading}
            onSelectPatient={handleBookAppointment}
            getPatientBadge={getPatientBadge}
          />
        </div>
      </div>

      {patientHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-4 border w-full max-w-full sm:max-w-3xl md:max-w-4xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Patient History</h2>
              <button
                onClick={() => setPatientHistory(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PatientHistory 
              patient={patientHistory} 
              onNewConsultation={() => {}}
            />
          </div>
        </div>
      )}

      {/* First Time Appointment Form with Doctors */}
      {showFirstTimeForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-4 border w-full max-w-full sm:max-w-2xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedPatient ? 'Book First Appointment' : 'Register New Patient'}
              </h2>
              <button
                onClick={() => {
                  setShowFirstTimeForm(false);
                  setSelectedPatient(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AppointmentForm
              doctors={doctors}
              initialPatient={selectedPatient}
              isNewPatient={!selectedPatient}
              onSubmit={handleAppointmentSubmit}
              onCancel={() => {
                setShowFirstTimeForm(false);
                setSelectedPatient(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Return Form with Doctors */}
      {showQuickReturnForm && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-4 border w-full max-w-full sm:max-w-2xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-800">Book Return Visit</h2>
              <button
                onClick={() => {
                  setShowQuickReturnForm(false);
                  setSelectedPatient(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QuickReturnBooking
              patient={selectedPatient}
              doctors={doctors}
              onBook={handleAppointmentSubmit}
              onCancel={() => {
                setShowQuickReturnForm(false);
                setSelectedPatient(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;