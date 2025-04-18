import axios from 'axios';

export class Checkout {
  constructor(context) {
    this.context = context;
    this.cartItems = [];
    this.isProcessingPayment = false;
    this.showMercadoPagoButton = false;
  }

  async processPayment() {
    try {
      this.isProcessingPayment = true;
      console.log('Iniciando checkout...');

      // Verificar se há itens no carrinho
      if (this.cartItems.length === 0) {
        alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
        this.isProcessingPayment = false;
        return;
      }

      // Emit checkout event if needed
      if (this.$emit) {
        this.$emit('checkout');
      }

      // Verificar se os itens têm valores corretos
      console.log('Verificando itens do carrinho:', this.cartItems);
      if (!window.MercadoPago) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://sdk.mercadopago.com/js/v2";
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN;
      const PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

      if (!this.cartItems || this.cartItems.length === 0) {
        // Assuming CartService is defined elsewhere
        if (typeof CartService !== 'undefined') {
          await CartService.loadCartFromStorage();
        } else {
          throw new Error('CartService is not defined');
        }
      }

      const items = this.cartItems.map(item => ({
        title: item.nome || 'Produto',
        description: item.nome || 'Descrição do produto',
        quantity: parseInt(item.quantity || 1),
        currency_id: "BRL",
        unit_price: Number(parseFloat(item.preco || 0).toFixed(2))
      }));

      console.log('Items para enviar:', items);

      // Adicione um item mínimo se o array estiver vazio (para testes)
      if (items.length === 0) {
        items.push({
          title: "Produto teste",
          description: "Produto para teste",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 10.00
        });
      }

      const requestData = {
        items: items,
        back_urls: {
          success: `${window.location.origin}/checkout/success`,
          failure: `${window.location.origin}/checkout/failure`,
          pending: `${window.location.origin}/checkout/pending`
        },
        auto_return: "approved",
        payer: {
          email: "test_user@testuser.com"
        }
      };

      console.log('Dados para enviar:', JSON.stringify(requestData));

      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ACCESS_TOKEN}`
          }
        }
      );

      const preferenceData = response.data;
      console.log('Preferência criada:', preferenceData);

      const mp = new window.MercadoPago(PUBLIC_KEY, {
        locale: 'pt-BR',
        advancedFraudPrevention: false
        
      });

      this.showMercadoPagoButton = true;
      
      if (this.$nextTick) {
        await this.$nextTick(); 
      } else {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      mp.checkout({
        preference: {
          id: preferenceData.id
        },
        render: {
          container: '#mp_payment_button',
          label: 'Pagar agora',
          type: 'redirect'
        },
        callbacks: {
          onError: (error) => console.error('Erro no checkout:', error),
          onReady: () => console.log('Checkout pronto')
        }
      });

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      if (error.response) {
        console.error('Resposta de erro:', error.response.data);
      }
      alert('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
    } finally {
      this.isProcessingPayment = false;
    }
  }
}