<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>BODECHIQUE - Gerencimento</h2>

        </div>
        <div class="modal-body">
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Usuário:</label>
              <input 
                type="text" 
                id="email" 
                v-model="username" 
                required 
                placeholder="Seu Usuário"
              />
            </div>
            
            <div class="form-group">
              <label for="password">Senha:</label>
              <input 
                type="password" 
                id="password" 
                v-model="password" 
                required 
                placeholder="Sua senha"
              />
            </div>
            
            <div v-if="error" class="error-message">
              {{ error }}
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="login-button" 
                :disabled="loading"
              >
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import OrdersServiceList from '~/services/OrdersListService';
  
  const props = defineProps({
    show: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close', 'login-success']);
  
  const username = ref('');
  const password = ref('');
  const error = ref('');
  const loading = ref(false);
  
  const handleLogin = async () => {
    loading.value = true;
    error.value = '';
    
    try {
      await OrdersServiceList.Login(username.value, password.value);
      emit('login-success');
    } catch (err) {
      error.value = 'Credenciais inválidas';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-container {
    background-color: #14213d;
    border-radius: 8px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #183b86;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #ffffff;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #777;
  }
 
  .modal-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: white;
  }
  
  .form-group input {
    width: 93%;
    padding: 12px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .error-message {
    margin: 12px 0;
    color: #e53935;
    font-size: 0.9rem;
  }
  
  .form-actions {
    margin-top: 24px;
    text-align: right;
  }
  
  .login-button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .login-button:hover {
    background-color: #43a047;
  }
  
  .login-button:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
  </style>