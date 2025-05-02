import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const API_URL_CLEAR = import.meta.env.VITE_API_URL_CLEAR;

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const response = await axios.post(`${API_URL_CLEAR}/token/refresh/`, {
            refresh: refreshToken
          });

          localStorage.setItem('access', response.data.access);

          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/'; 
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

class OrdersServiceList {
  static checkAuth() {
    if (!localStorage.getItem('access')) {
      throw new Error('Não autorizado. Faça login para continuar.');
    }
  }

  static async getOrders() {
    this.checkAuth();
    try {
      const response = await axios.get(`${API_URL}/orders/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  }
  
  static async getOrderById(id) {
    this.checkAuth();
    try {
      const response = await axios.get(`${API_URL}/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pedido ${id}:`, error);
      throw error;
    }
  }
  
  static async cancelOrder(id) {
    this.checkAuth();
    try {
      const response = await axios.patch(`${API_URL}/orders/${id}/`, { status: 'cancelled' });
      return response.data;
    } catch (error) {
      console.error(`Erro ao cancelar pedido ${id}:`, error);
      throw error;
    }
  }
  
  static async processOrder(id) {
    this.checkAuth();
    try {
      const response = await axios.patch(`${API_URL}/orders/${id}/`, { status: 'processing' });
      return response.data;
    } catch (error) {
      console.error(`Erro ao processar pedido ${id}:`, error);
      throw error;
    }
  }
  
  static async Login(username, password) {
    try {
      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        throw new Error('Invalid username or password format');
      }

      if (!API_URL_CLEAR.startsWith('https://')) {
        console.warn('Warning: Using non-HTTPS endpoint for authentication');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.post(`${API_URL_CLEAR}/token/`, {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        localStorage.setItem('access_expiration', expiration.getTime());
        
        console.log(`User ${username} logged in successfully at ${new Date().toISOString()}`);
        
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Login error:', err.message || 'Unknown error');
      throw new Error('Authentication failed. Please check your credentials and try again.');
    }
  }
  
  static async Logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('access_expiration');
    return true;
  }
  
  static async isAuthenticated() {
    const token = localStorage.getItem('access');
    const expirationStr = localStorage.getItem('access_expiration');
    
    if (!token || !expirationStr) {
      return false;
    }
    
    const expiration = parseInt(expirationStr, 10);
    const now = new Date().getTime();
    
    if (now > expiration) {
      this.Logout();
      return false;
    }
    
    return true;
  }
  
  static async shipOrder(id) {
    this.checkAuth();
    try {
      const response = await axios.patch(`${API_URL}/orders/${id}/`, { status: 'shipped' });
      return response.data;
    } catch (error) {
      console.error(`Erro ao enviar pedido ${id}:`, error);
      throw error;
    }
  }
  
  static async completeOrder(id) {
    this.checkAuth();
    try {
      const response = await axios.patch(`${API_URL}/orders/${id}/`, { status: 'completed' });
      return response.data;
    } catch (error) {
      console.error(`Erro ao concluir pedido ${id}:`, error);
      throw error;
    }
  }
  
  static async filterOrdersByStatus(status) {
    this.checkAuth();
    try {
      const response = await axios.get(`${API_URL}/orders?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao filtrar pedidos por status ${status}:`, error);
      throw error;
    }
  }
  
  static async searchOrders(query) {
    this.checkAuth();
    try {
      const response = await axios.get(`${API_URL}/orders/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error(`Erro na busca de pedidos: ${query}`, error);
      throw error;
    }
  }
}

export default OrdersServiceList;