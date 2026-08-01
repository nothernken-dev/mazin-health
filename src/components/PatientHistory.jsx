import React, { useState } from 'react';

const PatientHistory = ({ patient, onNewConsultation }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!patient) return null;

  const consultations = patient.visit_history || [];
  const totalVisits = patient.total_visits || 0;

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <h2 className="text-xl font-bold text-blue-800">{patient.full_name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div>
            <p className="text-xs text-blue-600">Phone</p>
            <p className="font-medium">{patient.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Email</p>
            <p className="font-medium">{patient.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Blood Group</p>
            <p className="font-medium">{patient.blood_group || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600">Total Visits</p>
            <p className="font-medium font-bold">{totalVisits}</p>
          </div>
        </div>
      </div>

      {/* Consultation List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Consultation History</h3>
        
        {consultations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No consultations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((consult, index) => (
              <div key={consult.id || index} className="border rounded-lg overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setSelectedConsultation(selectedConsultation === consult.id ? null : consult.id)}
                  className="w-full bg-gray-50 px-4 py-3 flex justify-between items-center hover:bg-gray-100"
                >
                  <div className="text-left">
                    <p className="font-medium">
                      {new Date(consult.consultation_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(consult.consultation_date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {consult.images?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        📸 {consult.images.length}
                      </span>
                    )}
                    <span className="text-gray-400">{selectedConsultation === consult.id ? '▼' : '▶'}</span>
                  </div>
                </button>

                {/* Details */}
                {selectedConsultation === consult.id && (
                  <div className="p-4 space-y-4">
                    {/* Complaint */}
                    <div className="border-l-4 border-orange-400 pl-3">
                      <p className="text-xs font-semibold text-orange-600">PATIENT'S COMPLAINT</p>
                      <p className="mt-1">{consult.complaint || 'Not recorded'}</p>
                    </div>

                    {/* Examination */}
                    <div className="border-l-4 border-purple-400 pl-3">
                      <p className="text-xs font-semibold text-purple-600">EXAMINATION FINDINGS</p>
                      <p className="mt-1">{consult.examination || 'Not recorded'}</p>
                    </div>

                    {/* Diagnosis */}
                    <div className="border-l-4 border-blue-400 pl-3">
                      <p className="text-xs font-semibold text-blue-600">DIAGNOSIS</p>
                      <p className="mt-1">{consult.diagnosis}</p>
                    </div>

                    {/* Prescription */}
                    <div className="border-l-4 border-green-400 pl-3">
                      <p className="text-xs font-semibold text-green-600">PRESCRIPTION</p>
                      <p className="mt-1 whitespace-pre-wrap">{consult.prescription}</p>
                    </div>

                    {/* Images */}
                    {consult.images && consult.images.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">IMAGES</p>
                        <div className="grid grid-cols-3 gap-2">
                          {consult.images.map((img, idx) => (
                            <div key={idx} className="border rounded overflow-hidden">
                              <img
                                src={img.data}
                                alt={img.name}
                                className="w-full h-24 object-cover cursor-pointer"
                                onClick={() => setSelectedImage(img.data)}
                              />
                              <p className="text-xs text-center p-1 bg-gray-50 truncate">{img.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medicines */}
                    {consult.medicines && consult.medicines.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">MEDICINES</p>
                        <div className="space-y-2">
                          {consult.medicines.map((med, idx) => (
                            <div key={idx} className="bg-gray-50 p-2 rounded">
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                              {med.instructions && <p className="text-xs text-gray-500">{med.instructions}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {consult.notes && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs font-semibold text-yellow-700">NOTES</p>
                        <p className="text-sm mt-1">{consult.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Consultation Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onNewConsultation(patient.id)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + New Consultation
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl">
            <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;