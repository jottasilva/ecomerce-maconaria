<template>
  <div class="order-card" :class="{ 'expanded': isExpanded }">
    <div class="order-summary" @click="toggleExpand">
      <div class="order-basic-info">
        <div class="customer-name">{{ order.user }}</div>
        <div class="order-id">{{ shortenUUID(order.transaction_id) }}</div>
      </div>
      <div class="order-date-price">
        <div class="order-date">{{ formatDate(order.created_at) }}</div>
        <div class="order-total">R$ {{ formatPrice(order.total) }}</div>
      </div>
      <div class="status-badge" :class="`status-${order.status}`">
        {{ formatStatus(order.status) }}
      </div>
      <div class="expand-icon">
        {{ isExpanded ? '▲' : '▼' }}
      </div>
    </div>

    <div v-if="isExpanded" class="order-details">
      <div class="order-sections">
        <div class="order-section-col">
          <div class="order-section">
            <h3>Informações do Cliente</h3>
            <div class="section-content">
              <p><strong>Nome:</strong> {{ order.user }}</p>
              <p><strong>Email:</strong> {{ order.user_email }}</p>
            </div>
          </div>
          
          <div class="order-section">
            <h3>Endereço de Entrega</h3>
            <div class="section-content">
              <p><strong>Endereço:</strong> {{ order.rua }}, {{ order.numero }}</p>
              <p v-if="order.complemento && order.complemento !== 'null'"><strong>Complemento:</strong> {{ order.complemento }}</p>
              <p><strong>Bairro:</strong> {{ order.bairro }}</p>
              <p><strong>Cidade/UF:</strong> {{ order.cidade }}/{{ order.estado }}</p>
              <p><strong>CEP:</strong> {{ order.cep }}</p>
            </div>
          </div>
          
          <div class="order-section">
            <h3>Informações de Pagamento</h3>
            <div class="section-content">
              <p><strong>ID do Pagamento:</strong> {{ order.payment_id }}</p>
              <p><strong>ID da Transação:</strong> {{ order.transaction_id }}</p>
            </div>
          </div>
        </div>
        
        <div class="order-section-col">
          <div class="order-section items-section">
            <h3>Itens do Pedido</h3>
            <div class="section-content">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Preço</th>
                    <th>Qtd</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.items" :key="item.id">
                    <td class="product-info">
                      <div class="product-name">{{ item.product_name }}</div>
                    </td>
                    <td>R$ {{ formatPrice(item.price) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>R$ {{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="order-section summary-section">
            <h3>Resumo do Pedido</h3>
            <div class="section-content order-summary">
              <div class="summary-row">
                <div>Subtotal: </div>
                <div> R$ {{ formatPrice(order.subtotal) }}</div>
              </div>
              <div class="summary-row">
                <div>Frete:</div>
                <div> R$ {{ formatPrice(order.shipping_cost) }}</div>
              </div>
              <div class="summary-row total">
                <div>Total:</div>
                <div>  R$ {{ formatPrice(order.total) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-actions">
        <button class="btn btn-secondary" @click="printOrder">
          <span class="btn-icon">🖨️</span> Imprimir
        </button>
        
        <div class="actions-right" v-if="showActions">
          <button 
            v-if="canCancel" 
            class="btn btn-danger" 
            @click="cancelOrder"
          >
            Cancelar Pedido
          </button>
          
          <button 
            v-if="canProcess" 
            class="btn btn-primary" 
            @click="processOrder"
          >
            Processar Pedido
          </button>
          
          <button 
            v-if="canShip" 
            class="btn btn-warning" 
            @click="shipOrder"
          >
            Enviar Pedido
          </button>
          
          <button 
            v-if="canComplete" 
            class="btn btn-success" 
            @click="completeOrder"
          >
            Marcar como Concluído
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'OrderDetails',
  props: {
    order: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const isExpanded = ref(false);
    
    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
    };

    const canCancel = computed(() => {
      return ['pending', 'processing'].includes(props.order.status);
    });
    
    const canProcess = computed(() => {
      return props.order.status === 'pending';
    });
    
    const canShip = computed(() => {
      return props.order.status === 'processing';
    });
    
    const canComplete = computed(() => {
      return props.order.status === 'shipped';
    });

    const cancelOrder = () => {
      emit('cancel-order', props.order.transaction_id);
    };
    
    const processOrder = () => {
      emit('process-order', props.order.transaction_id);
    };
    
    const shipOrder = () => {
      emit('ship-order', props.order.transaction_id);
    };
    
    const completeOrder = () => {
      emit('complete-order', props.order.transaction_id);
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (e) {
        return dateString || '-';
      }
    };
    
    const formatPrice = (price) => {
      if (price === undefined || price === null) return '0,00';
      return Number(price).toFixed(2).replace('.', ',');
    };
    
    const formatStatus = (status) => {
      if (!status) return 'Desconhecido';
      const statusMap = {
        'processing': 'Em Processamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado',
        'pending': 'Pendente',
        'shipped': 'Em Transporte'
      };
      return statusMap[status] || status;
    };
    
    const printOrder = () => {
      window.print();
    };
    
    const shortenUUID = (uuid) => {
      if (!uuid) return '';
      if (uuid.includes('-')) {
        return uuid.split('-')[0];
      }
      return uuid.substring(0, 8);
    };
    
    return {
      isExpanded,
      toggleExpand,
      formatDate,
      formatPrice,
      formatStatus,
      printOrder,
      canCancel,
      canProcess,
      canShip,
      canComplete,
      shortenUUID,
      // Exportando as funções de ação
      cancelOrder,
      processOrder,
      shipOrder,
      completeOrder
    };
  },
  emits: ['cancel-order', 'process-order', 'ship-order', 'complete-order']
}
</script>

<style scoped>
.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-summary {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.order-summary:hover {
  background-color: #e9ecef;
}

.order-basic-info {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.order-id {
  font-size: 0.85rem;
  color: #666;
  font-family: monospace;
}

.order-date-price {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.order-date {
  font-size: 0.85rem;
  color: #666;
}

.order-total {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  flex: 1;
  margin: 0 16px;
  max-width: 200px;
  text-align: center;
}

.expand-icon {
  font-size: 0.9rem;
  color: #666;
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.order-details {
  padding: 0;
  overflow: hidden;
  background-color: #fff;
}

/* Status colors */
.status-processing {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-pending {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-shipped {
  background-color: #cce5ff;
  color: #004085;
}

/* Order details section */
.order-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.order-section-col {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-section {
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;

}

.order-section h3 {
  margin: 0;
  padding: 15px;
  font-size: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.section-content {
  padding: 15px;
}

.section-content p {
  margin: 8px 0;
  line-height: 1.5;
}

.items-section {
  height: 100%;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.items-table th {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
}

.order-summary .section-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.summary-row.total {
  margin-top:1px;
  padding:22px 0;
  font-weight: 600;
  font-size: 1.1rem;
}

.order-actions {
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

@media print {
  .order-summary {
    display: none;
  }
  
  .order-card {
    box-shadow: none;
    page-break-inside: avoid;
  }
  
  .order-actions {
    display: none;
  }
}

@media (max-width: 768px) {
  .order-summary {
    flex-wrap: wrap;
  }
  
  .order-basic-info,
  .order-date-price {
    flex: 1 0 100%;
    margin-bottom: 8px;
  }
  
  .status-badge {
    flex: 0 0 auto;
    margin: 8px 0;
  }
  
  .items-table {
    font-size: 0.9rem;
  }
  
  .items-table thead {
    display: none;
  }
  
  .items-table tbody tr {
    display: block;
    border-bottom: 1px solid #dee2e6;
    padding: 8px 0;
  }
  
  .items-table td {
    display: flex;
    justify-content: space-between;
    border: none;
    padding: 4px 0;
  }
  
  .items-table td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 10px;
  }
  
  .product-info {
    flex-direction: column;
    width: 100%;
  }
  
  .items-table td:nth-child(1)::before {
    content: "Produto:";
  }
  
  .items-table td:nth-child(2)::before {
    content: "Preço:";
  }
  
  .items-table td:nth-child(3)::before {
    content: "Quantidade:";
  }
  
  .items-table td:nth-child(4)::before {
    content: "Total:";
  }
  
  .order-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .actions-right {
    width: 100%;
    flex-direction: column;
  }
}
</style>