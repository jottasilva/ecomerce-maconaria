<template>
  <div class="orders-container">
    <div class="orders-header">
      <h2>Pedidos</h2>
      <div class="filters">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Buscar pedidos..."
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-dropdown">
          <select v-model="statusFilter" @change="handleFilterChange">
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="processing">Em Processamento</option>
            <option value="shipping">Em Transporte</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Carregando pedidos...</p>
    </div>
    
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <p>Nenhum pedido encontrado.</p>
    </div>
    
    <div v-else class="orders-list">
      <OrderSummaryExpandable
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        @cancel-order="handleCancelOrder"
        @process-order="handleProcessOrder"
        @ship-order="handleShipOrder"
        @complete-order="handleCompleteOrder"
      />
      
      <div v-if="hasMoreOrders" class="load-more">
        <button class="load-more-btn" @click="loadMoreOrders">
          Carregar mais pedidos
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import OrderSummaryExpandable from './OrderSummaryExpandable.vue';
import OrdersServiceList from './services/OrdersServiceList';

export default {
  name: 'OrderList',
  components: {
    OrderSummaryExpandable
  },
  props: {
    initialOrders: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // Estado
    const orders = ref(props.initialOrders);
    const loading = ref(true);
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const page = ref(1);
    const perPage = ref(10);
    const hasMoreOrders = ref(false);
    
    // Filtragem de pedidos
    const filteredOrders = computed(() => {
      return orders.value.filter(order => {
        // Filtragem por status
        const matchesStatus = 
          statusFilter.value === 'all' || 
          order.status === statusFilter.value;
        
        // Filtragem por busca (nome do cliente ou ID do pedido)
        const searchLower = searchQuery.value.toLowerCase();
        const matchesSearch = 
          searchQuery.value === '' || 
          (order.user && order.user.toLowerCase().includes(searchLower)) ||
          (order.id && order.id.toLowerCase().includes(searchLower));
        
        return matchesStatus && matchesSearch;
      });
    });
    
    // Funções para lidar com as ações nos pedidos
    const handleCancelOrder = async (orderId) => {
      try {
        // Chama a API para cancelar o pedido
        await OrdersServiceList.cancelOrder(orderId);
        // Após processar no backend, atualize o estado local
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'cancelled';
          orders.value = [...orders.value]; // Força a reatividade
        }
      } catch (error) {
        console.error(`Erro ao cancelar pedido ${orderId}:`, error);
        // Aqui você poderia adicionar um feedback de erro para o usuário
      }
    };
    
    const handleProcessOrder = async (orderId) => {
      try {
        await OrdersServiceList.processOrder(orderId);
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'processing';
          orders.value = [...orders.value];
        }
      } catch (error) {
        console.error(`Erro ao processar pedido ${orderId}:`, error);
      }
    };
    
    const handleShipOrder = async (orderId) => {
      try {
        await OrdersServiceList.shipOrder(orderId);
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'shipping';
          orders.value = [...orders.value];
        }
      } catch (error) {
        console.error(`Erro ao enviar pedido ${orderId}:`, error);
      }
    };
    
    const handleCompleteOrder = async (orderId) => {
      try {
        await OrdersServiceList.completeOrder(orderId);
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex].status = 'completed';
          orders.value = [...orders.value];
        }
      } catch (error) {
        console.error(`Erro ao concluir pedido ${orderId}:`, error);
      }
    };
    
    // Funções para filtros e paginação
    const handleSearch = async () => {
      // Reseta paginação quando uma nova busca é feita
      page.value = 1;
      loading.value = true;
      
      try {
        if (searchQuery.value.trim() === '') {
          // Se a busca estiver vazia, carrega todos os pedidos
          const ordersData = await OrdersServiceList.getProducts();
          orders.value = ordersData;
        } else {
          // Caso contrário, faz uma busca específica
          const searchResults = await OrdersServiceList.searchOrders(searchQuery.value);
          orders.value = searchResults;
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const handleFilterChange = async () => {
      // Reseta paginação quando um novo filtro é aplicado
      page.value = 1;
      loading.value = true;
      
      try {
        if (statusFilter.value === 'all') {
          // Se o filtro for "todos", carrega todos os pedidos
          const ordersData = await OrdersServiceList.getProducts();
          orders.value = ordersData;
        } else {
          // Caso contrário, filtra por status
          const filteredOrders = await OrdersServiceList.filterOrdersByStatus(statusFilter.value);
          orders.value = filteredOrders;
        }
      } catch (error) {
        console.error('Erro ao filtrar pedidos:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const loadMoreOrders = async () => {
      loading.value = true;
      page.value++;
      
      try {
        // Na implementação real, você poderia adicionar suporte a paginação na API
        // Por enquanto, vamos desabilitar "carregar mais" após a primeira página
        hasMoreOrders.value = false;
      } catch (error) {
        console.error('Erro ao carregar mais pedidos:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // Carrega dados iniciais
    onMounted(async () => {
      if (props.initialOrders.length === 0) {
        try {
          // Carregando pedidos da API usando o serviço
          const ordersData = await OrdersServiceList.getProducts();
          orders.value = ordersData;
          
          // Verifica se há mais pedidos para carregar
          hasMoreOrders.value = orders.value.length >= perPage.value;
        } catch (error) {
          console.error('Erro ao carregar pedidos:', error);
        } finally {
          loading.value = false;
        }
      } else {
        loading.value = false;
        hasMoreOrders.value = props.initialOrders.length >= perPage.value;
      }
    });
    
    return {
      orders,
      filteredOrders,
      loading,
      searchQuery,
      statusFilter,
      hasMoreOrders,
      handleSearch,
      handleFilterChange,
      loadMoreOrders,
      handleCancelOrder,
      handleProcessOrder,
      handleShipOrder,
      handleCompleteOrder
    };
  }
}
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.orders-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #212529;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  width: 250px;
}

.search-bar input {
  width: 100%;
  padding: 8px 12px;
  padding-right: 30px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
}

.filter-dropdown select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #fff;
  min-width: 150px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  margin-bottom: 16px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more-btn {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .orders-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters {
    width: 100%;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .filter-dropdown select {
    width: 100%;
  }
}
</style>