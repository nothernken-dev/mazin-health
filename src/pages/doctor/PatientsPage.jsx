import React, { useState, useEffect } from 'react';
import { getDoctorPatients, getPatient, createConsultation } from '../../services/api';
import PatientCard from '../../components/PatientCard';
import PatientHistory from '../../components/PatientHistory';
import ConsultationList from '../../components/ConsultationList';
import ConsultationDetailModal from '../../components/ConsultationDetailModal';
import ConsultationForm from '../../components/ConsultationForm';

const PatientsPage = ({ user }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitFilter, setVisitFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients, visitFilter]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await getDoctorPatients(user.id);
      console.log('Patients loaded:', response.data);
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error loading patients:', error);
      showMessage('Error loading patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (visitFilter === 'first') {
      filtered = filtered.filter(patient => !patient.is_returning);
    } else if (visitFilter === 'returning') {
      filtered = filtered.filter(patient => patient.is_returning);
    }

    setFilteredPatients(filtered);
  };

  const handlePatientClick = async (patientId) => {
    setLoading(true);
    try {
      const response = await getPatient(patientId);
      console.log('Patient history loaded:', response.data);
      setPatientHistory(response.data);
      setSelectedPatient(patientId);
      setShowConsultationModal(false);
    } catch (error) {
      console.error('Error loading patient history:', error);
      showMessage('Error loading patient history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowConsultationModal(true);
  };

  const handleAddConsultation = (patientId) => {
    setSelectedPatient(patientId);
    setShowConsultationForm(true);
    setShowConsultationModal(false);
  };

  const handleConsultationSubmit = async (consultationData) => {
    try {
      console.log('Saving consultation:', consultationData);
      const response = await createConsultation(consultationData);
      console.log('Consultation saved:', response.data);
      
      // Refresh patient history
      const updatedPatient = await getPatient(selectedPatient);
      setPatientHistory(updatedPatient.data);
      setShowConsultationForm(false);
      showMessage('Consultation saved successfully!', 'success');
      
      // Refresh patient list to update visit counts
      loadPatients();
    } catch (error) {
      console.error('Error saving consultation:', error);
      showMessage('Error saving consultation: ' + (error.response?.data?.error || 'Unknown error'), 'error');
    }
  };

  const handleDownloadConsultation = (consultation) => {
    // Get hospital details
    const hospitalName = user?.hospital_name || 'City General Hospital';
    const hospitalAddress = user?.hospital?.address || '123 Healthcare Avenue, Medical District';
    const hospitalPhone = user?.hospital?.phone || '(555) 123-4567';
    const hospitalEmail = user?.hospital?.email || 'info@hospital.com';
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultation Report - ${patientHistory?.first_name} ${patientHistory?.last_name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; padding: 40px; color: #333; }
          .report-container { max-width: 1000px; margin: 0 auto; background: white; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
          .hospital-name { font-size: 28px; font-weight: bold; color: #1e3a8a; margin-bottom: 10px; }
          .hospital-details { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
          .report-title { font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0 10px; }
          .report-id { color: #9ca3af; font-size: 12px; }
          .patient-info { background: linear-gradient(135deg, #f0f9ff 0%, #e6f3ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #2563eb; }
          .patient-info h3 { color: #1e3a8a; margin-bottom: 15px; font-size: 18px; }
          .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .info-item { display: flex; flex-direction: column; }
          .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
          .info-value { font-size: 15px; font-weight: 500; color: #1f2937; margin-top: 4px; }
          .section { margin-bottom: 25px; break-inside: avoid; }
          .section-title { font-size: 17px; font-weight: bold; color: #2563eb; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
          .section-content { padding: 15px; background: #f9fafb; border-radius: 8px; line-height: 1.6; }
          .medicines-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 10px; }
          .medicine-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; }
          .medicine-name { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
          .medicine-details { font-size: 13px; color: #6b7280; }
          .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
          .image-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: white; }
          .image-card img { width: 100%; height: 150px; object-fit: cover; }
          .image-name { padding: 8px; font-size: 12px; text-align: center; background: #f9fafb; color: #374151; font-weight: 500; }
          .footer { margin-top: 40px; padding-top: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 30px; }
          .doctor-signature { text-align: center; flex: 1; }
          .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 30px; margin-bottom: 5px; }
          @media print { body { padding: 20px; } .section { break-inside: avoid; } .medicine-card, .image-card { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <div class="hospital-name">🏥 ${hospitalName}</div>
            <div class="hospital-details">${hospitalAddress}</div>
            <div class="hospital-details">Tel: ${hospitalPhone} | Email: ${hospitalEmail}</div>
            <div class="report-title">Medical Consultation Report</div>
            <div class="report-id">Report ID: CON-${consultation.id}-${new Date(consultation.consultation_date).getFullYear()}</div>
          </div>
          
          <div class="patient-info">
            <h3>📋 Patient Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Full Name</span>
                <span class="info-value">${patientHistory?.first_name} ${patientHistory?.last_name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date of Birth</span>
                <span class="info-value">${patientHistory?.date_of_birth ? new Date(patientHistory.date_of_birth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone Number</span>
                <span class="info-value">${patientHistory?.phone || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email Address</span>
                <span class="info-value">${patientHistory?.email || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Blood Group</span>
                <span class="info-value">${patientHistory?.blood_group || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hospital</span>
                <span class="info-value">${user?.hospital_name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Consultation Date</span>
                <span class="info-value">${new Date(consultation.consultation_date).toLocaleDateString()} at ${new Date(consultation.consultation_date).toLocaleTimeString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Visit Number</span>
                <span class="info-value">#${patientHistory?.total_visits || 1}</span>
              </div>
            </div>
          </div>
          
          ${consultation.complaint ? `
            <div class="section">
              <div class="section-title">📋 Patient's Complaint</div>
              <div class="section-content">${consultation.complaint}</div>
            </div>
          ` : ''}
          
          ${consultation.examination ? `
            <div class="section">
              <div class="section-title">🔍 Examination Findings</div>
              <div class="section-content">${consultation.examination}</div>
            </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">🩺 Diagnosis</div>
            <div class="section-content">${consultation.diagnosis}</div>
          </div>
          
          <div class="section">
            <div class="section-title">💊 Prescription</div>
            <div class="section-content">${consultation.prescription.replace(/\n/g, '<br>')}</div>
          </div>
          
          ${consultation.medicines && consultation.medicines.length > 0 ? `
            <div class="section">
              <div class="section-title">📦 Prescribed Medicines</div>
              <div class="medicines-grid">
                ${consultation.medicines.map(med => `
                  <div class="medicine-card">
                    <div class="medicine-name">${med.name}</div>
                    <div class="medicine-details">
                      <strong>Dosage:</strong> ${med.dosage}<br>
                      <strong>Frequency:</strong> ${med.frequency}<br>
                      ${med.duration ? `<strong>Duration:</strong> ${med.duration}<br>` : ''}
                      ${med.instructions ? `<strong>Instructions:</strong> ${med.instructions}` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${consultation.images && consultation.images.length > 0 ? `
            <div class="section">
              <div class="section-title">📸 Examination Images (${consultation.images.length})</div>
              <div class="images-grid">
                ${consultation.images.map(img => `
                  <div class="image-card">
                    <img src="${img.data}" alt="${img.name || 'Image'}">
                    <div class="image-name">${img.name || 'Image'}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          ${consultation.notes ? `
            <div class="section">
              <div class="section-title">📝 Additional Notes</div>
              <div class="section-content">${consultation.notes.replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="signature">
              <div class="doctor-signature">
                <div class="signature-line"></div>
                <div>Dr. ${consultation.doctor_name || user.full_name}</div>
                <div style="font-size: 11px; color: #6b7280;">Attending Physician</div>
              </div>
              <div class="doctor-signature">
                <div class="signature-line"></div>
                <div>Patient/Guardian Signature</div>
                <div style="font-size: 11px; color: #6b7280;">(If required)</div>
              </div>
            </div>
            <p style="margin-top: 20px;">This is a computer-generated document. Valid without signature.</p>
            <p>${hospitalName} - ${new Date().toLocaleString()}</p>
            <p style="margin-top: 10px; font-size: 10px; color: #9ca3af;">
              * This report is for medical purposes only. Please consult your doctor for any questions.
            </p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const getPatientBadge = (patient) => {
    if (!patient.is_returning) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 whitespace-nowrap">
          First Visit
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
          {patient.total_visits} {patient.total_visits === 1 ? 'visit' : 'visits'}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Patients</h1>
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
          Total: {patients.length} patients
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={visitFilter}
              onChange={(e) => setVisitFilter(e.target.value)}
            >
              <option value="all">All Patients ({patients.length})</option>
              <option value="first">First Time ({patients.filter(p => !p.is_returning).length})</option>
              <option value="returning">Returning ({patients.filter(p => p.is_returning).length})</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setVisitFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'all' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({patients.length})
          </button>
          <button
            onClick={() => setVisitFilter('first')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'first' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🆕 First ({patients.filter(p => !p.is_returning).length})
          </button>
          <button
            onClick={() => setVisitFilter('returning')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              visitFilter === 'returning' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔄 Returning ({patients.filter(p => p.is_returning).length})
          </button>
        </div>

        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {filteredPatients.length} patients matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Patient List</h2>
          
          {loading && !patientHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {filteredPatients.map(patient => (
                <div 
                  key={patient.id} 
                  className={`relative cursor-pointer transition-all ${
                    selectedPatient === patient.id ? 'ring-2 ring-blue-500 rounded-lg' : ''
                  }`}
                  onClick={() => handlePatientClick(patient.id)}
                >
                  <div className="absolute top-2 right-2 z-10">
                    {getPatientBadge(patient)}
                  </div>
                  <PatientCard
                    patient={patient}
                    onClick={() => handlePatientClick(patient.id)}
                    onConsult={() => handleAddConsultation(patient.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          {!patientHistory ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Patient Selected</h3>
              <p className="mt-2 text-sm text-gray-500">
                Click on a patient from the list to view their medical history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Medical History
                  </h2>
                  <p className="text-sm text-gray-500">
                    {patientHistory.first_name} {patientHistory.last_name} • {patientHistory.total_visits} total visits
                  </p>
                </div>
                <button
                  onClick={() => handleAddConsultation(patientHistory.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center shadow-sm"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Consultation
                </button>
              </div>
              
              {/* Consultation List */}
              <div>
                <ConsultationList
                  consultations={patientHistory.visit_history || []}
                  onSelectConsultation={handleConsultationClick}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consultation Form Modal */}
      {showConsultationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-4 border w-full max-w-full sm:max-w-2xl min-h-screen sm:min-h-0 shadow-lg rounded-none sm:rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Consultation</h2>
              <button
                onClick={() => setShowConsultationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ConsultationForm
              patientId={selectedPatient}
              doctorId={user.id}
              onSubmit={handleConsultationSubmit}
              onCancel={() => setShowConsultationForm(false)}
            />
          </div>
        </div>
      )}

      {/* Consultation Detail Modal */}
      {showConsultationModal && selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setShowConsultationModal(false)}
          onDownload={handleDownloadConsultation}
        />
      )}
    </div>
  );
};

export default PatientsPage;