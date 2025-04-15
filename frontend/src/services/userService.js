import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';


const userService = {
  // Create User
  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  },

  // Fetch User(s) based on pagination page and limit
  fetchUsers: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get specific User by ID
  getUserById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },


  // Update User by ID
  updateUser: async (id, updatedData) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, updatedData);
    return response.data;
  },

  // Delete User by ID
  deleteUser: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },
};

export default userService;