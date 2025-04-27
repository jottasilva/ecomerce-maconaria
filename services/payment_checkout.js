import axios from "axios";
import { sendCheckoutData } from "./CheckoutApi";
import CartService from "./CartService";
export class Checkout {
  constructor(context) {
    this.context = context;
    this.cartItems = [];
    this.isProcessingPayment = false;
    this.shippingData = null;
    this.user = context?.user || null;
  }

  async processPayment() {
    try {
      this.isProcessingPayment = true;
      console.log("Iniciando checkout...");

      if (this.cartItems.length === 0) {
        alert(
          "Seu carrinho está vazio. Adicione produtos antes de finalizar a compra."
        );
        return false;
      }

      if (
        !this.shippingData ||
        !this.shippingData.address ||
        !this.shippingData.complete
      ) {
        alert("Por favor, preencha corretamente o endereço de entrega.");
        return false;
      }

      if (!this.user || !this.user.email) {
        alert("Por favor, faça login para continuar.");
        return false;
      }

      if (this.$emit) {
        this.$emit("checkout-started");
      }

      // Já não precisamos do script do MercadoPago para botão, apenas para criar a preferência
      // Vamos carregar o script apenas se for necessário para a API
      try {
        if (!window.MercadoPago && this._needMercadoPagoSDK()) {
          await this._loadMercadoPagoScript();
        }
      } catch (error) {
        console.error("Erro ao carregar script do Mercado Pago:", error);
        // Continuamos porque podemos não precisar do script para API
      }

      const items = this._formatCartItems();
      const formattedAddress = this._formatAddress();

      if (!items.length || !formattedAddress) {
        alert("Erro ao processar os dados para pagamento.");
        return false;
      }

      // Salva dados do checkout no localStorage para acessar após retorno do Mercado Pago
      this._saveCheckoutDataToLocalStorage();

      const requestData = {
        items: items,
        back_urls: {
          success: `${window.location.origin}/checkout/success`,
          failure: `${window.location.origin}/checkout/failure`,
          pending: `${window.location.origin}/checkout/pending`,
        },
        auto_return: "approved",
        payer: {
          email: this.user.email || "test_user@testuser.com",
          address: formattedAddress,
        },
        shipments: {
          cost: this.shippingData.cost || 0,
          receiver_address: formattedAddress,
        },
        // Adiciona um identificador externo para rastrear o pedido
        external_reference: `order_${Date.now()}_${this.user.email}`,
      };

      const checkoutApiData = this._prepareCheckoutApiData();

      try {
        const apiResponse = await sendCheckoutData(checkoutApiData);
       
        if (apiResponse && apiResponse.orderId) {
          localStorage.setItem("last_order_id", apiResponse.orderId);
        }
      } catch (error) {
        console.error("Erro ao enviar dados para nossa API:", error);
      }

      const preferenceData = await this._createMercadoPagoPreference(
        requestData
      );
      if (!preferenceData || !preferenceData.id) {
        alert("Erro ao criar preferência de pagamento. Tente novamente.");
        return false;
      }

      // Salvar ID da preferência no localStorage
      localStorage.setItem("mp_preference_id", preferenceData.id);

      // Em vez de renderizar um botão, redirecionamos diretamente
      this._redirectToMercadoPago(preferenceData.id);

      return true;
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);

      let errorMessage = "Ocorreu um erro ao processar o pagamento.";
      if (error.response && error.response.data) {
        const apiError = error.response.data;
        if (apiError.message) {
          errorMessage += ` ${apiError.message}`;
        }
        console.error("Detalhes do erro:", apiError);
      }

      alert(`${errorMessage} Por favor, tente novamente.`);
      return false;
    } finally {
      this.isProcessingPayment = false;
    }
  }

  _saveCheckoutDataToLocalStorage() {
    // Salva informações importantes para recuperar quando o usuário voltar
    const checkoutData = {
      cartItems: this.cartItems,
      shippingData: this.shippingData,
      user: {
        email: this.user.email,
        name: this.user.name || this.user.displayName,
      },
      timestamp: Date.now(),
    };

    localStorage.setItem("checkout_data", JSON.stringify(checkoutData));
  }

  // Verifica se precisamos do SDK para criar preferência
  _needMercadoPagoSDK() {
    // Normalmente não precisamos do SDK apenas para criar preferência e redirecionar
    // Esta função é apenas caso você tenha outras funcionalidades que precisem dele
    return false;
  }

  async _loadMercadoPagoScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  _formatCartItems() {
    if (!this.cartItems || this.cartItems.length === 0) {
      return [];
    }

    return this.cartItems.map((item) => ({
      title: item.nome || "Produto",
      description: item.nome || "Descrição do produto",
      quantity: parseInt(item.quantity || 1),
      currency_id: "BRL",
      unit_price: Number(parseFloat(item.preco || 0).toFixed(2)),
    }));
  }

  _formatAddress() {
    const address = this.shippingData.address;
    if (!address) return null;

    return {
      zip_code: address.cep.replace(/\D/g, ""),
      street_name: address.rua,
      street_number: address.numero,
      neighborhood: address.bairro,
      city: address.cidade,
      federal_unit: address.estado,
    };
  }

  _prepareCheckoutApiData() {
    const address = this.shippingData.address;
    const subtotal = this._calculateSubtotal();
    const paymentId = import.meta.env.VITE_MP_APPLICATION_ID;
    return {
      user: this.user?.name || this.user?.displayName || "Cliente",
      user_email: this.user?.email || "cliente@email.com",
      status: "pending",
      payment_id: paymentId,
      transaction_id: `tx_${Math.random().toString(36).substring(2, 15)}`,
      cep: address.cep,
      estado: address.estado,
      cidade: address.cidade,
      bairro: address.bairro,
      rua: address.rua,
      numero: address.numero,
      complemento: address.complemento || "",
      subtotal: subtotal,
      shipping_cost: this.shippingData.cost || 0,
      total: subtotal + (this.shippingData.cost || 0),
      products: this.cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
  }

  _calculateSubtotal() {
    return this.cartItems.reduce((total, item) => {
      return total + parseFloat(item.preco) * item.quantity;
    }, 0);
  }

  async _createMercadoPagoPreference(requestData) {
    const ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN;
    const APPLICATION_ID = import.meta.env.VITE_MP_APPLICATION_ID;

    try {
      const response = await axios.post(
        "https://api.mercadopago.com/checkout/preferences",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "X-Application-ID": APPLICATION_ID,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro completo:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Dados:", error.response.data);
        console.error("Headers:", error.response.headers);
      }
      throw error;
    }
  }

  // Novo método para redirecionar diretamente para o Mercado Pago
  _redirectToMercadoPago(preferenceId) {
    // Salvar informações importantes antes do redirecionamento
    localStorage.setItem("checkout_redirect_time", Date.now().toString());
    localStorage.setItem("last_payment_attempt", preferenceId);
    
    // Limpar carrinho pois o checkout foi iniciado
    CartService.clearCart();
    
    // URL de redirecionamento direta para o checkout do Mercado Pago
    const redirectUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`;
    
    // Informar sobre o redirecionamento
    console.log("Redirecionando para checkout do Mercado Pago...");
    
    // Redirecionar o usuário
    window.location.href = redirectUrl;
  }


  // Método para limpar dados do checkout
  static clearCheckoutData() {
    localStorage.removeItem("checkout_data");
    localStorage.removeItem("mp_preference_id");
    localStorage.removeItem("checkout_redirect_time");
    localStorage.removeItem("last_payment_attempt");
    localStorage.removeItem("last_order_id");
  }
}