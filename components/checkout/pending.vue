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
  
      <div v-else class="status-container pending-container">
        <h2>Pagamento Pendente</h2>
        <p>Seu pagamento está sendo processado.</p>
        <p>Você receberá uma confirmação por e-mail assim que o pagamento for aprovado.</p>
        
        <div class="order-info">
          <p><strong>ID do Pedido:</strong> {{ orderId || 'N/A' }}</p>
          <p v-if="orderTotal > 0"><strong>Total:</strong> R$ {{ formatCurrency(orderTotal) }}</p>
        </div>
        
        <p class="instructions">
          Caso tenha optado por boleto ou transferência, siga as instruções enviadas por e-mail para concluir o pagamento.
        </p>
        
        <button @click="goToHome" class="primary-button">Voltar para a loja</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CheckoutPending',
    data() {
      return {
        paymentStatus: null,
        isLoading: true,
        error: null,
        orderId: null,
        checkoutData: null,
        orderTotal: 0
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
          
          // Recuperar dados salvos no localStorage
          this.loadStoredData();
          
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
      
      loadStoredData() {
        // Recuperar ID do pedido
        this.orderId = localStorage.getItem('last_order_id');
        
        // Recuperar dados do checkout
        const savedCheckoutData = localStorage.getItem('checkout_data');
        if (savedCheckoutData) {
          try {
            this.checkoutData = JSON.parse(savedCheckoutData);
            
            // Calcular o total do pedido
            if (this.checkoutData.cartItems) {
              const subtotal = this.checkoutData.cartItems.reduce((total, item) => {
                return total + (parseFloat(item.preco) * item.quantity);
              }, 0);
              
              const shippingCost = this.checkoutData.shippingData?.cost || 0;
              this.orderTotal = subtotal + shippingCost;
            }
          } catch (e) {
            console.error('Erro ao processar dados salvos do checkout:', e);
          }
        }
      },
      
      formatCurrency(value) {
        return Number(value).toFixed(2);
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
  
  .pending-container h2 {
    color: #f39c12;
  }
  
  .error-container h2 {
    color: #e74c3c;
  }
  
  .order-info {
    margin: 20px 0;
    padding: 15px;
    background-color: #fff;
    border-radius: 5px;
    border-left: 4px solid #f39c12;
  }
  
  .instructions {
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 5px;
    border: 1px dashed #ccc;
  }
  
  .primary-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    transition: background-color 0.3s;
  }
  
  .primary-button:hover {
    background-color: #2980b9;
  }
  </style>