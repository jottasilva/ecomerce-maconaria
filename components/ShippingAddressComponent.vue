<template>
    <div class="address-section">
      <h3>Endereço de Entrega</h3>
      <div class="address-form">
        <div class="form-row">
          <div class="form-group">
            <label for="cep">CEP</label>
            <input type="text" id="cep" v-model="localAddress.cep" @blur="calculateShipping" placeholder="00000-000">
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <select id="estado" v-model="localAddress.estado" @change="calculateShipping">
              <option value="">Selecione</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade" v-model="localAddress.cidade" placeholder="Sua cidade">
          </div>
          <div class="form-group">
            <label for="bairro">Bairro</label>
            <input type="text" id="bairro" v-model="localAddress.bairro" placeholder="Seu bairro">
          </div>
        </div>
        <div class="form-group">
          <label for="rua">Rua</label>
          <input type="text" id="rua" v-model="localAddress.rua" placeholder="Nome da rua">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="numero">Número</label>
            <input type="text" id="numero" v-model="localAddress.numero" placeholder="Nº">
          </div>
          <div class="form-group">
            <label for="complemento">Complemento</label>
            <input type="text" id="complemento" v-model="localAddress.complemento" placeholder="Apto, Bloco, etc.">
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ShippingAddressComponent',
    props: {
      userId: {
        type: String,
        default: null
      },
      subtotal: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        localAddress: {
          cep: '',
          estado: '',
          cidade: '',
          bairro: '',
          rua: '',
          numero: '',
          complemento: ''
        },
        shippingCost: 0,
        shippingCalculated: false
      };
    },
    computed: {
      
      isAddressComplete() {
        return this.localAddress.cep && 
               this.localAddress.estado && 
               this.localAddress.cidade && 
               this.localAddress.bairro && 
               this.localAddress.rua && 
               this.localAddress.numero;
      }
    },
    methods: {
      async calculateShipping() {
        if (!this.localAddress.cep) return;
        try {
          this.$emit('shipping-calculation-started');
          await new Promise(resolve => setTimeout(resolve, 500));
          const cepPrefix = parseInt(this.localAddress.cep.substring(0, 3));

          if (this.subtotal > 200) {
            this.shippingCost = 0;
          } 

          else if (cepPrefix >= 10 && cepPrefix <= 99) {
            this.shippingCost = 0.10;
          } 
          else if (cepPrefix >= 100 && cepPrefix <= 199) {
            this.shippingCost = 18.50;
          } 
          else if (cepPrefix >= 200 && cepPrefix <= 299) {
            this.shippingCost = 25.90;
          } 
          else {
            this.shippingCost = 0.10;
          }
          
          this.shippingCalculated = true;
          this.saveAddress();
          
          this.$emit('shipping-calculated', {
            cost: this.shippingCost,
            address: this.localAddress,
            complete: this.isAddressComplete
          });
        } catch (error) {
          console.error('Erro ao calcular frete:', error);
          this.$emit('shipping-calculation-error', error);
        }
      },
      saveAddress() {
        if (this.userId && this.isAddressComplete) {
          const storageKey = `userAddress_${this.userId}`;
          localStorage.setItem(storageKey, JSON.stringify(this.localAddress));
        }
      },

      loadSavedAddress() {
        if (!this.userId) return;
        const storageKey = `userAddress_${this.userId}`;
        const savedAddress = localStorage.getItem(storageKey);
        if (savedAddress) {
          try {
            this.localAddress = JSON.parse(savedAddress);
            this.calculateShipping();
          } catch (error) {
            console.error('Erro ao carregar endereço salvo:', error);
          }
        }
      },
      resetAddress() {
        this.localAddress = {
          cep: '',
          estado: '',
          cidade: '',
          bairro: '',
          rua: '',
          numero: '',
          complemento: ''
        };
        this.shippingCost = 0;
        this.shippingCalculated = false;
        
        this.$emit('address-reset');
      },
      getAddressData() {
        return {
          address: this.localAddress,
          shippingCost: this.shippingCost,
          isComplete: this.isAddressComplete
        };
      }
    },
    watch: {
      'localAddress.cep': function(newVal) {
        if (newVal) {
          this.localAddress.cep = newVal.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
        }
      },
     
      userId: {
        immediate: true,
        handler(newUserId) {
          if (newUserId) {
            this.loadSavedAddress();
          } else {
            this.resetAddress();
          }
        }
      },
      subtotal: {
        handler() {
          if (this.shippingCalculated) {
            this.calculateShipping();
          }
        }
      }
    },
  
  };
  </script>
  
  <style scoped>
  .address-section {
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f8f8;
    border-radius: 8px;
  }
  
  .address-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--primary);
  }
  
  .address-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .form-row {
    display: flex;
    gap: 15px;
  }
  
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .form-group label {
    font-size: 14px;
    margin-bottom: 5px;
    color: #555;
  }
  
  .form-group input,
  .form-group select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
      gap: 12px;
    }
  }
  </style>