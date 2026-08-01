import React, { useState, useEffect } from 'react';
import { getPatients } from '../services/api';

const PatientSearch = ({ onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => 
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or phone..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {searchTerm && (
        <div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
          {filteredPatients.length === 0 ? (
            <p className="p-2 text-gray-500">No patients found</p>
          ) : (
            filteredPatients.map(patient => (
              <div
                key={patient.id}
                className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => onSelectPatient(patient)}
              >
                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                <p className="text-sm text-gray-600">{patient.phone}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearch;