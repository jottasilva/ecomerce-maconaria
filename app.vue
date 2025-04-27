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
    <CheckoutSucessModal v-model:isOpen="isCheckoutModalOpen" :transactionParams="checkoutParams" />
    <Testimonials :testimonials="testimonials" />
    <AppFooter :infos="socials" :contact="contact" />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import Products from './components/Products.vue';
import CartModal from './components/CartModal.vue';
import Hero from './components/Hero.vue';
import Features from './components/Features.vue';
import Testimonials from './components/Testimonials.vue';
import AppFooter from './components/AppFooter.vue';
import CheckoutSucessModal from './components/CheckoutSucessModal.vue';
import ProductService from './services/ProductsService';
import CartService from './services/CartService';
import TestmoialsService from './services/TestmonialService';
import ContactService from './services/ContactsService';
import SocialsService from './services/SocialsService';
export default {
  name: 'App',
  components: {
    AppHeader,
    Products,
    CartModal,
    Hero,
    Features,
    Testimonials,
    AppFooter,
    CheckoutSucessModal
  },
  data() {
    return {
      testimonials: [],
      isCartOpen: false,
      selectedCategory: 'Todos',
      cartItems: [],
      categories: ['Todos'],
      products: [],
      socials: [],
      loading: true,
      contact: [],
      error: null,
      cartCount: 0,
      isCheckoutModalOpen: false,
      checkoutParams: {}
    }
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'Todos' || this.selectedCategory === 0) {
        return this.products;
      }
      const filtered = this.products.filter(product => {
        return product.categoria && product.categoria === this.selectedCategory;
      });

      return filtered;
    }
  },
  mounted() {
    if (window.location.href.includes('checkout/success') || 
      window.location.search.includes('collection_id') || 
      window.location.search.includes('payment_id')) {
    this.openSuccessModal();
  }
  },
  created() {
    this.fetchData();
    this.loadCartFromStorage();
    this.unsubscribeCart = CartService.subscribe(this.updateCartCount);
  },
  beforeDestroy() {
    if (this.unsubscribeCart) {
      this.unsubscribeCart(); 
    }
  },

  methods: {
    openSuccessModal() {
      const url = new URL(window.location.href);
      const urlParams = {
        collection_id: url.searchParams.get('collection_id'),
        collection_status: url.searchParams.get('collection_status'),
        payment_id: url.searchParams.get('payment_id'),
        status: url.searchParams.get('status'),
        external_reference: url.searchParams.get('external_reference'),
        payment_type: url.searchParams.get('payment_type'),
        merchant_order_id: url.searchParams.get('merchant_order_id'),
        preference_id: url.searchParams.get('preference_id'),
        site_id: url.searchParams.get('site_id'),
        processing_mode: url.searchParams.get('processing_mode')
      }
      this.checkoutParams = urlParams;
      this.isCheckoutModalOpen = true;
    },
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

        const testimonialsData = await TestmoialsService.getTestmonials();
        this.testimonials = testimonialsData;

        const contactData = await ContactService.getContact();
        this.contact = contactData;

        const socialsData = await SocialsService.getSocials();
        this.socials = socialsData;

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
      CartService.addToCart(product);
      this.cartItems = CartService.getCartItems();
    },

    updateCartItemQuantity({ index, quantity }) {
      const productId = this.cartItems[index].id;
      CartService.updateQuantity(productId, quantity);
      this.cartItems = CartService.getCartItems();
    },

    removeCartItem(index) {
      const productId = this.cartItems[index].id;
      CartService.removeFromCart(productId);
      this.cartItems = CartService.getCartItems();
    },

    checkoutCart() {
      CartService.clearCart();
      this.cartItems = [];
      this.isCartOpen = false;
      if (window.location.href.includes('/checkout/success')) {
        this.openSuccessModal();
        
      }
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