import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'https://mern-intern-backend-5ly8.onrender.com';

// Auth API calls
export const authAPI = {
  login: (email, password) => 
    axios.post('/api/auth/login', { email, password }),
  
  signup: (name, email, password, role) => 
    axios.post('/api/auth/signup', { name, email, password, role }),
  
  getMe: () => 
    axios.get('/api/auth/me'),
  
  changePassword: (currentPassword, newPassword) => 
    axios.put('/api/auth/change-password', { currentPassword, newPassword })
};

// Student API calls
export const studentAPI = {
  // For students - get own profile
  getProfile: () => 
    axios.get('/api/students/profile'),
  
  // For students - update own profile
  updateProfile: (data) => 
    axios.put('/api/students/profile', data),
  
  // For admin - get all students
  getAll: (page = 1) => 
    axios.get(`/api/students?page=${page}`),
  
  // For admin - get specific student
  getById: (id) => 
    axios.get(`/api/students/profile/${id}`),
  
  // For admin - create student
  create: (data) => 
    axios.post('/api/students', data),
  
  // For admin - update student
  update: (id, data) => 
    axios.put(`/api/students/${id}`, data),
  
  // For admin - delete student
  delete: (id) => 
    axios.delete(`/api/students/${id}`)
};
