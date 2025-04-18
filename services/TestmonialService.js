import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

class TestmoialsService{
  static async getTestmonials() {
    try {
      const response = await axios.get(`${API_URL}/testmonials/`);
      return response.data;
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }



  static async getTestmonialById(id) {
    try {
      const response = await fetch(`/testmonials/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ID ${id}:`, error);
      throw error;
    }
  }

}

export default TestmoialsService;