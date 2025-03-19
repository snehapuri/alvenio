import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication service
const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Video interaction service
const videoService = {
  uploadVideo: async (videoBlob, questionId, userId) => {
    try {
      const formData = new FormData();
      formData.append('video', videoBlob, 'user_video.webm');
      formData.append('question_id', questionId);
      formData.append('user_id', userId);
      
      const response = await api.post('/video-interaction', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Document service
const documentService = {
  uploadDocument: async (file, documentType, userId, loanApplicationId = null) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      formData.append('user_id', userId);
      
      if (loanApplicationId) {
        formData.append('loan_application_id', loanApplicationId);
      }
      
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Loan application service
const loanService = {
  createApplication: async (loanData) => {
    try {
      const formData = new FormData();
      Object.keys(loanData).forEach(key => {
        formData.append(key, loanData[key]);
      });
      
      const response = await api.post('/loan-applications', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getApplication: async (applicationId) => {
    try {
      const response = await api.get(`/loan-applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  findApplicationByEmail: async (email, applicationId) => {
    try {
      const response = await api.get('/loan-applications/find', {
        params: { email, application_id: applicationId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// AI manager service
const aiManagerService = {
  getNextQuestion: async (userId, currentQuestionId = null) => {
    try {
      const params = { user_id: userId };
      if (currentQuestionId) {
        params.current_question_id = currentQuestionId;
      }
      
      const response = await api.get('/ai-manager/next-question', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  processResponse: async (userId, questionId, responseText) => {
    try {
      const response = await api.post('/ai-manager/process-response', {
        user_id: userId,
        question_id: questionId,
        response_text: responseText
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { api, authService, videoService, documentService, loanService, aiManagerService }; 