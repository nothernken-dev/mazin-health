import React, { useState } from 'react';

const PatientList = ({ patients, loading, onSelectPatient, getPatientBadge }) => {
  const [expandedPatient, setExpandedPatient] = useState(null);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading patients...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="mt-2 text-gray-500">No patients found</p>
        <p className="text-sm text-gray-400 mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Visit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Visits
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Doctor
            </th> */}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <React.Fragment key={patient.id}>
              <tr 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setExpandedPatient(expandedPatient === patient.id ? null : patient.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {patient.first_name?.charAt(0) || ''}{patient.last_name?.charAt(0) || ''}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {patient.id}
                      </div>
                    </div>
                  </div>
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{patient.phone}</div>
                  <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPatientBadge(patient)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.last_visit 
                    ? new Date(patient.last_visit).toLocaleDateString()
                    : 'No previous visits'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="font-medium">{patient.total_visits || 0}</span> {patient.total_visits === 1 ? 'visit' : 'visits'}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.doctor_name || 'Not assigned'}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {patient.is_returning ? (
                    // Returning patient - Show Return Visit button
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient);  // This will open quick return form
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Book Return Visit #{patient.next_visit_number}
                    </button>
                  ) : (
                    // First time patient - Book First Appointment
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPatient(patient);
                      }}
                      className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book First Appointment
                    </button>
                  )}
                </td>
              </tr>
              
              {/* Expanded row showing details */}
              {expandedPatient === patient.id && (
                <tr className="bg-gray-50">
                  <td colSpan="7" className="px-6 py-4">
                    <div className="text-sm">
                      {!patient.is_returning ? (
                        // First time patient - Show registration info
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">📝 Patient Information</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-500 text-xs">Date of Birth</p>
                              <p className="font-medium">
                                {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not provided'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Blood Group</p>
                              <p className="font-medium">{patient.blood_group || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Registration Date</p>
                              <p className="font-medium">
                                {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'Today'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Emergency Contact</p>
                              <p className="font-medium">{patient.emergency_contact || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Returning patient - Show visit summary
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">📋 Visit Summary</h4>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-sm text-purple-800">
                              <span className="font-bold">{patient.total_visits}</span> total visits
                            </p>
                            <p className="text-sm text-purple-800 mt-1">
                              Last visit: {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-sm text-purple-800 mt-1">
                              Last doctor: {patient.last_doctor || 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Quick Stats Footer */}
      <div className="mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              <span className="font-medium">{patients.filter(p => !p.is_returning).length}</span> first-time patients
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              <span className="font-medium">{patients.filter(p => p.is_returning).length}</span> returning patients
            </span>
          </div>
          <div className="text-gray-500">
            Click on any row to view details
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;