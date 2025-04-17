import axios from 'axios';
const API_URL = 'http://127.0.0.1:8000/api';

class ProductService {
  static async getProducts() {
    try {
      const response = await axios.get(`${API_URL}/produtos/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categorias/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  static async getProductsByCategoryId(id) {
    try {
      const response = await fetch(`/api/categorias/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ID ${id}:`, error);
      throw error;
    }
  }

}

export default ProductService;