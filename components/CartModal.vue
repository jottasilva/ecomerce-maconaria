<template>
  <div class="cart-modal-overlay" v-if="isOpen" @click.self="close">
    <div class="cart-modal">
      <div class="cart-header">
        <h2>Seu Carrinho</h2>
        <button class="close-btn" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="cart-content">
        <div v-if="cartItems.length === 0" class="empty-cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <p class="item-price">{{ formatPrice(calculateItemTotal(item)) }}</p>
              </div>
              <div class="item-quantity">
                <button class="qty-btn" @click="decreaseQuantity(index)" :disabled="item.quantidade <= 1">-</button>
                <span>{{ item.quantidade }}</span>
                <button class="qty-btn" @click="increaseQuantity(index)" :disabled="item.quantidade >= item.estoque">+</button>
              </div>
              <button class="remove-btn" @click="removeItem(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <button class="btn checkout" @click="checkout">Finalizar Compra</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductService from '@/services/ProductsService';

export default {
  name: 'CartModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    cartItems: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      localCart: [], // Cópia local do carrinho
    };
  },
  created() {
    this.loadCartFromLocalStorage();
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + this.calculateItemTotal(item);
      }, 0);
    },
    frete() {
      return this.subtotal > 200 ? 'Grátis' : 'R$ 15,00';
    },
    total() {
      const freteValue = this.frete === 'Grátis' ? 0 : 15;
      return this.subtotal + freteValue;
    }
  },
  methods: {
    calculateItemTotal(item) {
      // Converte o preço (string) para número e multiplica pela quantidade
      const price = parseFloat(item.preco);
      return price * item.quantidade;
    },
    close() {
      this.$emit('close');
    },
    async increaseQuantity(index) {
      if (this.cartItems[index].quantidade < this.cartItems[index].estoque) {
        // Verificar estoque atualizado
        try {
          const productId = this.cartItems[index].id;
          let currentStock = this.cartItems[index].estoque;
          
          // Tentar obter dados atualizados do produto
          try {
            const productData = await this.getProductFromCacheOrAPI(productId);
            if (productData) {
              currentStock = productData.estoque;
            }
          } catch (error) {
            console.log('Usando dados de estoque em cache');
          }
          
          if (this.cartItems[index].quantidade < currentStock) {
            const updatedCart = [...this.cartItems];
            updatedCart[index] = {
              ...updatedCart[index],
              quantidade: updatedCart[index].quantidade + 1,
              estoque: currentStock // Atualizar o estoque com o valor mais recente
            };
            this.$emit('update-cart', updatedCart);
            this.saveCartToLocalStorage(updatedCart);
          } else {
            alert('Estoque insuficiente!');
          }
        } catch (error) {
          console.error('Erro ao verificar estoque:', error);
          // Continuar com dados em cache
          const updatedCart = [...this.cartItems];
          updatedCart[index] = {
            ...updatedCart[index],
            quantidade: updatedCart[index].quantidade + 1
          };
          this.$emit('update-cart', updatedCart);
          this.saveCartToLocalStorage(updatedCart);
        }
      }
    },
    decreaseQuantity(index) {
      if (this.cartItems[index].quantidade > 1) {
        const updatedCart = [...this.cartItems];
        updatedCart[index] = {
          ...updatedCart[index],
          quantidade: updatedCart[index].quantidade - 1
        };
        this.$emit('update-cart', updatedCart);
        this.saveCartToLocalStorage(updatedCart);
      }
    },
    removeItem(index) {
      const updatedCart = this.cartItems.filter((_, i) => i !== index);
      this.$emit('update-cart', updatedCart);
      this.saveCartToLocalStorage(updatedCart);
    },
    async checkout() {
      try {
        // Verificar estoque atualizado para todos os itens antes de finalizar
        const outOfStockItems = [];
        
        for (const item of this.cartItems) {
          try {
            const productData = await this.getProductFromCacheOrAPI(item.id);
            if (productData && item.quantidade > productData.estoque) {
              outOfStockItems.push({
                nome: item.nome,
                quantidade: item.quantidade,
                estoqueDisponivel: productData.estoque
              });
            }
          } catch (error) {
            console.log(`Usando dados em cache para ${item.nome}`);
          }
        }
        
        if (outOfStockItems.length > 0) {
          let message = 'Não foi possível finalizar a compra devido a indisponibilidade de estoque:\n\n';
          outOfStockItems.forEach(item => {
            message += `- ${item.nome}: Solicitado: ${item.quantidade}, Disponível: ${item.estoqueDisponivel}\n`;
          });
          alert(message);
          return;
        }
        
        alert('Compra finalizada com sucesso!');
        const emptyCart = [];
        this.$emit('update-cart', emptyCart);
        this.saveCartToLocalStorage(emptyCart);
        this.close();
      } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        alert('Erro ao finalizar compra. Por favor, tente novamente.');
      }
    },
    formatPrice(value) {
      if (value === undefined || value === null || isNaN(Number(value))) {
        return 'R$ 0,00';
      }
      
      const numValue = Number(value);
      const fixedValue = numValue.toFixed(2);
      const formattedValue = fixedValue.replace('.', ',');
      
      // Adiciona separador de milhares
      const parts = formattedValue.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      return `R$ ${parts.join(',')}`;
    },
    saveCartToLocalStorage(cart) {
      localStorage.setItem('shoppingCart', JSON.stringify(cart));
    },
    loadCartFromLocalStorage() {
      try {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Verificar e atualizar os dados do carrinho com informações mais recentes
          this.updateCartWithLatestData(parsedCart);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    },
    async updateCartWithLatestData(cartItems) {
      try {
        const updatedCart = [...cartItems];
        let hasUpdates = false;
        
        // Verificar se temos dados mais atualizados para cada produto
        for (let i = 0; i < updatedCart.length; i++) {
          const item = updatedCart[i];
          try {
            const productData = await this.getProductFromCacheOrAPI(item.id);
            if (productData) {
              // Atualizar informações do produto, mantendo a quantidade
              updatedCart[i] = {
                ...productData,
                quantidade: item.quantidade,
                // Garantir que não ultrapassamos o estoque disponível
                quantidade: Math.min(item.quantidade, productData.estoque)
              };
              hasUpdates = true;
            }
          } catch (error) {
            console.log(`Mantendo dados em cache para o produto ${item.nome}`);
          }
        }
        
        if (hasUpdates) {
          this.$emit('update-cart', updatedCart);
          this.saveCartToLocalStorage(updatedCart);
        } else {
          this.$emit('update-cart', cartItems);
        }
      } catch (error) {
        console.error('Erro ao atualizar carrinho com dados mais recentes:', error);
        this.$emit('update-cart', cartItems);
      }
    },
    async getProductFromCacheOrAPI(productId) {
      try {
        // Tenta obter do localStorage primeiro (implementado no ProductService)
        const cachedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const cachedProduct = cachedProducts.find(p => p.id === productId);
        
        if (cachedProduct) {
          return cachedProduct;
        }
        
        // Se não encontrar no cache, buscar da API
        return await ProductService.getProductById(productId);
      } catch (error) {
        console.error(`Erro ao buscar produto ${productId}:`, error);
        throw error;
      }
    }
  }
}
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
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
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
  
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-quantity {
    margin: 10px 0;
  }
}
</style>