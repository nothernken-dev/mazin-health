import axios from 'axios';

const API_BASE_URL = 'https://mazin-health.onrender.com/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    if (user && user.id) {
      config.headers['X-User-ID'] = String(user.id);
    }
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ============= AUTH =============
export const login = (credentials) => api.post('/login', credentials);

// ============= HOSPITALS =============
export const getHospitals = () => api.get('/hospitals');
export const getHospital = (id) => api.get(`/hospitals/${id}`);
export const createHospital = (data) => api.post('/hospitals', data);
export const updateHospital = (id, data) => api.put(`/hospitals/${id}`, data);
export const deleteHospital = (id) => api.delete(`/hospitals/${id}`);

// ============= SUPER ADMIN =============
export const superAdminToggleHospital = (id) => api.put(`/super-admin/hospitals/${id}/toggle`);
export const superAdminToggleUser = (id) => api.put(`/super-admin/users/${id}/toggle`);

// ============= USERS =============
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ============= PATIENTS =============
export const getPatients = () => api.get('/patients');
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// ============= DOCTORS =============
export const getDoctors = () => api.get('/doctors');
export const getDoctor = (id) => api.get(`/doctors/${id}`);
export const getDoctorPatients = (doctorId) => api.get(`/doctors/${doctorId}/patients`);
export const getDoctorAppointments = (doctorId) => api.get(`/doctors/${doctorId}/appointments`);

// ============= APPOINTMENTS =============
export const getAppointments = () => api.get('/appointments');
export const getAppointment = (id) => api.get(`/appointments/${id}`);
export const createAppointment = (data) => api.post('/appointments', data);
export const getPatientAppointments = (patientId) => api.get(`/appointments/patient/${patientId}`);
export const updateAppointmentStatus = (id, status) => api.put(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// ============= CONSULTATIONS =============
export const createConsultation = (data) => api.post('/consultations', data);
export const getPatientConsultations = (patientId) => api.get(`/consultations/patient/${patientId}`);

// ============= STATS =============
export const getStats = () => api.get('/stats');

// ============= DEBUG =============
export const debugPatient = (patientId) => api.get(`/debug/patient/${patientId}`);

export default api;
