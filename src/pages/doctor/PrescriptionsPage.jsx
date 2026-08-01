import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getPatient } from '../../services/api';

const PrescriptionsPage = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await getDoctorPatients(user.id);
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patientId) => {
    try {
      const response = await getPatient(patientId);
      setSelectedPatient(response.data);
      const allPrescriptions = response.data.visit_history?.flatMap(visit => 
        visit.medicines?.map(medicine => ({
          ...medicine,
          date: visit.consultation_date,
          diagnosis: visit.diagnosis,
          doctor: visit.doctor_name
        })) || []
      ) || [];
      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Patients</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {patients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <p className="font-medium truncate">{patient.first_name} {patient.last_name}</p>
                  <p className="text-sm text-gray-500 truncate">{patient.phone}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {!selectedPatient ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">Select a patient to view prescriptions</p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold truncate">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                <p className="text-gray-500">Total Prescriptions: {prescriptions.length}</p>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No prescriptions found for this patient</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-blue-600">{prescription.name}</span>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(prescription.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <p><span className="text-gray-500">Dosage:</span> {prescription.dosage}</p>
                        <p><span className="text-gray-500">Frequency:</span> {prescription.frequency}</p>
                        {prescription.duration && (
                          <p className="sm:col-span-2"><span className="text-gray-500">Duration:</span> {prescription.duration}</p>
                        )}
                      </div>
                      {prescription.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {prescription.instructions}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2 truncate">
                        Prescribed for: {prescription.diagnosis}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionsPage;