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
  // Get practice categories
  getCategories: async () => {
    const response = await apiClient.get('/practice/categories');
    return response.data;
  },

  // Create a new practice session
  createSession: async (category: string, timeLimitMinutes: number = 15) => {
    const response = await apiClient.post('/practice/sessions', { 
      category, 
      timeLimitMinutes 
    });
    return response.data;
  },

  // Get practice session by ID
  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`/practice/sessions/${sessionId}`);
    return response.data;
  },

  // Update practice session with answer
  updateAnswer: async (sessionId: string, questionId: string, userAnswer: string, timeSpentSeconds: number) => {
    const response = await apiClient.patch(`/practice/sessions/${sessionId}/answer`, {
      questionId,
      userAnswer,
      timeSpentSeconds
    });
    return response.data;
  },

  // Complete practice session
  completeSession: async (sessionId: string) => {
    const response = await apiClient.patch(`/practice/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get user's practice history
  getHistory: async () => {
    const response = await apiClient.get('/practice/history');
    return response.data;
  },

  // Get user's practice statistics
  getStats: async () => {
    const response = await apiClient.get('/practice/stats');
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

// Admin API functions
export const adminAPI = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Category Management
  createCategory: async (categoryData: any) => {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response.data;
  },

  getCategories: async (params?: any) => {
    const response = await apiClient.get('/admin/categories', { params });
    return response.data;
  },

  updateCategory: async (categoryId: string, categoryData: any) => {
    const response = await apiClient.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId: string) => {
    const response = await apiClient.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },

  // Question Management
  getQuestions: async (params?: any) => {
    const response = await apiClient.get('/admin/questions', { params });
    return response.data;
  },

  deleteQuestion: async (questionId: string) => {
    const response = await apiClient.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  // JSON Import
  importQuestions: async (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append('jsonFile', file);
    formData.append('categoryId', categoryId);
    
    const response = await apiClient.post('/admin/import/questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getImportLogs: async (params?: any) => {
    const response = await apiClient.get('/admin/import/logs', { params });
    return response.data;
  },

  // User Management
  getUsers: async (params?: any) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
};
