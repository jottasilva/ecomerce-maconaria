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
  
      <div v-else-if="paymentStatus" class="status-container success-container">
        <h2>Pagamento Aprovado!</h2>
        <div class="order-details">
          <p><strong>ID do Pedido:</strong> {{ orderId || 'N/A' }}</p>
          <p><strong>Total:</strong> R$ {{ formatCurrency(orderTotal) }}</p>
          
          <div v-if="checkoutData" class="items-summary">
            <h3>Resumo do pedido</h3>
            <ul>
              <li v-for="item in checkoutData.cartItems" :key="item.id">
                {{ item.nome }} x {{ item.quantity }} - R$ {{ formatCurrency(item.preco * item.quantity) }}
              </li>
            </ul>
            
            <div class="shipping-info">
              <h3>Endereço de entrega</h3>
              <p>{{ formatAddress() }}</p>
            </div>
          </div>
        </div>
        <button @click="goToHome" class="primary-button">Continuar comprando</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CheckoutSuccess',
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
          const status = this.$route.query.status;
          
          // Recuperar dados salvos no localStorage
          this.loadStoredData();
          
          if (paymentId) {
            // Importar a classe Checkout dinamicamente para evitar problemas de SSR
            const { Checkout } = await import('@/services/payment_checkout.js');
            
            // Verificar o status do pagamento usando o método estático
            const paymentStatus = await Checkout.checkPaymentStatus(paymentId);
            this.paymentStatus = paymentStatus;
            
            // Se o pagamento foi aprovado, podemos limpar os dados do checkout
            if (paymentStatus.status === 'approved') {
              setTimeout(() => {
                Checkout.clearCheckoutData();
              }, 2000);
            }
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
      
      formatAddress() {
        if (!this.checkoutData || !this.checkoutData.shippingData || !this.checkoutData.shippingData.address) {
          return 'Endereço não disponível';
        }
        
        const address = this.checkoutData.shippingData.address;
        return `${address.rua}, ${address.numero}${address.complemento ? ', ' + address.complemento : ''} - ${address.bairro}, ${address.cidade}/${address.estado} - CEP: ${address.cep}`;
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
  
  .success-container h2 {
    color: #2ecc71;
  }
  
  .error-container h2 {
    color: #e74c3c;
  }
  
  .order-details {
    margin: 20px 0;
    padding: 15px;
    background-color: #fff;
    border-radius: 5px;
    border-left: 4px solid #2ecc71;
  }
  
  .items-summary {
    margin-top: 20px;
  }
  
  .items-summary ul {
    list-style-type: none;
    padding-left: 0;
  }
  
  .items-summary li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }
  
  .shipping-info {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
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