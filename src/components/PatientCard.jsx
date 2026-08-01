import React from 'react';

const PatientCard = ({ patient, onClick, onConsult }) => {
  return (
    <div 
      className="border rounded-lg p-3 sm:p-4 hover:shadow-md cursor-pointer transition-shadow bg-white"
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <h3 className="font-medium text-base sm:text-lg break-words">
            {patient.first_name} {patient.last_name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
            <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="break-words">{patient.phone}</span>
          </p>
          {patient.last_visit && (
            <p className="text-xs text-gray-500 mt-2">
              Last visit: {new Date(patient.last_visit).toLocaleDateString()}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConsult();
          }}
          className="w-full sm:w-auto bg-blue-500 text-white px-3 sm:px-4 py-2 sm:py-1 rounded-md text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          + Consult
        </button>
      </div>
    </div>
  );
};

export default PatientCard;