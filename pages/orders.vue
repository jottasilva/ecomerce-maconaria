<template>
  <div class="container">
    <div class="header-container">
      <h1>Lista de Pedidos</h1>
      
      <!-- Botão de logout -->
      <button v-if="isAuthenticated" class="logout-button" @click="handleLogout">
        Sair
      </button>
    </div>

    <div v-if="loading" class="loading">
      Carregando pedidos...
    </div>

    <div v-else-if="error" class="error">
      Erro ao carregar os pedidos: {{ error }}
    </div>

    <OrderDetails v-for="pedido in orders" :key="pedido.id" :order="pedido" @cancel-order="handleCancelOrder"
      @process-order="handleProcessOrder" @ship-order="handleShipOrder" @complete-order="handleCompleteOrder" />
  </div>
  
  <!-- Modal de login -->
  <LoginModal 
    :show="showLoginModal" 
    @close="showLoginModal = false" 
    @login-success="handleLoginSuccess" 
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import OrderDetails from '../components/OrderDetails.vue'
import LoginModal from '~/components/loginModal.vue'
import OrdersServiceList from '~/services/OrdersListService'

const orders = ref([])
const loading = ref(false)
const error = ref(null)
const isAuthenticated = ref(false)
const showLoginModal = ref(false)

// Verificar se o usuário está autenticado
const checkAuthentication = () => {
  const token = localStorage.getItem('access')
  isAuthenticated.value = !!token // Converte para booleano
  
  // Se não estiver autenticado, mostra o modal de login
  if (!isAuthenticated.value) {
    showLoginModal.value = true
  }
}

const handleLoginSuccess = () => {
  showLoginModal.value = false
  isAuthenticated.value = true
  fetchOrders() // Recarrega os pedidos após login bem-sucedido
}

const handleLogout = async () => {
  try {
    await OrdersServiceList.Logout()
    isAuthenticated.value = false
    orders.value = []
    showLoginModal.value = true
  } catch (err) {
    console.error('Erro ao fazer logout:', err)
  }
}

const fetchOrders = async () => {
  loading.value = true
  error.value = null

  // Verifica autenticação antes de buscar pedidos
  if (!isAuthenticated.value) {
    loading.value = false
    return
  }

  try {
    const response = await OrdersServiceList.getOrders()
    orders.value = response
    console.table(response)
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err)
    error.value = 'Não foi possível carregar os pedidos.'
    
    // Verifica se o erro é de autenticação (401)
    if (err.response && err.response.status === 401) {
      showLoginModal.value = true
    }
  } finally {
    loading.value = false
  }
}

const handleCancelOrder = async (orderId) => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }
  
  try {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) {
      return
    }
    loading.value = true
    await OrdersServiceList.cancelOrder(orderId)
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'cancelled'
    }
    alert('Pedido cancelado com sucesso')
  } catch (err) {
    console.error('Erro ao cancelar pedido:', err)
    error.value = 'Não foi possível cancelar o pedido.'
    alert('Erro ao cancelar o pedido')
    
    // Verifica se o erro é de autenticação
    if (err.response && err.response.status === 401) {
      showLoginModal.value = true
    }
  } finally {
    loading.value = false
  }
}

const handleProcessOrder = async (orderId) => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }
  
  try {
    loading.value = true
    await OrdersServiceList.processOrder(orderId)
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'processing'
    }
    alert('Pedido em processamento')
  } catch (err) {
    console.error('Erro ao processar pedido:', err)
    error.value = 'Não foi possível processar o pedido.'
    alert('Erro ao processar o pedido')
    
    if (err.response && err.response.status === 401) {
      showLoginModal.value = true
    }
  } finally {
    loading.value = false
  }
}

const handleShipOrder = async (orderId) => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }
  
  try {
    loading.value = true
    await OrdersServiceList.shipOrder(orderId)
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'shipping'
    }
    alert('Pedido enviado com sucesso')
  } catch (err) {
    console.error('Erro ao enviar pedido:', err)
    error.value = 'Não foi possível enviar o pedido.'
    alert('Erro ao enviar o pedido')
    
    if (err.response && err.response.status === 401) {
      showLoginModal.value = true
    }
  } finally {
    loading.value = false
  }
}

const handleCompleteOrder = async (orderId) => {
  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }
  
  try {
    loading.value = true
    await OrdersServiceList.completeOrder(orderId)
    const orderIndex = orders.value.findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'completed'
    }
    alert('Pedido concluído com sucesso')
  } catch (err) {
    console.error('Erro ao concluir pedido:', err)
    error.value = 'Não foi possível concluir o pedido.'
    alert('Erro ao concluir o pedido')
    
    if (err.response && err.response.status === 401) {
      showLoginModal.value = true
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkAuthentication()
  fetchOrders()
})
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 90vw;
  margin: 0 auto;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  font-size: 1.8rem;
  margin: 0;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.loading {
  padding: 40px 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-size: 1.1rem;
  color: #666;
}

.error {
  padding: 20px;
  text-align: center;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 8px;
  font-size: 1rem;
}
</style>