import axios from 'axios';
export async function sendCheckoutData(requestData) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL+'/orders/'; 
  
      const response = await axios.post(apiUrl, requestData);
      if (response.status !== 200 && response.status !== 201) {
          throw new Error(`Erro na API: ${response.status}`);
      }
  
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Erro na API: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao enviar dados para a API:', error);
      throw error; 
    }
  }