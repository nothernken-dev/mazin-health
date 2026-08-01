import React, { useState } from 'react';
import ImageCapture from './ImageCapture';
import ImageViewer from './ImageViewer';

const ConsultationForm = ({ patientId, doctorId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    complaint: '',
    examination: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    images: []
  });
  
  const [showCamera, setShowCamera] = useState(false);
  const [imageName, setImageName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCaptureImage = (imageData) => {
    if (!imageName.trim()) {
      alert('Please enter an image name first');
      return;
    }
    
    const newImages = [...formData.images, {
      id: Date.now(),
      data: imageData,
      name: imageName.trim(),
      timestamp: new Date().toISOString()
    }];
    setFormData({ ...formData, images: newImages });
    setImageName('');
    setShowCamera(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const name = prompt('Enter name for this image:', file.name.split('.')[0]);
      if (name) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImages = [...formData.images, {
            id: Date.now() + Math.random(),
            data: reader.result,
            name: name,
            timestamp: new Date().toISOString()
          }];
          setFormData({ ...formData, images: newImages });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDeleteImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMedicines });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const consultationData = {
        patient_id: patientId,
        doctor_id: doctorId,
        complaint: formData.complaint,
        examination: formData.examination,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        notes: formData.notes,
        medicines: formData.medicines.filter(m => m.name && m.dosage && m.frequency),
        images: formData.images
      };
      
      console.log('Saving consultation:', consultationData);
      await onSubmit(consultationData);
    } catch (err) {
      setError('Failed to save consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Images Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">📸 Examination Images</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Take Photo
            </button>
            <label className="bg-green-500 text-white px-3 py-1 rounded text-sm cursor-pointer hover:bg-green-600">
              Upload File
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <input
          type="text"
          placeholder="Image name (e.g., Left Ear, Right Eye)"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3 text-sm"
        />

        {formData.images.length > 0 && (
          <ImageViewer images={formData.images} onDelete={handleDeleteImage} />
        )}

        {formData.images.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">
            1. Enter image name above<br />
            2. Click "Take Photo" or "Upload File"
          </p>
        )}
      </div>

      {/* Complaint */}
      <div>
        <label className="block font-medium mb-1">
          Patient's Complaint <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows="3"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.complaint}
          onChange={(e) => setFormData({...formData, complaint: e.target.value})}
          placeholder="e.g., Headache for 3 days, Fever, Cough, Ear pain, etc..."
        />
        <p className="text-xs text-gray-500 mt-1">Describe the patient's symptoms and concerns</p>
      </div>

      {/* Examination */}
      <div>
        <label className="block font-medium mb-1">
          Examination Findings <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows="3"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.examination}
          onChange={(e) => setFormData({...formData, examination: e.target.value})}
          placeholder="e.g., Tympanic membrane erythematous, Bulging, Discharge present, etc..."
        />
        <p className="text-xs text-gray-500 mt-1">Document physical examination findings</p>
      </div>

      {/* Diagnosis */}
      <div>
        <label className="block font-medium mb-1">Diagnosis *</label>
        <textarea
          required
          rows="2"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.diagnosis}
          onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
          placeholder="Enter diagnosis..."
        />
      </div>

      {/* Prescription */}
      <div>
        <label className="block font-medium mb-1">Pmshx *</label>
        <textarea
          required
          rows="3"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.prescription}
          onChange={(e) => setFormData({...formData, prescription: e.target.value})}
          placeholder="Enter Pmshx..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block font-medium mb-1">Additional Notes</label>
        <textarea
          rows="2"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any additional notes..."
        />
      </div>

      {/* Medicines */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium">Medicines</label>
          <button type="button" onClick={addMedicine} className="text-blue-600 text-sm hover:text-blue-800">
            + Add Medicine
          </button>
        </div>
        
        {formData.medicines.map((medicine, index) => (
          <div key={index} className="border rounded p-3 mb-2 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Medicine {index + 1}</span>
              {formData.medicines.length > 1 && (
                <button type="button" onClick={() => removeMedicine(index)} className="text-red-600 text-sm">
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Name"
                className="border rounded px-2 py-1 text-sm"
                value={medicine.name}
                onChange={(e) => updateMedicine(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Dosage"
                className="border rounded px-2 py-1 text-sm"
                value={medicine.dosage}
                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
              />
              <input
                type="text"
                placeholder="Frequency"
                className="border rounded px-2 py-1 text-sm"
                value={medicine.frequency}
                onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
              />
              <input
                type="text"
                placeholder="Duration"
                className="border rounded px-2 py-1 text-sm"
                value={medicine.duration}
                onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Instructions"
              className="w-full border rounded px-2 py-1 text-sm mt-2"
              value={medicine.instructions}
              onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Consultation'}
        </button>
      </div>

      {showCamera && (
        <ImageCapture
          onCapture={handleCaptureImage}
          onClose={() => setShowCamera(false)}
          title="Take Examination Photo"
        />
      )}
    </form>
  );
};

export default ConsultationForm;