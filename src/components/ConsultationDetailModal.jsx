import React from 'react';

const ConsultationDetailModal = ({ consultation, onClose, onDownload }) => {
  if (!consultation) return null;

  const handleDownload = () => {
    onDownload(consultation);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Consultation Details</h2>
            {consultation.hospital_name && (
              <p className="text-sm text-blue-600 mt-1">🏥 {consultation.hospital_name}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download / Print
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">
                {new Date(consultation.consultation_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">
                {new Date(consultation.consultation_date).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Complaint */}
        {consultation.complaint && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">📋 Patient's Complaint</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{consultation.complaint}</p>
            </div>
          </div>
        )}

        {/* Examination */}
        {consultation.examination && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">🔍 Examination Findings</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{consultation.examination}</p>
            </div>
          </div>
        )}

        {/* Diagnosis */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">🩺 Diagnosis</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800">{consultation.diagnosis}</p>
          </div>
        </div>

        {/* Prescription */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">💊 Prescription</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">{consultation.prescription}</p>
          </div>
        </div>

        {/* Medicines */}
        {consultation.medicines && consultation.medicines.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">📦 Prescribed Medicines</h3>
            <div className="space-y-2">
              {consultation.medicines.map((medicine, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{medicine.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    <p><span className="text-gray-500">Dosage:</span> {medicine.dosage}</p>
                    <p><span className="text-gray-500">Frequency:</span> {medicine.frequency}</p>
                    {medicine.duration && (
                      <p><span className="text-gray-500">Duration:</span> {medicine.duration}</p>
                    )}
                  </div>
                  {medicine.instructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="text-gray-500">Instructions:</span> {medicine.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {consultation.images && consultation.images.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              📸 Examination Images ({consultation.images.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {consultation.images.map((image, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {image.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {consultation.notes && (
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">📝 Additional Notes</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">{consultation.notes}</p>
            </div>
          </div>
        )}

        {/* Doctor & Hospital Info */}
        <div className="mt-4 pt-3 border-t flex justify-between">
          <p className="text-sm text-gray-500">
            👨‍⚕️ Attending Doctor: Dr. {consultation.doctor_name || 'Unknown'}
          </p>
          {consultation.hospital_name && (
            <p className="text-sm text-blue-600">
              🏥 {consultation.hospital_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetailModal;