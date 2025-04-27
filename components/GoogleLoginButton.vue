<template>
    <div class="google-login-container">
      <button v-if="!user" @click="handleGoogleLogin" class="login-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="login-icon">
          <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4"/>
        </svg>
        Entrar com Google
      </button>
      
      <div v-else class="user-info">
        <img :src="user.picture" alt="Foto do usuário" class="user-avatar">
        <div class="user-details">
          <p class="user-name">Bem-vindo, {{ user.name }}<button @click="handleLogout" class="logout-button">Sair</button></p>
          
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import GoogleLoginService from '~/services/LoginGoogleService';
  
  export default {
    name: 'GoogleLoginButton',
    props: {
      initialUser: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        googleService: null,
        user: this.initialUser
      };
    },
    created() {
      if (process.client) {
        this.googleService = new GoogleLoginService(import.meta.env.VITE_GOOGLE_CLIENT_ID);
        if (this.googleService.isAuthenticated()) {
          this.user = this.googleService.getCurrentUser();
          this.$emit('user-logged-in', this.user);
        }
      }
    },
    methods: {
      async handleGoogleLogin() {
        try {
          if (!this.googleService.isLoaded) {
            await this.googleService.init();
          }
          this.user = await this.googleService.login();
          this.$emit('user-logged-in', this.user);
        } catch (error) {
          console.error('Erro ao fazer login:', error);
          this.$emit('login-error', error);
        }
      },
      
      handleLogout() {
        this.googleService.logout();
        this.user = null;
        this.$emit('user-logged-out');
      }
    }
  };
  </script>
  
  <style scoped>
  .google-login-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  
  .login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #fff;
    color: #444;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px 15px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s;
  }
  
  .login-button:hover {
    background-color: #f8f8f8;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  .login-icon {
    width: 18px;
    height: 18px;
  }
  
  .user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 8px;
    width: 100%;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .user-details {
    flex: 1;
  }
  
  .user-name {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .logout-button {
    background-color: transparent;
    color: #ff5252;
    border: 1px solid #ff5252;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s;
    margin: 0 20px;
  }
  
  .logout-button:hover {
    background-color: rgba(255, 82, 82, 0.1);
  }
  </style>