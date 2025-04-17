import axios from 'axios';

export async function checkout(context) {
  try {
    context.isProcessingPayment = true;
    console.log('Iniciando checkout...');

    // Carrega o SDK MercadoPago se ainda não estiver carregado
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

    const ACCESS_TOKEN = "TEST-605317394854439-041715-ed345146e0127fe79005bb15a6cadb25-54030146";
    const PUBLIC_KEY = "TEST-b1af6e00-934c-4dc6-90f9-05ac0cebd173";

    // Prepara os itens
    const items = context.cartItems.map(item => ({
      title: item.nome,
      quantity: item.quantity,
      unit_price: parseFloat(item.preco)
    }));

    // Cria preferência
    const response = await axios.post(
      "https://api.mercadopago.com/checkout/preferences",
      {
        items: items,
        back_urls: {
          success: `${window.location.origin}/checkout/success`,
          failure: `${window.location.origin}/checkout/failure`,
          pending: `${window.location.origin}/checkout/pending`
        },
        auto_return: "approved"
      },
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
      locale: 'pt-BR'
    });

    // Mostra o container no template
    context.showMercadoPagoButton = true;

    // Aguarda o DOM renderizar
    await context.$nextTick();

    // Verifica se o elemento está presente
    const buttonContainer = document.querySelector('#mp_payment_button');
    if (!buttonContainer) {
      throw new Error('Elemento #mp_payment_button não encontrado no DOM.');
    }

    // Renderiza o botão
    mp.checkout({
      preference: {
        id: preferenceData.id
      },
      render: {
        container: '#mp_payment_button',
        label: 'Pagar agora'
      }
    });

  } catch (error) {
    console.error('Erro ao processar pagamento:', error.response?.data || error.message);
    alert('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
  } finally {
    context.isProcessingPayment = false;
  }
}
