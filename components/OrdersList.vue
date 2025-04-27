<template>
    <div class="order-details">
      <div class="header">
        <h2>Detalhes do Pedido</h2>
        <div 
          class="status-badge" 
          :class="{
            'status-processing': order.status === 'processing',
            'status-completed': order.status === 'completed',
            'status-cancelled': order.status === 'cancelled',
            'status-pending': order.status === 'pending'
          }"
        >
          {{ formatStatus(order.status) }}
        </div>
      </div>
  
      <div class="section">
        <h3>Informações do Cliente</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Cliente:</span>
            <span class="value">{{ order.user }}</span>
          </div>
          <div class="info-item">
            <span class="label">E-mail:</span>
            <span class="value">{{ order.user_email }}</span>
          </div>
        </div>
      </div>
  
      <div class="section">
        <h3>Informações do Pedido</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID do Pedido:</span>
            <span class="value">{{ order.id }}</span>
          </div>
          <div class="info-item">
            <span class="label">Data de Criação:</span>
            <span class="value">{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Última Atualização:</span>
            <span class="value">{{ formatDate(order.updated_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">ID do Pagamento:</span>
            <span class="value">{{ order.payment_id }}</span>
          </div>
          <div class="info-item">
            <span class="label">ID da Transação:</span>
            <span class="value">{{ order.transaction_id }}</span>
          </div>
        </div>
      </div>
  
      <div class="section">
        <h3>Endereço de Entrega</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">CEP:</span>
            <span class="value">{{ order.cep }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado:</span>
            <span class="value">{{ order.estado }}</span>
          </div>
          <div class="info-item">
            <span class="label">Cidade:</span>
            <span class="value">{{ order.cidade }}</span>
          </div>
          <div class="info-item">
            <span class="label">Bairro:</span>
            <span class="value">{{ order.bairro }}</span>
          </div>
          <div class="info-item">
            <span class="label">Rua:</span>
            <span class="value">{{ order.rua }}</span>
          </div>
          <div class="info-item">
            <span class="label">Número:</span>
            <span class="value">{{ order.numero }}</span>
          </div>
          <div class="info-item">
            <span class="label">Complemento:</span>
            <span class="value">{{ order.complemento || '-' }}</span>
          </div>
        </div>
      </div>
  
      <div class="section">
        <h3>Itens do Pedido</h3>
        <div class="items-list">
          <div class="items-header">
            <div class="item-col id">ID</div>
            <div class="item-col product">Produto</div>
            <div class="item-col price">Preço</div>
            <div class="item-col quantity">Qtd</div>
            <div class="item-col subtotal">Subtotal</div>
          </div>
          
          <div v-for="item in order.items" :key="item.id" class="item-row">
            <div class="item-col id">{{ item.product_id }}</div>
            <div class="item-col product">{{ item.product_name }}</div>
            <div class="item-col price">R$ {{ formatPrice(item.price) }}</div>
            <div class="item-col quantity">{{ item.quantity }}</div>
            <div class="item-col subtotal">R$ {{ formatPrice(Number(item.price) * item.quantity) }}</div>
          </div>
        </div>
      </div>
  
      <div class="section totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>R$ {{ formatPrice(order.subtotal) }}</span>
        </div>
        <div class="total-row">
          <span>Frete:</span>
          <span>R$ {{ formatPrice(order.shipping_cost) }}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>R$ {{ formatPrice(order.total) }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OrderDetails',
    props: {
      order: {
        type: Object,
        required: true
      }
    },
    methods: {
      formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      },
      formatPrice(price) {
        return Number(price).toFixed(2).replace('.', ',');
      },
      formatStatus(status) {
        const statusMap = {
          'processing': 'Em Processamento',
          'completed': 'Concluído',
          'cancelled': 'Cancelado',
          'pending': 'Pendente'
        };
        return statusMap[status] || status;
      }
    }
  }
  </script>
  
  <style scoped>
  .order-details {
    font-family: Arial, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 16px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  .status-processing {
    background-color: #ffeecc;
    color: #ff9900;
  }
  
  .status-completed {
    background-color: #d4edda;
    color: #28a745;
  }
  
  .status-cancelled {
    background-color: #f8d7da;
    color: #dc3545;
  }
  
  .status-pending {
    background-color: #e2e3e5;
    color: #6c757d;
  }
  
  .section {
    margin-bottom: 25px;
  }
  
  .section h3 {
    font-size: 1.1rem;
    margin-bottom: 15px;
    color: #555;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .info-item {
    display: flex;
    flex-direction: column;
  }
  
  .label {
    font-size: 0.8rem;
    color: #777;
    margin-bottom: 4px;
  }
  
  .value {
    font-weight: 500;
    color: #333;
  }
  
  /* Items list styling (replacing table) */
  .items-list {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .items-header {
    display: flex;
    background-color: #f8f9fa;
    font-weight: 600;
    color: #555;
    padding: 12px 10px;
    border-bottom: 1px solid #eee;
  }
  
  .item-row {
    display: flex;
    padding: 12px 10px;
    border-bottom: 1px solid #eee;
  }
  
  .item-row:last-child {
    border-bottom: none;
  }
  
  .item-col {
    padding: 0 5px;
  }
  
  .item-col.id {
    width: 10%;
  }
  
  .item-col.product {
    width: 40%;
  }
  
  .item-col.price {
    width: 15%;
  }
  
  .item-col.quantity {
    width: 15%;
    text-align: center;
  }
  
  .item-col.subtotal {
    width: 20%;
    text-align: right;
  }
  
  .totals {
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid #eee;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 5px 0;
  }
  
  .grand-total {
    font-weight: bold;
    font-size: 1.1rem;
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px solid #eee;
  }
  
  /* Responsividade para dispositivos móveis */
  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
    
    .items-header {
      display: none; /* Esconde o cabeçalho em dispositivos móveis */
    }
    
    .item-row {
      flex-direction: column;
      padding: 15px 10px;
    }
    
    .item-col {
      width: 100% !important;
      padding: 5px 0;
      display: flex;
      justify-content: space-between;
    }
    
    .item-col::before {
      content: attr(data-label);
      font-weight: 600;
      color: #555;
    }
    
    .item-col.id::before {
      content: "ID:";
    }
    
    .item-col.product::before {
      content: "Produto:";
    }
    
    .item-col.price::before {
      content: "Preço:";
    }
    
    .item-col.quantity::before {
      content: "Quantidade:";
    }
    
    .item-col.subtotal::before {
      content: "Subtotal:";
    }
  }
  </style>