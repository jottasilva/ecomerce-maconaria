<template>
  <div id="app">
    <AppHeader :cartItems="cartItems" @open-cart="isCartOpen = true" />
    <Hero />
    <Features />
    <CartModal :isOpen="isCartOpen" :cartItems="cartItems" @close="isCartOpen = false"
      @update-quantity="updateCartItemQuantity" @remove-item="removeCartItem" @checkout="checkoutCart" />
    <div v-if="loading" class="loading-container">
      <p>Carregando produtos...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="btn" @click="fetchData">Tentar novamente</button>
    </div>

    <Products v-else :products="filteredProducts" :categories="categories" :selectedCategory="selectedCategory"
      @select-category="filterByCategory" @add-to-cart="addProductToCart" />

    <Testimonials :testimonials="testimonials" />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import Products from './components/Products.vue';
import CartModal from './components/CartModal.vue';
import Features from './components/Features.vue';
import Testimonials from './components/Testimonials.vue';
import AppFooter from './components/AppFooter.vue';
import ProductService from './services/ProductsService';
import CartService from './services/CartService';


export default {
  name: 'App',
  components: {
    AppHeader,
    Products,
    CartModal,
    Features,
    Testimonials,
    AppFooter
  },
  data() {
    return {
      testimonials: [
        {
          text: "Produtos de excelente qualidade e acabamento impecável. O avental que adquiri superou minhas expectativas e tem recebido muitos elogios na Loja.",
          author: "Irmão Carlos M., São Paulo"
        },
        {
          text: "Entrega rápida e produto conforme descrito. Estou muito satisfeito com minha compra e certamente voltarei a comprar nesta loja.",
          author: "Irmão Roberto L., Rio de Janeiro"
        },
        {
          text: "Atendimento excepcional e produtos de primeira linha. Recomendo a todos os Irmãos que buscam qualidade e respeito à tradição.",
          author: "Irmão Eduardo S., Belo Horizonte"
        }
      ],
      isCartOpen: false,
      selectedCategory: 'Todos',
      cartItems: [],
      categories: ['Todos'],
      products: [],
      loading: true,
      error: null,
      cartCount: 0,
    }
  },
  computed: {
    filteredProducts() {
      // Se a categoria for "Todos" ou 0, retorne todos os produtos
      if (this.selectedCategory === 'Todos' || this.selectedCategory === 0) {
        return this.products;
      }
      const filtered = this.products.filter(product => {
        return product.categoria && product.categoria === this.selectedCategory;
      });

      return filtered;
    }
  },
  created() {
    this.fetchData();
    this.loadCartFromStorage();
    this.unsubscribeCart = CartService.subscribe(this.updateCartCount);
  },
  beforeDestroy() {
  if (this.unsubscribeCart) {
    this.unsubscribeCart(); // Remove o listener
  }
},

  methods: {
    updateCartCount(cartItems) {
      this.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      this.cartItems = cartItems;
    },
    async fetchData() {
      this.loading = true;
      this.error = null;

      try {
        const productsData = await ProductService.getProducts();
        this.products = productsData;
        const uniqueCategories = [...new Set(productsData.map(product => product.categoria))];
        this.categories = ['Todos', ...uniqueCategories];
      } catch (error) {
        this.error = 'Não foi possível carregar os dados. Por favor, tente novamente mais tarde.';
        console.error('Erro ao carregar dados:', error);
      } finally {
        this.loading = false;
      }
    },

    loadCartFromStorage() {
      this.cartItems = CartService.getCartItems();
    },

    filterByCategory(category) {
      this.selectedCategory = typeof category === 'string' ? category : Number(category);
    },

    getCategoryId(categoryName) {
      const product = this.products.find(p => p.categoria === categoryName);
      return product ? product.categoria : null;
    },

    addProductToCart(product) {
      // Usando o CartService para adicionar ao carrinho
      CartService.addToCart(product);

      // Atualizando o estado local do carrinho
      this.cartItems = CartService.getCartItems();
    },

    updateCartItemQuantity({ index, quantity }) {
      const productId = this.cartItems[index].id;

      // Usando o CartService para atualizar a quantidade
      CartService.updateQuantity(productId, quantity);

      // Atualizando o estado local do carrinho
      this.cartItems = CartService.getCartItems();
    },

    removeCartItem(index) {
      const productId = this.cartItems[index].id;

      // Usando o CartService para remover o item
      CartService.removeFromCart(productId);

      // Atualizando o estado local do carrinho
      this.cartItems = CartService.getCartItems();
    },

    checkoutCart() {
      alert('Compra finalizada com sucesso!');

      // Limpar o carrinho usando o CartService
      CartService.clearCart();

      // Atualizar o estado local
      this.cartItems = [];
      this.isCartOpen = false;
    }
  }
}
</script>

<style>
:root {
  --primary: #14213d;
  --secondary: #fca311;
  --dark: #333333;
  --light: #f5f5f5;
  --white: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  color: var(--dark);
  line-height: 1.6;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 32px;
  color: var(--primary);
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--secondary);
  color: var(--dark);
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  border: none;
}

.btn:hover {
  background-color: #e69100;
}

#app {
  padding-top: 80px;
  /* Espaço para o header fixo */
}

.loading-container,
.error-container {
  text-align: center;
  padding: 40px;
  margin: 20px auto;
  max-width: 600px;
}

.error-container {
  color: #e74c3c;
}

.error-container .btn {
  margin-top: 20px;
}
</style>