import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AuthAPI {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete axios.defaults.headers.common['Authorization'];
  }

  async login(phoneNumber: string) {
    const response = await axios.post(`${BASE_URL}/auth/login`, { phoneNumber });
    return response.data;
  }

  async signup(data: { phoneNumber: string; firstName: string; lastName: string }) {
    const response = await axios.post(`${BASE_URL}/auth/signup`, data);
    return response.data;
  }

  async verifyOTP(data: { phoneNumber: string; otp: string }) {
    const response = await axios.post(`${BASE_URL}/auth/verify`, data);
    return response.data;
  }

  async getProfile() {
    const response = await axios.get(`${BASE_URL}/auth/profile`);
    return response.data;
  }
}

export const authAPI = new AuthAPI();

// Groups API
export const groupsAPI = {
  getAllGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  getGroupById: async (id: string) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  createGroup: async (data: any) => {
    const response = await api.post('/groups', data);
    return response.data;
  },

  updateGroup: async (id: string, data: any) => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  deleteGroup: async (id: string) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  getGroupMembers: async (id: string) => {
    const response = await api.get(`/groups/${id}/members`);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  }
};

export default api;