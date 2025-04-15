// src/services/ProductService.js
import axios from 'axios';

// URL base da API
const API_URL = 'http://127.0.0.1:8000/api'; // Ajuste conforme necessário, por exemplo: 'http://localhost:8000/api'

class ProductService {
  // Buscar todos os produtos
  static async getProducts() {
    try {
      const response = await axios.get(`${API_URL}/produtos/`);
      // Salvar no localStorage para acesso offline
      localStorage.setItem('products', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      // Em caso de falha, tenta recuperar do localStorage
      const cachedProducts = localStorage.getItem('products');
      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }
      throw error;
    }
  }

  // Buscar produtos por categoria
  static async getProductsByCategory(categoriaSlug) {
    try {
      // Esta requisição deve ir para a URL do frontend que renderiza 
      // produtos por categoria e não diretamente para a API
      const response = await axios.get(`/categoria/${categoriaSlug}/`);
      // Salvar no localStorage por categoria
      localStorage.setItem(`products_category_${categoriaSlug}`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${categoriaSlug}:`, error);
      // Recuperar do localStorage
      const cachedCategoryProducts = localStorage.getItem(`products_category_${categoriaSlug}`);
      if (cachedCategoryProducts) {
        return JSON.parse(cachedCategoryProducts);
      }
      throw error;
    }
  }

  // Buscar detalhes de um produto específico
  static async getProductById(id, slug) {
    try {
      // Esta requisição deve ir para a URL do frontend que renderiza 
      // os detalhes do produto e não diretamente para a API
      const response = await axios.get(`/${id}/${slug}/`);
      // Salvar este produto específico no localStorage
      localStorage.setItem(`product_${id}`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar produto com ID ${id}:`, error);
      // Tentar buscar do cache local
      const cachedProduct = localStorage.getItem(`product_${id}`);
      if (cachedProduct) {
        return JSON.parse(cachedProduct);
      }
      // Tentar encontrar na lista geral de produtos
      const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const product = allProducts.find(p => p.id === parseInt(id));
      if (product) {
        return product;
      }
      throw error;
    }
  }

  // Criar um novo produto (apenas para admin)
  static async createProduct(productData) {
    try {
      const response = await axios.post(`${API_URL}/produtos/criar/`, productData);
      // Atualizar o cache de produtos
      this.updateProductsCache(response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  // Editar um produto existente (apenas para admin)
  static async updateProduct(id, productData) {
    try {
      const response = await axios.put(`${API_URL}/produtos/${id}/editar/`, productData);
      // Atualizar o produto no localStorage
      localStorage.setItem(`product_${id}`, JSON.stringify(response.data));
      // Atualizar também na lista geral de produtos
      this.updateProductsCache(response.data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar produto com ID ${id}:`, error);
      throw error;
    }
  }

  // Excluir um produto (apenas para admin)
  static async deleteProduct(id) {
    try {
      const response = await axios.delete(`${API_URL}/produtos/${id}/excluir/`);
      // Remover o produto do localStorage
      localStorage.removeItem(`product_${id}`);
      // Remover também da lista geral de produtos
      this.removeProductFromCache(id);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir produto com ID ${id}:`, error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      // Considerando que você poderá criar um endpoint para categorias
      const response = await axios.get(`${API_URL}/categorias/`);
      // Salvar categorias no localStorage
      localStorage.setItem('categories', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      // Recuperar categorias do localStorage em caso de erro
      const cachedCategories = localStorage.getItem('categories');
      if (cachedCategories) {
        return JSON.parse(cachedCategories);
      }
      throw error;
    }
  }

  // Método auxiliar para atualizar um produto no cache geral
  static updateProductsCache(product) {
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const index = allProducts.findIndex(p => p.id === product.id);
    
    if (index !== -1) {
      // Atualizar produto existente
      allProducts[index] = product;
    } else {
      // Adicionar novo produto
      allProducts.push(product);
    }
    
    localStorage.setItem('products', JSON.stringify(allProducts));
  }

  // Método auxiliar para remover um produto do cache geral
  static removeProductFromCache(id) {
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedProducts = allProducts.filter(p => p.id !== parseInt(id));
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  }
}

export default ProductService;