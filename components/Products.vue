<template>
  <ProductModalDetails 
    :isOpen="isDetailModal" 
    :product="selectedProduct" 
    @close="isDetailModal = false" 
    @add-to-cart="handleAddToCart" 
  />
  
  <section class="products" id="produtos">
    <div class="container">
      <h2 class="section-title">Produtos em Destaque</h2>
      <div class="categories">
        <button v-for="category in categories" :key="category.id || category" class="category-btn"
          :class="{ active: selectedCategoryName === (category.nome || category) }" @click="selectCategory(category.id, category.nome)">
          {{ category.nome }}
        </button>
      </div>
      <div v-if="isLoading" class="loading">Carregando produtos...</div>
      <div v-else-if="filteredProducts.length === 0" class="no-products">
        <p>Não há produtos disponíveis nesta categoria.</p>
        <button class="btn return-btn" @click="selectCategory(0, 'Todos')">
          Voltar para todos os produtos
        </button>
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <img @click="productDetail(product)" :src="product.imagem" :alt="product.nome" class="product-img">
          <div class="product-details">
            <h3 class="product-title">{{ truncate(product.nome) }}</h3>
            <p class="product-price">{{ formatPrice(product.preco) }}</p>
            
            <button class="btn add-to-cart" :class="{ added: product.added }" @click="addToCart(product)">
              {{ product.added ? 'Adicionado!' : 'Adicionar ao Carrinho' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import ProductService from '~/services/ProductsService';
import CartService from '~/services/CartService';
import ProductModalDetails from '~/components/ProductModalDetails';

export default {
  name: 'Products',
  components: {
    ProductModalDetails
  },
  props: {
    products: {
      type: Array,
      default: () => [],
      required: true
    },
    produtctDetail: {
      type: Array,
      default: () => {}
    },
    
  },
  data() {
    return {
      categories: [],
      selectedCategory: 0, // Armazena o ID da categoria selecionada
      selectedCategoryName: 'Todos', // Armazena o NOME da categoria selecionada
      isLoading: true,
      localProducts: [],
      cartCount: 0,
      isDetailModal: false,
      selectedProduct: null
    };
  },
  computed: {
    filteredProducts() {
      return this.products && this.products.length ? this.products : this.localProducts || [];
    }
  },
  watch: {
    products: {
      immediate: true,
      handler(newProducts) {
        if (newProducts && newProducts.length) {
          this.localProducts = [...newProducts];
          if (newProducts.length === 0 && this.selectedCategoryName !== 'Todos') {
            this.$emit('empty-category', this.selectedCategoryName);
          }
        } else {
          this.localProducts = [];
        }
      }
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price);
    },
    truncate(text, maxLength = 50) {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    },
    // Método atualizado para lidar com ID e nome da categoria
    selectCategory(categoryId, categoryName) {
      // Se o categoryName não for fornecido, tente encontrá-lo pelo ID
      if (!categoryName) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (category) {
          categoryName = category.nome;
        } else {
          // Fallback para casos onde a categoria não é encontrada
          categoryName = String(categoryId);
        }
      }
      
      // Atualiza tanto o ID quanto o nome da categoria selecionada
      this.selectedCategory = categoryId;
      this.selectedCategoryName = categoryName;
      
      // Emite o evento com o ID da categoria
      this.$emit('select-category', categoryId);
    },
    productDetail(product) {
      this.selectedProduct = product;
      this.isDetailModal = true;
    },
    addToCart(product) {
      const cartItem = CartService.getCartItems().find(item => item.id === product.id);
      const currentQuantity = cartItem ? cartItem.quantity : 0;

      if (currentQuantity >= product.estoque) {
        alert('Estoque insuficiente para adicionar mais unidades deste produto.');
        return;
      }

      CartService.addToCart(product);
      product.added = true;
      setTimeout(() => {
        product.added = false;
      }, 1500);
      this.$emit('update-cart-count', CartService.getCartCount());
    },
    handleAddToCart({ product, quantity }) {
      const cartItem = CartService.getCartItems().find(item => item.id === product.id);
      const currentQuantity = cartItem ? cartItem.quantity : 0;
      
      if (currentQuantity + quantity > product.estoque) {
        alert('Estoque insuficiente para adicionar a quantidade selecionada deste produto.');
        return;
      }
      for (let i = 0; i < quantity; i++) {
        CartService.addToCart(product);
      }
      if (product.id) {
        const productInGrid = this.filteredProducts.find(p => p.id === product.id);
        if (productInGrid) {
          productInGrid.added = true;
          setTimeout(() => {
            productInGrid.added = false;
          }, 1500);
        }
      }
      this.$emit('update-cart-count', CartService.getCartCount());
      alert(`${quantity} unidade(s) de ${product.nome} adicionada(s) ao carrinho!`);
    },
    async loadCategories() {
      try {
        this.isLoading = true;
        const categoriesData = await ProductService.getCategories();
        if (!categoriesData.find(cat => (cat.nome || cat) === 'Todos')) {
          this.categories = [{ id: 0, nome: 'Todos' }, ...categoriesData];
        } else {
          this.categories = categoriesData;
        }
        // Inicializa com "Todos" selecionado
        this.selectedCategory = 0;
        this.selectedCategoryName = 'Todos';
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async loadProductsIfNeeded() {
      if ((!this.products || !this.products.length) && !this.localProducts.length) {
        try {
          this.isLoading = true;
          const productsData = await ProductService.getProducts();
          this.localProducts = productsData;
        } catch (error) {
          console.error('Erro ao carregar produtos:', error);
        } finally {
          this.isLoading = false;
        }
      }
    }
  },
  created() {
    this.loadCategories();
    this.loadProductsIfNeeded();
    this.cartItems = CartService.getCartItems();
    this.cartCount = CartService.getCartCount();
  }
};
</script>

<style scoped>
/* O estilo permanece igual ao original */
.products {
  padding: 80px 0;
  background-color: var(--light);
}

.categories {
  display: flex;
  justify-content: center;
  margin-bottom: 60px;
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

.category-btn:hover,
.category-btn.active {
  background-color: var(--primary);
  color: var(--white);
}

.loading,
.no-products {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--gray);
}

.products-grid {
  display: grid;
  cursor: pointer;
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
  margin-bottom: 5px;
  font-size: 18px;
  color: #777777;
}

.product-price {
  color: var(--primary);
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
}

.return-btn {
  margin: 50px 0;
}

.add-to-cart {
  width: 100%;
  font-weight: bold;
  color: black;
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