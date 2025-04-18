import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
class SocialsService {
    static async getSocials() {
      try {
        const response = await axios.get(`${API_URL}/redes-sociais/`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }
    }
  
  }
  
  export default SocialsService;