import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials: { emailOrUsername: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { 
    username?: string;
    email: string; 
    password: string; 
    fullName: string; 
    phone?: string;
    role?: 'admin' | 'student' | 'moderator';
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
};

// Practice API functions
export const practiceAPI = {
  createSession: async (category: string) => {
    const response = await apiClient.post('/practice/enhanced/create', { category });
    return response.data;
  },

  completeSession: async (sessionId: string, sessionData: any) => {
    const response = await apiClient.post(`/practice/enhanced/complete/${sessionId}`, sessionData);
    return response.data;
  },

  getHistory: async (userId: string) => {
    const response = await apiClient.get(`/practice/enhanced/history/${userId}`);
    return response.data;
  },

  getStats: async (userId: string) => {
    const response = await apiClient.get(`/practice/enhanced/stats/${userId}`);
    return response.data;
  },
};

// Exam API functions
export const examAPI = {
  createDynamicExam: async (examConfig: any) => {
    const response = await apiClient.post('/exam/dynamic/create', examConfig);
    return response.data;
  },

  startExam: async (sessionId: string) => {
    const response = await apiClient.post(`/exam/dynamic/${sessionId}/start`);
    return response.data;
  },

  getQuestions: async (sessionId: string) => {
    const response = await apiClient.get(`/exam/dynamic/${sessionId}/questions`);
    return response.data;
  },

  completeExam: async (sessionId: string, examData: any) => {
    const response = await apiClient.post(`/exam/dynamic/${sessionId}/complete`, examData);
    return response.data;
  },

  getExamHistory: async () => {
    const response = await apiClient.get('/exam/dynamic/history');
    return response.data;
  },

  getExamStats: async () => {
    const response = await apiClient.get('/exam/dynamic/stats');
    return response.data;
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (userData: any) => {
    const response = await apiClient.put('/user/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.put('/user/change-password', passwordData);
    return response.data;
  },

  getProgress: async () => {
    const response = await apiClient.get('/progress/user');
    return response.data;
  },
};
