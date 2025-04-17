// src/services/CartService.js

class CartService {
  static CART_KEY = 'shopping-cart';
  static listeners = [];
  
  /**
   * Subscribe to cart changes
   * @param {Function} callback - Function to call when cart changes
   * @returns {Function} Unsubscribe function
   */
  static subscribe(callback) {
    this.listeners.push(callback);
    
    // Immediately notify with current state
    callback(this.getCartItems());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Notify all listeners of cart changes
   * @param {Array} cartItems - Updated cart items
   */
  static notifyListeners(cartItems) {
    this.listeners.forEach(listener => listener(cartItems));
  }
  
  /**
   * Check if localStorage is available
   * @returns {Boolean} True if localStorage is available
   */
  static isLocalStorageAvailable() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieve cart items from localStorage
   * @returns {Array} Array of cart items or empty array if none found
   */
  static getCartItems() {
    try {
      if (!this.isLocalStorageAvailable()) return [];
      
      const cartItems = localStorage.getItem(this.CART_KEY);
      return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
      console.error('Erro ao recuperar itens do carrinho:', error);
      return [];
    }
  }

  /**
   * Save cart items to localStorage and notify listeners
   * @param {Array} items - Array of cart items
   */
  static saveCartItems(items) {
    try {
      if (!this.isLocalStorageAvailable()) return false;
      
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
      this.notifyListeners(items);
      return true;
    } catch (error) {
      console.error('Erro ao salvar itens no carrinho:', error);
      return false;
    }
  }

  /**
   * Add a product to the cart
   * @param {Object} product - Product to add to cart
   * @param {Number} quantity - Quantity to add (default: 1)
   * @returns {Array} Updated cart items
   */
  static addToCart(product, quantity = 1) {
    const cartItems = this.getCartItems();
    const existingItem = cartItems.find(item => item.id === product.id);
  
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        ...product,
        quantity
      });
    }
    
    this.saveCartItems(cartItems);
    return cartItems;
  }
  
  static loadCartFromStorage() {
    try {
      const savedCart = this.getCartItems();
      this.notifyListeners(savedCart);
    } catch (error) {
      console.error('Erro ao carregar carrinho do CartService:', error);
      this.notifyListeners([]);
    }
  }
  
  /**
   * Remove a product from the cart
   * @param {String|Number} productId - ID of product to remove
   * @returns {Array} Updated cart items
   */
  static removeFromCart(productId) {
    let cartItems = this.getCartItems();
    cartItems = cartItems.filter(item => item.id !== productId);
    this.saveCartItems(cartItems);
    return cartItems;
  }

  /**
   * Update quantity of a product in the cart
   * @param {String|Number} productId - ID of product to update
   * @param {Number} quantity - New quantity
   * @returns {Array} Updated cart items or null if product not found
   */
  static updateQuantity(productId, quantity) {
    const cartItems = this.getCartItems();
    const itemToUpdate = cartItems.find(item => item.id === productId);
    
    if (!itemToUpdate) return null;
    
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }
    
    itemToUpdate.quantity = quantity;
    this.saveCartItems(cartItems);
    return cartItems;
  }
  
  // Add these for increment/decrement functionality
  static incrementQuantity(productId) {
    const cartItems = this.getCartItems();
    const itemToUpdate = cartItems.find(item => item.id === productId);
    
    if (!itemToUpdate) return null;
    
    itemToUpdate.quantity += 1;
    this.saveCartItems(cartItems);
    return cartItems;
  }
  
  static decrementQuantity(productId) {
    const cartItems = this.getCartItems();
    const itemToUpdate = cartItems.find(item => item.id === productId);
    
    if (!itemToUpdate) return null;
    
    if (itemToUpdate.quantity > 1) {
      itemToUpdate.quantity -= 1;
      this.saveCartItems(cartItems);
      return cartItems;
    } else {
      // Se quantidade for 1 ou menos, remova o item
      return this.removeFromCart(productId);
    }
  }

  /**
   * Clear all items from the cart
   * @returns {Array} Empty array
   */
  static clearCart() {
    this.saveCartItems([]);
    return [];
  }

  /**
   * Calculate the total price of items in the cart
   * @returns {Number} Total price
   */
  static getCartTotal() {
    const cartItems = this.getCartItems();
    return cartItems.reduce((total, item) => {
      return total + (Number(item.preco) * item.quantity);
    }, 0);
  }

  /**
   * Get the total number of items in the cart
   * @returns {Number} Total count of all items (including quantities)
   */
  static getCartCount() {
    const cartItems = this.getCartItems();
    return cartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);
  }
  
  /**
   * Get the number of unique products in the cart
   * @returns {Number} Number of unique products
   */
  static getUniqueItemsCount() {
    return this.getCartItems().length;
  }
}

export default CartService;