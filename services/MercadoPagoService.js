// services/MercadoPagoService.js

let scriptLoaded = false;

const MercadoPagoService = {
  loadScript() {
    return new Promise((resolve, reject) => {
      if (scriptLoaded || typeof window.MercadoPago !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      
      script.onload = () => {
        scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Falha ao carregar o SDK do Mercado Pago'));
      };
      
      document.body.appendChild(script);
    });
  },
  
  async createPreference(checkoutData) {
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: checkoutData.items,
          payer: checkoutData.payer,
          shipments: checkoutData.shipments,
          back_urls: {
            success: `${window.location.origin}/payment/success`,
            failure: `${window.location.origin}/payment/failure`,
            pending: `${window.location.origin}/payment/pending`
          },
          auto_return: "approved",
          external_reference: checkoutData.userId || Date.now().toString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar preferência: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Falha ao criar preferência:', error);
      throw error;
    }
  },
  
  async initializeCheckout(options) {
    try {
      await this.loadScript();
      
      const { container, items, user, address, shipping } = options;
      
      const checkoutData = {
        items: items.map(item => ({
          id: item.id,
          title: item.nome,
          quantity: item.quantity,
          unit_price: parseFloat(item.preco),
          picture_url: item.imagem
        })),
        payer: {
          name: user.displayName || user.name || '',
          email: user.email,
          address: {
            zip_code: address.cep,
            street_name: address.rua,
            street_number: address.numero
          }
        },
        shipments: {
          cost: shipping.cost,
          mode: "not_specified",
        },
        userId: user.id
      };
      
      const preference = await this.createPreference(checkoutData);
      
      if (!preference || !preference.id) {
        throw new Error('Resposta da API inválida ao criar preferência');
      }
      
      container.innerHTML = '';
      
      const mp = new window.MercadoPago('SUA_CHAVE_PUBLICA', {
        locale: 'pt-BR'
      });
      
      mp.checkout({
        preference: {
          id: preference.id
        },
        render: {
          container: `#${container.id}`,
          label: 'Pagar com Mercado Pago',
        },
        theme: {
          elementsColor: '#1967D2',
          headerColor: '#1967D2'
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar checkout:', error);
      throw error;
    }
  }
};

export default MercadoPagoService;