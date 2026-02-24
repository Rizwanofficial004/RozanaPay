import { create } from 'zustand';
import api from '../services/api';
import { toast } from 'react-toastify';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      toast.success('Login successful!');
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    toast.info('Logged out successfully');
  },

  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (error) {
      set({ user: null, token: null });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
}));

export default useAuthStore;
