<template>
  <div class="cart-modal-overlay" v-if="isOpen" @click.self="close">
    <div class="cart">
      <div class="cart-modal">
        <div class="cart-header">
          <h2>Seu Carrinho</h2>
          <button class="close-btn" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cart-content">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Seu carrinho está vazio</p>
            <button class="btn continue-shopping" @click="close">Continuar Comprando</button>
          </div>

          <div v-else>
            <div class="cart-items">
              <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item">
                <img :src="item.imagem" :alt="item.nome" class="item-image">
                <div class="item-details">
                  <h3>{{ item.nome }}</h3>
                  <p class="item-price">{{ formatPrice(item.preco) }}</p>
                </div>
                <div class="item-quantity">
                  <button class="qty-btn" @click="decreaseQuantity(item.id)" :disabled="item.quantity <= 1">-</button>
                  <span>{{ item.quantity }}</span>
                  <button class="qty-btn" @click="increaseQuantity(item.id)"
                    :disabled="item.quantity >= item.estoque">+</button>
                </div>
                <button class="remove-btn" @click="removeItem(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>{{ formatPrice(subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Frete:</span>
                <span>{{ frete }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>{{ formatPrice(total) }}</span>
              </div>
            </div>

            <div class="cart-actions">
              <button class="btn continue-shopping" @click="close">Continuar Comprando</button>
              <button class="btn checkout" @click="checkout" :disabled="isProcessingPayment">
                <span v-if="isProcessingPayment">Processando...</span>
                <span v-else>Finalizar Compra</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showMercadoPagoButton" id="mp_payment_button"></div>
</template>

<script>
import CartService from '~/services/CartService';

import axios from 'axios';
export default {
  name: 'CartModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cartItems: [],
      unsubscribe: null,
      showMercadoPagoButton: false,
      isProcessingPayment: false
    };
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (parseFloat(item.preco) * item.quantity);
      }, 0);
    },
    frete() {
      return this.subtotal > 200 ? 'Grátis' : this.formatPrice(15);
    },
    total() {
      return this.subtotal + (this.subtotal > 200 ? 0 : 15);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },

    formatPrice(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    increaseQuantity(productId) {
      CartService.incrementQuantity(productId);
    },
    decreaseQuantity(productId) {
      CartService.decrementQuantity(productId);
    },
    removeItem(index) {
      const productId = this.cartItems[index].id;
      CartService.removeFromCart(productId);
    },
    async checkout() {
  try {
    this.isProcessingPayment = true;
    console.log('Iniciando checkout...');
    
    // Verificar se há itens no carrinho
    if (this.cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
      this.isProcessingPayment = false;
      return;
    }
    
    this.$emit('checkout');

    // Verificar se os itens têm valores corretos
    console.log('Verificando itens do carrinho:', this.cartItems);

    // Carregando o script do MercadoPago
    if (!window.MercadoPago) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    const ACCESS_TOKEN = "TEST-605317394854439-041715-ed345146e0127fe79005bb15a6cadb25-54030146";
    const PUBLIC_KEY = "TEST-b1af6e00-934c-4dc6-90f9-05ac0cebd173";

    // Garantir que há itens no carrinho
    if (!this.cartItems || this.cartItems.length === 0) {
      // Tentar carregar os itens novamente do CartService
      await CartService.loadCartFromStorage();
      
      // Se ainda estiver vazio, abortar
      
    }

    const items = this.cartItems.map(item => ({
      title: item.nome || 'Produto',
      description: item.nome || 'Descrição do produto',
      quantity: parseInt(item.quantity || 1),
      currency_id: "BRL",
      unit_price: Number(parseFloat(item.preco || 0).toFixed(2))
    }));

    console.log('Items para enviar:', items);

    // Adicione um item mínimo se o array estiver vazio (para testes)
    if (items.length === 0) {
      items.push({
        title: "Produto teste",
        description: "Produto para teste",
        quantity: 1,
        currency_id: "BRL",
        unit_price: 10.00
      });
    }

    const requestData = {
      items: items,
      back_urls: {
        success: `${window.location.origin}/checkout/success`,
        failure: `${window.location.origin}/checkout/failure`,
        pending: `${window.location.origin}/checkout/pending`
      },
      auto_return: "approved",
      payer: {
        email: "test_user@testuser.com"
      }
    };

    console.log('Dados para enviar:', JSON.stringify(requestData));

    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ACCESS_TOKEN}`
        }
      }
    );

    const preferenceData = response.data;
    console.log('Preferência criada:', preferenceData);

    const mp = new window.MercadoPago(PUBLIC_KEY, {
      locale: 'pt-BR'
    });

    this.showMercadoPagoButton = true;
    await this.$nextTick(); // espera o botão aparecer no DOM

    mp.checkout({
      preference: {
        id: preferenceData.id
      },
      render: {
        container: '#mp_payment_button',
        label: 'Pagar agora'
      }
    });

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    // Adicionar mais detalhes do erro para diagnóstico
    if (error.response) {
      console.error('Resposta de erro:', error.response.data);
    }
    alert('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
  } finally {
    this.isProcessingPayment = false;
  }
}

  },
  mounted() {
    // Carrega os dados iniciais e se inscreve para atualizações do carrinho
    this.unsubscribe = CartService.subscribe((items) => {
      this.cartItems = items;
    });

    // Força o carregamento inicial do carrinho (caso o subscribe não chame imediatamente)
    CartService.loadCartFromStorage();
  },
  beforeUnmount() {
    // Cancela a inscrição para evitar vazamento de memória
    if (this.unsubscribe) this.unsubscribe();
  },
  unmounted() {
    if (this.unsubscribe) this.unsubscribe();
  }
};
</script>


<style scoped>
.cart-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.cart-modal {
  background-color: var(--white);
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.cart {
  display: flex;
  width: 60%;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background: white;
  box-sizing: border-box;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  padding: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.cart-header h2 {
  margin: 0;
  color: var(--primary);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dark);
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.1);
}

.cart-content {
  padding: 20px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 0;
  color: #888;
}

.cart-items {
  margin-bottom: 30px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
}

.item-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.item-price {
  margin: 0;
  color: var(--primary);
  font-weight: bold;
}

.item-quantity {
  display: flex;
  align-items: center;
  margin: 0 20px;
}

.qty-btn {
  background-color: #f0f0f0;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity span {
  margin: 0 10px;
  min-width: 20px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  transition: transform 0.2s;
}

.remove-btn:hover {
  transform: scale(1.1);
}

.cart-summary {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  font-weight: bold;
  font-size: 18px;
  color: var(--primary);
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.continue-shopping {
  background-color: #f0f0f0;
  color: var(--dark);
}

.continue-shopping:hover {
  background-color: #e0e0e0;
}

.checkout {
  background-color: var(--primary);
  color: var(--white);
  flex: 1;
}

.checkout:hover {
  background-color: #14539a;
}

@media (max-width: 576px) {
  .cart-actions {
    flex-direction: column;
  }

  .cart {
    width: 90%;
  }

  .cart-item {
    flex-wrap: wrap;
  }

  .item-quantity {
    margin: 10px 0;
  }
}
</style>