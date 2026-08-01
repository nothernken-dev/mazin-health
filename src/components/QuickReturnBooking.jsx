import React, { useState } from 'react';

const QuickReturnBooking = ({ patient, doctors, onBook, onCancel }) => {
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({
      patient_id: patient.id,
      ...formData
    });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-purple-800">Returning Patient</h3>
          <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-semibold">
            Visit #{patient.next_visit_number || patient.total_visits + 1}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-purple-600">Name</p>
            <p className="font-medium">{patient.first_name} {patient.last_name}</p>
          </div>
          <div>
            <p className="text-purple-600">Phone</p>
            <p className="font-medium">{patient.phone}</p>
          </div>
          <div>
            <p className="text-purple-600">Previous Visits</p>
            <p className="font-medium">{patient.total_visits} visits</p>
          </div>
          <div>
            <p className="text-purple-600">Last Visit</p>
            <p className="font-medium">
              {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Doctor *</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.doctor_id}
            onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
          >
            <option value="">Select a doctor</option>
            {doctors.map(doctor => (
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.appointment_date}
            onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
          />
          <p className="mt-1 text-xs text-gray-500">Appointments must be scheduled at least one day in advance</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Return Visit</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            rows="3"
            placeholder="e.g., Follow-up consultation, Review test results, etc."
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
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Return Visit
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickReturnBooking;