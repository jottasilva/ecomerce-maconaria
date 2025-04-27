export default {
    /**
     * Salva o endereço no localStorage
     * @param {String} userId - ID do usuário
     * @param {Object} address - Objeto com dados do endereço
     * @returns {Boolean} - Indica se a operação foi bem-sucedida
     */
    saveAddress(userId, address) {
      if (!userId || !this.isAddressValid(address)) {
        return false;
      }
  
      try {
        const storageKey = `userAddress_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(address));
        return true;
      } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        return false;
      }
    },
  
    /**
     * Carrega o endereço do localStorage
     * @param {String} userId - ID do usuário
     * @returns {Object|null} - Objeto com dados do endereço ou null se não encontrado
     */
    loadAddress(userId) {
      if (!userId) return null;
  
      try {
        const storageKey = `userAddress_${userId}`;
        const savedAddress = localStorage.getItem(storageKey);
        
        if (!savedAddress) return null;
        
        return JSON.parse(savedAddress);
      } catch (error) {
        console.error('Erro ao carregar endereço:', error);
        return null;
      }
    },
  
    /**
     * Remove o endereço do localStorage
     * @param {String} userId - ID do usuário
     * @returns {Boolean} - Indica se a operação foi bem-sucedida
     */
    removeAddress(userId) {
      if (!userId) return false;
      
      try {
        const storageKey = `userAddress_${userId}`;
        localStorage.removeItem(storageKey);
        return true;
      } catch (error) {
        console.error('Erro ao remover endereço:', error);
        return false;
      }
    },
  
    /**
     * Calcula o valor do frete com base no CEP e subtotal
     * @param {String} cep - CEP do endereço
     * @param {Number} subtotal - Valor do subtotal do pedido
     * @returns {Number} - Valor calculado do frete
     */
    calculateShipping(cep, subtotal) {
      if (!cep) return 0;
      
      if (subtotal > 200) {
        return 0; // Frete grátis para compras acima de R$ 200
      }
      
      const cepPrefix = parseInt(cep.substring(0, 3));
      
      if (cepPrefix >= 10 && cepPrefix <= 99) {
        return 12.90;
      } else if (cepPrefix >= 100 && cepPrefix <= 199) {
        return 18.50;
      } else if (cepPrefix >= 200 && cepPrefix <= 299) {
        return 25.90;
      } else {
        return 19.90;
      }
    },
  
    /**
     * Verifica se o endereço é válido (tem os campos obrigatórios)
     * @param {Object} address - Objeto com dados do endereço
     * @returns {Boolean} - Indica se o endereço é válido
     */
    isAddressValid(address) {
      if (!address) return false;
      
      return !!(
        address.cep && 
        address.estado && 
        address.cidade && 
        address.bairro && 
        address.rua && 
        address.numero
      );
    },
  
    /**
     * Formata o CEP para o padrão brasileiro (00000-000)
     * @param {String} cep - CEP a ser formatado
     * @returns {String} - CEP formatado
     */
    formatCEP(cep) {
      if (!cep) return '';
      
      return cep
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
    },
  
    /**
     * Cria um endereço padrão vazio
     * @returns {Object} - Objeto com estrutura de endereço vazio
     */
    getEmptyAddress() {
      return {
        cep: '',
        estado: '',
        cidade: '',
        bairro: '',
        rua: '',
        numero: '',
        complemento: ''
      };
    },
  
    /**
     * Retorna um texto formatado com o endereço completo
     * @param {Object} address - Objeto com dados do endereço
     * @returns {String} - Texto formatado com endereço completo
     */
    getFormattedAddress(address) {
      if (!this.isAddressValid(address)) {
        return '';
      }
      
      let formatted = `${address.rua}, ${address.numero}`;
      
      if (address.complemento) {
        formatted += `, ${address.complemento}`;
      }
      
      formatted += ` - ${address.bairro}, ${address.cidade}/${address.estado} - CEP ${address.cep}`;
      
      return formatted;
    }
  };