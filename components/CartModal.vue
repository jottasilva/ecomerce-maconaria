<template>
  <div class="cart-modal-overlay" v-if="isOpen" @click.self="close">
    <div class="cart">
      <div class="cart-modal">
        <div class="cart-header">
          <section>
            <h2>Seu Carrinho</h2>
            <GoogleLoginButton v-if="user" :initial-user="user" @user-logged-in="onUserLoggedIn"
              @user-logged-out="onUserLoggedOut" @login-error="onLoginError" />
          </section>
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
                <div v-if="!showMercadoPagoButton" class="item-quantity">
                  <button class="qty-btn" @click="decreaseQuantity(item.id)" :disabled="item.quantity <= 1">-</button>
                  <span>{{ item.quantity }}</span>
                  <button class="qty-btn" @click="increaseQuantity(item.id)"
                    :disabled="item.quantity >= item.estoque">+</button>
                </div>
                <button v-if="!showMercadoPagoButton" class="remove-btn" @click="removeItem(index)">
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
            <shipping-address-component v-if="user" ref="shippingAddress" :userId="user ? user.id : null"
              :subtotal="subtotal" @shipping-calculated="onShippingCalculated" />
            <div class="cart-actions">
              <button class="btn continue-shopping" @click="close">Continuar Comprando</button>

              <div v-if="!user" class="auth-button-container">
                <GoogleLoginButton :initial-user="user" @user-logged-in="onUserLoggedIn"
                  @user-logged-out="onUserLoggedOut" @login-error="onLoginError" />
              </div>

                
                    <button v-if="user && !showMercadoPagoButton" class="btn checkout" @click="checkout" :disabled="isProcessingPayment">
                      <span v-if="isProcessingPayment">Processando...</span>
                      <span v-else>Finalizar Compra</span>
                    </button>
 
              <div v-if="showMercadoPagoButton" id="mp_payment_button"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CartService from '~/services/CartService';
import { Checkout } from '~/services/payment_checkout';
import GoogleLoginButton from '~/components/GoogleLoginButton.vue';
import ShippingAddressComponent from './ShippingAddressComponent.vue';
import AddressService from '~/services/AddressService';
export default {
  name: 'CartModal',
  components: {
    GoogleLoginButton,
    ShippingAddressComponent
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      user: null,
      cartItems: [],
      unsubscribe: null,
      showMercadoPagoButton: false,
      isProcessingPayment: false,
      shippingData: {
        cost: 0,
        address: null,
        complete: false
      }
    };
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (parseFloat(item.preco) * item.quantity);
      }, 0);
    },
    frete() {
      if (this.shippingData && this.shippingData.cost !== undefined) {
        return this.shippingData.cost === 0 ? 'Grátis' : this.formatPrice(this.shippingData.cost);
      }
      return this.subtotal > 200 ? 'Grátis' : this.formatPrice(15);
    },
    total() {
      const shippingCost = this.shippingData && this.shippingData.cost !== undefined
        ? this.shippingData.cost
        : (this.subtotal > 200 ? 0 : 15);

      return this.subtotal + shippingCost;
    }
  },
  methods: {

    onUserLoggedIn(userData) {
      this.user = userData;
    },
    onUserLoggedOut() {
      this.user = null;
      console.log('Usuário deslogado no CartModal');
    },
    onLoginError(error) {
      console.error('Erro de login no CartModal:', error);
    },
    onShippingCalculated(data) {
      this.shippingData = data;
    },
    close() {
      this.showMercadoPagoButton = false;
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
    saveAddressToLocalStorage() {
      if (this.$refs.shippingAddress && this.user) {
        const addressData = this.$refs.shippingAddress.getAddressData();
        if (!addressData || !addressData.isComplete) {
          alert('Por favor, preencha todos os campos obrigatórios do endereço de entrega.');
          return;
        }
        if (addressData && addressData.isComplete) {
          const storageKey = `userAddress_${this.user.id}`;
          localStorage.setItem(storageKey, JSON.stringify(addressData.address));
          console.log('Endereço salvo no localStorage para o usuário:', this.user.id);
          return addressData;
        } else {
          console.log(addressData)
          console.warn('Endereço incompleto, não foi salvo no localStorage');
          return null;
        }
      }
      return null;
    },
    async checkout() {
      try {
        if (!this.$refs.shippingAddress || !this.user) {
          alert('Por favor, faça login para continuar.');
          return;
        }
        const addressData = this.$refs.shippingAddress.getAddressData();

        if (!addressData || !addressData.isComplete) {
          alert('Por favor, preencha todos os campos obrigatórios do endereço de entrega.');
          return;
        }

        const addressSaved = AddressService.saveAddress(this.user.id, addressData.address);
        if (!addressSaved) {
          console.warn('Não foi possível salvar o endereço.');
        }

        this.isProcessingPayment = true;
        if (!this.showMercadoPagoButton) {
          this.showMercadoPagoButton = true;
          await this.$nextTick();
        }
        await this.$nextTick();

        const mpButtonContainer = document.getElementById('mp_payment_button');
        if (!mpButtonContainer) {
          console.error('Elemento mp_payment_button não encontrado no DOM');
          alert('Erro ao inicializar o botão de pagamento. Tente novamente.');
          this.isProcessingPayment = false;
          return;
        }

        const checkoutProcessor = new Checkout(this);
        checkoutProcessor.cartItems = this.cartItems;
        checkoutProcessor.isProcessingPayment = this.isProcessingPayment;
        checkoutProcessor.shippingData = addressData;

        checkoutProcessor.shippingData = {
          address: addressData.address,
          cost: addressData.shippingCost,
          complete: addressData.isComplete
        };
        checkoutProcessor.$emit = this.$emit.bind(this);
        checkoutProcessor.$nextTick = this.$nextTick.bind(this);
        await checkoutProcessor.processPayment();

      } catch (error) {
        console.error('Erro ao processar checkout:', error);
        alert('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
      } finally {
        this.isProcessingPayment = false;
      }
    }
  },

  mounted() {
    this.unsubscribe = CartService.subscribe((items) => {
      this.cartItems = items;
    });
    CartService.loadCartFromStorage();
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  },
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
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
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

.auth-button-container {
  flex: 1;
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