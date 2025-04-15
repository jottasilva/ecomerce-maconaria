// src/services/CartService.js
class CartService {
    static STORAGE_KEY = 'shoppingCart';
  
    // Obter carrinho do localStorage
    static getCart() {
      try {
        const cartData = localStorage.getItem(this.STORAGE_KEY);
        return cartData ? JSON.parse(cartData) : [];
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
        return [];
      }
    }
  
    // Salvar carrinho no localStorage
    static saveCart(cart) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Erro ao salvar carrinho no localStorage:', error);
      }
    }
  
    // Adicionar item ao carrinho
    static addItem(product, quantity = 1) {
      const cart = this.getCart();
      
      // Verifica se o produto já está no carrinho
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Atualiza a quantidade se o produto já estiver no carrinho
        cart[existingItemIndex].quantidade += quantity;
        
        // Limita a quantidade ao estoque disponível
        if (cart[existingItemIndex].quantidade > cart[existingItemIndex].estoque) {
          cart[existingItemIndex].quantidade = cart[existingItemIndex].estoque;
        }
      } else {
        // Adiciona novo item ao carrinho
        cart.push({
          ...product,
          quantidade: quantity
        });
      }
      
      this.saveCart(cart);
      return cart;
    }
  
    // Remover item do carrinho
    static removeItem(index) {
      const cart = this.getCart();
      if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        this.saveCart(cart);
      }
      return cart;
    }
  
    // Atualizar quantidade de um item
    static updateQuantity(index, quantity) {
      const cart = this.getCart();
      
      if (index >= 0 && index < cart.length) {
        // Assegura que a quantidade esteja dentro dos limites válidos
        const newQuantity = Math.max(1, Math.min(quantity, cart[index].estoque));
        cart[index].quantidade = newQuantity;
        this.saveCart(cart);
      }
      
      return cart;
    }
  
    // Limpar carrinho
    static clearCart() {
      this.saveCart([]);
      return [];
    }
  
    // Calcular subtotal
    static getSubtotal() {
      const cart = this.getCart();
      return cart.reduce((total, item) => {
        return total + (parseFloat(item.preco) * item.quantidade);
      }, 0);
    }
  
    // Calcular frete
    static getShipping() {
      const subtotal = this.getSubtotal();
      return subtotal > 200 ? 0 : 15;
    }
  
    // Calcular total
    static getTotal() {
      return this.getSubtotal() + this.getShipping();
    }
  }
  
  export default CartService;