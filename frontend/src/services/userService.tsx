import axios from 'axios';
import { User } from '@/types/User'
import { API_BASE_URL } from '@/config/api'

export interface PaginatedUsers {
  totalItems: number;
  totalPages: number;
  currentPage: number; 
  records: User[],
}

const userService = {
  // Create User
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  },

  // Fetch User(s) based on pagination page and limit
  fetchUsers: async (page: number = 1, limit: number = 10): Promise<PaginatedUsers> => {
    const response = await axios.get(`${API_BASE_URL}/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get specific User by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },


  // Update User by ID
  updateUser: async (id: number, updatedData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, updatedData);
    return response.data;
  },

  // Delete User by ID
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },
};

export default userService;