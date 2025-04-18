import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

class ContactService {
  static async getContact() {
    try {
      const response = await axios.get(`${API_URL}/contato/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

}

export default ContactService;

