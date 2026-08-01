import React, { useState } from 'react';

const ConsultationList = ({ consultations, onSelectConsultation }) => {
  const [selectedId, setSelectedId] = useState(null);

  const handleClick = (consultation) => {
    setSelectedId(consultation.id);
    onSelectConsultation(consultation);
  };

  if (!consultations || consultations.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No consultation history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {consultations.map((consultation, index) => (
        <div
          key={consultation.id || index}
          onClick={() => handleClick(consultation)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedId === consultation.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">
                {new Date(consultation.consultation_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(consultation.consultation_date).toLocaleTimeString()}
              </p>
              {consultation.hospital_name && (
                <p className="text-xs text-blue-600 mt-1">
                  🏥 {consultation.hospital_name}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {consultation.images && consultation.images.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  📸 {consultation.images.length}
                </span>
              )}
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Visit #{consultations.length - index}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-1">
            {consultation.diagnosis}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ConsultationList;