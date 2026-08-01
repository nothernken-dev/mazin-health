import React, { useState } from 'react';

const AppointmentForm = ({ doctors, initialPatient, isNewPatient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patient_id: initialPatient?.id || '',
    first_name: initialPatient?.first_name || '',
    last_name: initialPatient?.last_name || '',
    phone: initialPatient?.phone || '',
    email: initialPatient?.email || '',
    date_of_birth: initialPatient?.date_of_birth || '',
    doctor_id: '',
    appointment_date: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isNewPatient && initialPatient && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-green-800">Returning Patient</h3>
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
              Visit #{initialPatient.next_visit_number || 1}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-600">Name</p>
              <p className="font-medium">{initialPatient.first_name} {initialPatient.last_name}</p>
            </div>
            <div>
              <p className="text-green-600">Phone</p>
              <p className="font-medium">{initialPatient.phone}</p>
            </div>
          </div>
        </div>
      )}

      {isNewPatient ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
            />
          </div>
        </>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-gray-700">Select Doctor *</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          value={formData.doctor_id}
          onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
        >
          <option value="">Select a doctor</option>
          {doctors && doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Appointment Date & Time *</label>
        <input
          type="datetime-local"
          required
          min={`${minDate}T00:00`}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          value={formData.appointment_date}
          onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
        />
        <p className="mt-1 text-xs text-gray-500">Appointments must be scheduled at least one day in advance</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {initialPatient?.total_visits > 0 ? 'Reason for Return Visit' : 'Reason for Visit'}
        </label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          rows="3"
          placeholder={initialPatient?.total_visits > 0 
            ? "e.g., Follow-up, Review test results, Continued treatment..." 
            : "Please describe the reason for this appointment..."
          }
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-md flex items-center ${
            initialPatient?.total_visits > 0 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {initialPatient?.total_visits > 0 ? 'Confirm Return Visit' : (isNewPatient ? 'Register & Book' : 'Book Appointment')}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;