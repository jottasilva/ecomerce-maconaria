<template>
  <section class="products" id="produtos">
    <div class="container">
      <h2 class="section-title">Produtos em Destaque</h2>
      <div class="categories">
        <button 
          v-for="category in categories" 
          :key="category"
          class="category-btn" 
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>
      <div class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card"
        >
          <img :src="product.imagem" :alt="product.nome" class="product-img">
          <div class="product-details">
            <h3 class="product-title">{{ product.nome }}</h3>
            <p class="product-price">R$ {{ product.preco}}</p>
            <button 
              class="btn add-to-cart"
              :class="{ added: product.added }"
              @click="addToCart(product)"
            >
              {{ product.added ? 'Adicionado!' : 'Adicionar ao Carrinho' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Products',
  props: {
    products: {
      type: Array,
      required: true
    },
    categories: {
      type: Array,
      required: true
    },
    selectedCategory: {
      type: String,
      required: true
    }
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'Todos') {
        return this.products;
      }
      return this.products.filter(product => product.category === this.selectedCategory);
    }
  },
  methods: {
    selectCategory(category) {
      this.$emit('select-category', category);
    },
    addToCart(product) {
      this.$emit('add-to-cart', product);
      
      // Visual feedback
      product.added = true;
      setTimeout(() => {
        product.added = false;
      }, 1500);
    }
  }
}
</script>

<style scoped>
.products {
  padding: 80px 0;
  background-color: var(--light);
}

.categories {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  padding: 10px 20px;
  background-color: var(--white);
  border: 1px solid var(--primary);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover, .category-btn.active {
  background-color: var(--primary);
  color: var(--white);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.product-card {
  background-color: var(--white);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-10px);
}

.product-img {
  height: 200px;
  width: 100%;
  object-fit: cover;
}

.product-details {
  padding: 20px;
}

.product-title {
  margin-bottom: 10px;
  font-size: 18px;
}

.product-price {
  color: var(--primary);
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
}

.add-to-cart {
  width: 100%;
  text-align: center;
}

.add-to-cart.added {
  background-color: #4CAF50;
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>