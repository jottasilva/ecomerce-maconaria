<template>
    <div class="order-summary-card" :class="{ 'expanded': isExpanded }">
      <!-- Resumo compacto do pedido (sempre visível) -->
      <div class="order-summary-header" @click="toggleExpand">
        <div class="header-left">
          <div class="order-id-badge">
            {{ shortenUUID(order.id) }}
          </div>
          <div class="customer-info">
            <div class="customer-name">{{ order.user }}</div>
            <div class="order-date">{{ formatDate(order.created_at) }}</div>
          </div>
        </div>
        
        <div class="header-right">
          <div class="status-badge" :class="`status-${order.status}`">
            {{ formatStatus(order.status) }}
          </div>
          <div class="order-total">R$ {{ formatPrice(order.total) }}</div>
          <button class="expand-btn" :aria-label="isExpanded ? 'Recolher' : 'Expandir'">
            <span class="expand-icon">{{ isExpanded ? '▲' : '▼' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Conteúdo expandido (visível apenas quando expandido) -->
      <div v-if="isExpanded" class="expanded-content">
        <OrderDetails 
          :order="order" 
          :showActions="showActions"
          @cancel-order="$emit('cancel-order', $event)"
          @process-order="$emit('process-order', $event)"
          @ship-order="$emit('ship-order', $event)"
          @complete-order="$emit('complete-order', $event)"
        />
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import OrderDetails from './OrderDetails.vue';
  import { computed } from 'vue';
  
  export default {
    name: 'OrderSummaryExpandable',
    components: {
      OrderDetails
    },
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
      
      // Função para alternar entre expandido e recolhido
      const toggleExpand = () => {
        isExpanded.value = !isExpanded.value;
      };
      
      // Reutilizando as mesmas funções que estão no OrderDetails para
      // garantir consistência na formatação
      
      // Formatação de data
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
      
      // Formatação de preço
      const formatPrice = (price) => {
        if (price === undefined || price === null) return '0,00';
        // Garante que funcione tanto se price for string quanto número
        return Number(price).toFixed(2).replace('.', ',');
      };
      
      // Formatação de status
      const formatStatus = (status) => {
        if (!status) return 'Desconhecido';
        const statusMap = {
          'processing': 'Em Processamento',
          'completed': 'Concluído',
          'cancelled': 'Cancelado',
          'pending': 'Pendente',
          'shipping': 'Em Transporte'
        };
        return statusMap[status] || status;
      };
      
      // Função para encurtar o UUID para exibição
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
        shortenUUID
      };
    },
    emits: ['cancel-order', 'process-order', 'ship-order', 'complete-order']
  }
  </script>
  
  <style scoped>
  .order-summary-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .order-summary-card.expanded {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .order-summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .order-summary-header:hover {
    background-color: #f8f9fa;
  }
  
  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .order-id-badge {
    background-color: #e9ecef;
    color: #495057;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: monospace;
  }
  
  .customer-info {
    display: flex;
    flex-direction: column;
  }
  
  .customer-name {
    font-weight: 600;
    font-size: 1rem;
    color: #212529;
  }
  
  .order-date {
    font-size: 0.85rem;
    color: #6c757d;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
  }
  
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
  
  .status-shipping {
    background-color: #cce5ff;
    color: #004085;
  }
  
  .order-total {
    font-weight: 600;
    font-size: 1rem;
    color: #212529;
  }
  
  .expand-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .expand-icon {
    font-size: 0.85rem;
    transition: transform 0.2s ease;
  }
  
  .expanded-content {
    border-top: 1px solid #e9ecef;
    animation: fadeIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .order-summary-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
  </style>