import React, { useState, useEffect } from 'react';
import { createPatient, getDoctors } from '../../services/api';

const RegisterPatientPage = ({ user }) => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
    doctor_id: '',
    payment_method: '',
    payment_amount: '',
    payment_status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Consultation fees
  const consultationFees = {
    general: 50,
    specialist: 100,
    emergency: 150,
    followup: 40
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await getDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      payment_method: method,
      payment_amount: consultationFees.general
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment
    if (!formData.payment_method) {
      setMessage({
        type: 'error',
        text: 'Please select a payment method'
      });
      return;
    }

    setLoading(true);
    
    try {
      const patientData = {
        ...formData,
        payment: {
          amount: consultationFees.general,
          method: formData.payment_method,
          status: 'paid',
          date: new Date().toISOString()
        }
      };
      
      const response = await createPatient(patientData);
      
      setMessage({
        type: 'success',
        text: `Patient ${formData.first_name} ${formData.last_name} registered successfully! Payment: $${consultationFees.general} via ${formData.payment_method.toUpperCase()}`
      });
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        address: '',
        emergency_contact: '',
        doctor_id: '',
        payment_method: '',
        payment_amount: '',
        payment_status: 'pending'
      });
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error registering patient. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Register New Patient</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Medical Information & Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Medical Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Doctor</label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-3">💰 Payment Information</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Consultation Fee:</span>
                    <span className="text-lg font-bold text-green-600">${consultationFees.general}</span>
                  </div>
                  <p className="text-xs text-gray-500">Includes initial consultation and registration</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('cash')}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        formData.payment_method === 'cash'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Cash</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('card')}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        formData.payment_method === 'card'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm">Card</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('mobile')}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        formData.payment_method === 'mobile'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Mobile Money</span>
                    </button>
                  </div>
                </div>

                {formData.payment_method === 'mobile' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile_number"
                      placeholder="Enter mobile number for payment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                {formData.payment_method === 'card' && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="**** **** **** ****"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {formData.payment_method && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-800">Payment Summary</p>
                  <p className="text-xs text-green-600 mt-1">
                    Method: {formData.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount to Pay</p>
                  <p className="text-xl font-bold text-green-600">${consultationFees.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  date_of_birth: '',
                  gender: '',
                  blood_group: '',
                  address: '',
                  emergency_contact: '',
                  doctor_id: '',
                  payment_method: '',
                  payment_amount: '',
                  payment_status: 'pending'
                });
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                `Pay $${consultationFees.general} & Register`
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Registration & Payment Information</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Consultation fee: <strong>${consultationFees.general}</strong> (includes registration)</li>
          <li>• Payment methods: Cash, Card, Mobile Money</li>
          <li>• Fields marked with <span className="text-red-500">*</span> are required</li>
          <li>• Patient receives unique ID after successful payment</li>
          <li>• Receipt will be generated after payment</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterPatientPage;