import React, { useState, useEffect } from 'react';
import { getPatients, getPatientAppointments } from '../../services/api';
import PatientHistory from '../../components/PatientHistory';
import QuickReturnBooking from '../../components/QuickReturnBooking';
import AppointmentForm from '../../components/AppointmentForm';

const SearchPatientsPage = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [showQuickReturnForm, setShowQuickReturnForm] = useState(false);
  const [showFirstTimeForm, setShowFirstTimeForm] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
      showMessage('Error loading patients', 'error');
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    const results = patients.filter(patient => {
      const term = searchTerm.toLowerCase();
      
      switch (searchType) {
        case 'name':
          return patient.first_name?.toLowerCase().includes(term) ||
                 patient.last_name?.toLowerCase().includes(term) ||
                 `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(term);
        
        case 'phone':
          return patient.phone?.includes(term);
        
        case 'email':
          return patient.email?.toLowerCase().includes(term);
        
        case 'id':
          return patient.id?.toString() === term;
        
        default:
          return false;
      }
    });

    setSearchResults(results);
    setLoading(false);
    
    if (results.length === 0) {
      showMessage('No patients found matching your search', 'warning');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const appointmentsRes = await getPatientAppointments(patient.id);
      setPatientHistory({
        ...patient,
        appointments: appointmentsRes.data
      });
      setShowPatientHistory(true);
    } catch (error) {
      console.error('Error loading patient details:', error);
      showMessage('Error loading patient details', 'error');
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
      showMessage('Appointment booked successfully!', 'success');
      setShowFirstTimeForm(false);
      setShowQuickReturnForm(false);
      setShowPatientHistory(false);
      
      // Refresh patient data
      await loadPatients();
      
      // Clear search results
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      showMessage('Error booking appointment', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const getPatientBadge = (patient) => {
    if (!patient.is_returning) {
      return (
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 whitespace-nowrap">
          First Visit
        </span>
      );
    } else {
      return (
        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
          {patient.total_visits} {patient.total_visits === 1 ? 'visit' : 'visits'}
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 px-3 sm:px-4 md:px-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Search Patients</h1>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 sm:p-4 rounded-md text-sm sm:text-base ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 
          message.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Find Patient</h2>
        
        <div className="flex flex-col md:grid md:grid-cols-4 gap-3 sm:gap-4">
          <div className="md:col-span-1">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="name">Search by Name</option>
              <option value="phone">Search by Phone</option>
              <option value="email">Search by Email</option>
              <option value="id">Search by ID</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex flex-col xs:flex-row gap-2">
              <input
                type="text"
                placeholder={
                  searchType === 'name' ? "Enter patient name..." :
                  searchType === 'phone' ? "Enter phone number..." :
                  searchType === 'email' ? "Enter email address..." :
                  "Enter patient ID..."
                }
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="w-full xs:w-auto px-4 sm:px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
              }}
              className="w-full px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Search Tips */}
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
          <h3 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">🔍 Search Tips</h3>
          <ul className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
            <li>• Search by name: Enter first name, last name, or full name</li>
            <li>• Search by phone: Enter complete phone number or last digits</li>
            <li>• Search by email: Enter complete or partial email address</li>
            <li>• Search by ID: Enter exact patient ID number</li>
          </ul>
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">
              Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12 bg-gray-50">
              <svg className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">No patients found matching your search</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {searchResults.map((patient) => (
                  <div key={patient.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-green-600 font-medium text-sm">
                            {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{patient.first_name} {patient.last_name}</p>
                          <p className="text-xs text-gray-500">ID: {patient.id}</p>
                        </div>
                      </div>
                      {getPatientBadge(patient)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium truncate">{patient.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Visit</p>
                        <p className="font-medium">
                          {patient.last_visit 
                            ? new Date(patient.last_visit).toLocaleDateString()
                            : 'No visits'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col xs:flex-row gap-2">
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookAppointment(patient)}
                        className={`flex-1 px-3 py-2 rounded-md text-white text-sm ${
                          patient.is_returning
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {patient.is_returning ? 'Return Visit' : 'Book First'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-green-600 font-medium text-sm">
                                {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm truncate max-w-[150px]">{patient.first_name} {patient.last_name}</p>
                              <p className="text-xs text-gray-500">ID: {patient.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <p className="text-sm">{patient.phone}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{patient.email || 'No email'}</p>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {getPatientBadge(patient)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="font-medium">{patient.total_visits || 0}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {patient.last_visit 
                            ? new Date(patient.last_visit).toLocaleDateString()
                            : 'No visits'
                          }
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleBookAppointment(patient)}
                            className={`text-sm px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                              patient.is_returning
                                ? 'bg-purple-500 text-white hover:bg-purple-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {patient.is_returning ? 'Return' : 'First'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Patient History Modal */}
      {showPatientHistory && patientHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-4 md:p-5 border w-full max-w-full sm:max-w-3xl md:max-w-4xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Patient History</h2>
              <button
                onClick={() => {
                  setShowPatientHistory(false);
                  setPatientHistory(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PatientHistory 
              patient={patientHistory} 
              onNewConsultation={() => {}}
            />
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowPatientHistory(false);
                  handleBookAppointment(selectedPatient);
                }}
                className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-md text-white text-sm sm:text-base ${
                  selectedPatient?.is_returning
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {selectedPatient?.is_returning ? 'Book Return Visit' : 'Book First Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First Time Appointment Form */}
      {showFirstTimeForm && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-4 md:p-5 border w-full max-w-full sm:max-w-xl md:max-w-2xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Book First Appointment</h2>
              <button
                onClick={() => {
                  setShowFirstTimeForm(false);
                  setSelectedPatient(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Patient Info */}
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">{selectedPatient.phone}</p>
                </div>
                <span className="self-start xs:self-auto px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium whitespace-nowrap">
                  First Visit
                </span>
              </div>
            </div>
            
            <AppointmentForm
              doctors={[]}
              initialPatient={selectedPatient}
              isNewPatient={false}
              onSubmit={handleAppointmentSubmit}
              onCancel={() => {
                setShowFirstTimeForm(false);
                setSelectedPatient(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Return Form */}
      {showQuickReturnForm && selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-4 md:p-5 border w-full max-w-full sm:max-w-xl md:max-w-2xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-purple-800">Book Return Visit</h2>
              <button
                onClick={() => {
                  setShowQuickReturnForm(false);
                  setSelectedPatient(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <QuickReturnBooking
              patient={selectedPatient}
              doctors={[]}
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

export default SearchPatientsPage;