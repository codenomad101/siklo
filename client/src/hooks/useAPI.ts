import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI, practiceAPI, examAPI, userAPI } from '../services/api';
import { message } from 'antd';

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      try {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        queryClient.setQueryData(['user'], data.data.user);
        message.success('Login successful!');
      } catch (error) {
        console.error('Error saving user data:', error);
        message.error('Login successful but failed to save user data');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      try {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        queryClient.setQueryData(['user'], data.data.user);
        message.success('Registration successful!');
      } catch (error) {
        console.error('Error saving user data:', error);
        message.error('Registration successful but failed to save user data');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      queryClient.clear();
      message.success('Logged out successfully');
    },
    onError: () => {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getProfile,
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
    initialData: () => {
      try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
        return null;
      }
    },
  });
};

// Practice hooks
export const useCreatePracticeSession = () => {
  return useMutation({
    mutationFn: practiceAPI.createSession,
    onSuccess: () => {
      message.success('Practice session started!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start practice session');
    },
  });
};

export const useCompletePracticeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, sessionData }: { sessionId: string; sessionData: any }) =>
      practiceAPI.completeSession(sessionId, sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['practiceStats'] });
      message.success('Practice session completed!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to complete practice session');
    },
  });
};

export const usePracticeHistory = (userId: string) => {
  return useQuery({
    queryKey: ['practiceHistory', userId],
    queryFn: () => practiceAPI.getHistory(userId),
    enabled: !!userId,
  });
};

export const usePracticeStats = (userId: string) => {
  return useQuery({
    queryKey: ['practiceStats', userId],
    queryFn: () => practiceAPI.getStats(userId),
    enabled: !!userId,
  });
};

// Exam hooks
export const useCreateDynamicExam = () => {
  return useMutation({
    mutationFn: examAPI.createDynamicExam,
    onSuccess: () => {
      message.success('Dynamic exam created!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create exam');
    },
  });
};

export const useStartExam = () => {
  return useMutation({
    mutationFn: examAPI.startExam,
    onSuccess: () => {
      message.success('Exam started!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start exam');
    },
  });
};

export const useExamQuestions = (sessionId: string) => {
  return useQuery({
    queryKey: ['examQuestions', sessionId],
    queryFn: () => examAPI.getQuestions(sessionId),
    enabled: !!sessionId,
  });
};

export const useCompleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, examData }: { sessionId: string; examData: any }) =>
      examAPI.completeExam(sessionId, examData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examHistory'] });
      queryClient.invalidateQueries({ queryKey: ['examStats'] });
      message.success('Exam completed!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to complete exam');
    },
  });
};

export const useExamHistory = () => {
  return useQuery({
    queryKey: ['examHistory'],
    queryFn: examAPI.getExamHistory,
  });
};

export const useExamStats = () => {
  return useQuery({
    queryKey: ['examStats'],
    queryFn: examAPI.getExamStats,
  });
};

// User hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: userAPI.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      message.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      message.success('Password changed successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: userAPI.getProgress,
  });
};
