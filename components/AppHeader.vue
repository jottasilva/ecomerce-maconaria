<template>
  <header>
    <div class="container header-content">
      <div class="logo">
        <img src="../public/assets/logo.svg" alt="">
        <span>BODE CHIQUE</span>
      </div>
      <nav :class="{ active: isNavActive }">
        <ul>
          <li><a href="#produtos" @click="toggleNav">Produtos</a></li>
          <li><a href="#sobre" @click="toggleNav">Sobre Nós</a></li>
          <li><a href="#contato" @click="toggleNav">Contato</a></li>
        </ul>
      </nav>
      <div class="cart-icon" @click="openCartModal">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <ClientOnly>
          <span class="cart-count">{{ cartCount }}</span>
        </ClientOnly>
      </div>
      <div class="mobile-menu" @click="toggleNav">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    cartItems: {
      type: Array,
      required: true
    }
  },

  computed: {
    cartCount() {
      return (this.cartItems || []).length;
    }
  },
  data() {
    return {
      isNavActive: false
    }
  },
  methods: {
    toggleNav() {
      this.isNavActive = !this.isNavActive;
    },
    openCartModal() {
      this.$emit('open-cart');
    }
  }
}
</script>

<style scoped>
header {
  background-color: var(--primary);
  color: var(--white);
  padding: 20px 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
}

.logo img {
  width:60px;
  height:60px;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
}

nav a {
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

nav a:hover {
  color: var(--secondary);
}

.cart-icon {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

.cart-icon:hover {
  transform: scale(1.1);
}

.cart-count {
  position: absolute;
  top: -10px;
  right: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  min-height: 22px;
  background-color: var(--secondary);
  color: black;
  font-size: 12px;
  border-radius: 50%;
  font-weight: bold;
}

.mobile-menu {
  display: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .mobile-menu {
    display: block;
  }

  nav {
    display: none;
  }

  nav.active {
    display: block;
    position: absolute;
    top: 80px;
    left: 0;
    width: 100%;
    background-color: var(--primary);
    padding: 20px;
  }

  nav.active ul {
    flex-direction: column;
    align-items: center;
  }
}
</style>

<!-- Componente do Modal do Carrinho -->
