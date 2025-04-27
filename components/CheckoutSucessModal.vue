<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal">
            <div class="check-icon">
                <!-- Ícone SVG de check -->
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="green" viewBox="0 0 24 24">
                    <path d="M20.285 2.859l-11.319 11.319-5.285-5.285-3.681 3.681 8.966 8.966 15-15z" />
                </svg>
            </div>

            <h2 class="modal-title">Pagamento Aprovado!</h2>
            <p class="modal-message">Seu pedido foi processado com sucesso.</p>

            <div class="modal-details">
                <h3>Detalhes da transação:</h3>
                <ul>
                    <li v-for="(value, key) in params" :key="key">
                        <strong>{{ key }}:</strong> {{ value }}
                    </li>
                </ul>
            </div>
            <div class="success">
                <h4>Você receberá informações sobre seu pedido em breve.</h4>
            </div>
            <button class="close-button" @click="closeModal">Fechar</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue'
import  OrderStatus  from '~/services/OrderStatusService'
const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    },
    transactionParams: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:isOpen'])

const params = ref({})
const transactionDate = ref('')

const processParams = () => {
    const url = new URL(window.location.href)
    const search = url.searchParams

    const now = new Date()
    const formattedDate = now.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    })
    transactionDate.value = formattedDate

    if (props.transactionParams && Object.keys(props.transactionParams).length > 0) {
        params.value = {
            "Método de Pagamento": props.transactionParams.payment_type || search.get('payment_type') || 'Cartão de Crédito',
            "ID de Pagamento": props.transactionParams.collection_id || search.get('collection_id') || '123456789',
            "Status": props.transactionParams.status || search.get('status') || 'approved',
            "Data e Hora": formattedDate
        }
    } else {
   
        params.value = {
            "Método de Pagamento": search.get('payment_type') || 'Cartão de Crédito',
            "ID de Pagamento": search.get('collection_id') || '123456789',
            "Status": search.get('status') || 'approved',
            "Referência Externa": search.get('external_reference') || '-',
            "Data e Hora": formattedDate
        }
    }
}

onMounted(() => {
    processParams();
    OrderStatus.update('tx_1nl40zfu0vg')
      .then(response => {
        console.log("Order status updated successfully:", response);
      })
      .catch(error => {
        console.error("Failed to update order status:", error);
      });
})

watch(() => props.transactionParams, (newParams) => {
    if (newParams && Object.keys(newParams).length > 0) {
        processParams()
    }
}, { deep: true })

const closeModal = () => {
    const url = new URL(window.location.href);
    window.history.replaceState({}, document.title, url.origin);
    emit('update:isOpen', false)
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.success {
    padding: 10px 0;
}

.modal {
    background-color: white;
    padding: 24px 100px;
    border-radius: 10px;
    max-width: 700px;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.check-icon {
    margin-bottom: 16px;
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
}

.modal-message {
    margin-bottom: 16px;
}

.modal-details {
    text-align: left;
    margin-bottom: 24px;
}

.modal-details h3 {
    margin-bottom: 12px;
}

.modal-details ul {
    padding-left: 0;
    list-style: none;
}

.modal-details li {
    margin-bottom: 8px;
}

.close-button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.close-button:hover {
    background-color: #2980b9;
}
</style>