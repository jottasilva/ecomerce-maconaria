<template>
  <div id="app">
    <AppHeader 
      :cartItems="cartItems" 
      @open-cart="isCartOpen = true"
    />
    
    <CartModal 
      :isOpen="isCartOpen" 
      :cartItems="cartItems" 
      @close="isCartOpen = false"
      @update-quantity="updateCartItemQuantity"
      @remove-item="removeCartItem"
      @checkout="checkoutCart"
    />
    
    <div v-if="loading" class="loading-container">
      <p>Carregando produtos...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="btn" @click="fetchData">Tentar novamente</button>
    </div>
    
    <Products 
      v-else
      :products="filteredProducts" 
      :categories="categories" 
      :selectedCategory="selectedCategory"
      @select-category="filterByCategory"
      @add-to-cart="addProductToCart"
    />
    
    <Features/> 
   <Testimonials :testimonials="testimonials"/> 
    <AppFooter/>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import Products from './components/Products.vue';
import CartModal from './components/CartModal.vue';
import ProductService from './services/ProductsService';
import Testimonials from './components/Testimonials.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    Products,
    CartModal,
    Testimonials
  },
  name: 'Testimonials',
    props: {
      testimonials: {
        type: Array,
        required: true
      }
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
      error: null
    }
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'Todos') {
        return this.products;
      }
      return this.products.filter(product => product.categoria.nome === this.selectedCategory);
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Buscar produtos
        const productsData = await ProductService.getProducts();
        this.products = productsData;
        
        // Extrair categorias únicas dos produtos
        // (Caso não tenha um endpoint específico para categorias)
        const uniqueCategories = [...new Set(productsData.map(product => product.categoria.nome))];
        this.categories = ['Todos', ...uniqueCategories];
      } catch (error) {
        this.error = 'Não foi possível carregar os dados. Por favor, tente novamente mais tarde.';
        console.error('Erro ao carregar dados:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async filterByCategory(category) {
      this.selectedCategory = category;
      
      // Se não for a categoria "Todos", buscar produtos específicos
      if (category !== 'Todos') {
        this.loading = true;
        try {
          // Encontrar o slug da categoria selecionada
          const categorySlug = this.getCategorySlug(category);
          if (categorySlug) {
            const productsData = await ProductService.getProductsByCategory(categorySlug);
            this.products = productsData;
          }
        } catch (error) {
          console.error('Erro ao filtrar por categoria:', error);
        } finally {
          this.loading = false;
        }
      } else {
        // Se for "Todos", carregar todos os produtos novamente
        this.fetchData();
      }
    },
    
    // Método auxiliar para encontrar o slug da categoria pelo nome
    getCategorySlug(categoryName) {
      // Você precisará adaptar isso de acordo com a estrutura dos seus dados
      // Este é apenas um exemplo
      const product = this.products.find(p => p.categoria.nome === categoryName);
      return product ? product.categoria.slug : null;
    },
    
    addProductToCart(product) {
      // Verifica se o produto já está no carrinho
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        this.updateCartItemQuantity({
          index: this.cartItems.indexOf(existingItem),
          quantity: existingItem.quantity + 1
        });
      } else {
        this.cartItems.push({
          ...product,
          quantity: 1
        });
      }
    },
    
    updateCartItemQuantity({ index, quantity }) {
      this.cartItems[index].quantity = quantity;
    },
    
    removeCartItem(index) {
      this.cartItems.splice(index, 1);
    },
    
    checkoutCart() {
      // Lógica para finalizar a compra
      // Futuramente você pode adicionar um endpoint de checkout na API
      alert('Compra finalizada com sucesso!');
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
  padding-top: 80px; /* Espaço para o header fixo */
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