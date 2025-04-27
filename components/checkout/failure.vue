<template>
    <div class="checkout-return">
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Processando o retorno do pagamento...</p>
      </div>
  
      <div v-else-if="error" class="error-container">
        <h2>Ocorreu um erro</h2>
        <p>{{ error }}</p>
        <button @click="goToHome" class="primary-button">Voltar para a loja</button>
      </div>
  
      <div v-else class="status-container failure-container">
        <h2>Pagamento não aprovado</h2>
        <p>Infelizmente seu pagamento não foi aprovado.</p>
        <p v-if="paymentStatus && paymentStatus.message">
          Motivo: {{ paymentStatus.message }}
        </p>
        <div class="action-buttons">
          <button @click="retryPayment" class="primary-button">Tentar novamente</button>
          <button @click="goToHome" class="secondary-button">Voltar para a loja</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CheckoutFailure',
    data() {
      return {
        paymentStatus: null,
        isLoading: true,
        error: null
      };
    },
    mounted() {
      this.processPaymentReturn();
    },
    methods: {
      async processPaymentReturn() {
        try {
          this.isLoading = true;
          
          // Extrair os parâmetros da URL
          const paymentId = this.$route.query.payment_id;
          
          if (paymentId) {
            // Importar a classe Checkout dinamicamente
            const { Checkout } = await import('@/services/payment_checkout.js');
            
            // Verificar o status do pagamento usando o método estático
            const paymentStatus = await Checkout.checkPaymentStatus(paymentId);
            this.paymentStatus = paymentStatus;
          } else {
            this.error = 'ID do pagamento não encontrado na URL de retorno';
          }
        } catch (error) {
          console.error('Erro ao processar retorno do pagamento:', error);
          this.error = 'Ocorreu um erro ao processar o retorno do pagamento. Por favor, entre em contato com o suporte.';
        } finally {
          this.isLoading = false;
        }
      },
      
      retryPayment() {
        this.$router.push('/checkout');
      },
      
      goToHome() {
        this.$router.push('/');
      }
    }
  };
  </script>
  
  <style scoped>
  .checkout-return {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  .loading-container {
    text-align: center;
    padding: 40px 0;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .status-container {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .failure-container h2 {
    color: #e74c3c;
  }
  
  .error-container h2 {
    color: #e74c3c;
  }
  
  .action-buttons {
    margin-top: 30px;
  }
  
  .primary-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .primary-button:hover {
    background-color: #2980b9;
  }
  
  .secondary-button {
    background-color: #95a5a6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 10px;
    transition: background-color 0.3s;
  }
  
  .secondary-button:hover {
    background-color: #7f8c8d;
  }
  </style>