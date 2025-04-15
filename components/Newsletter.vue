<template>
    <section class="newsletter">
      <div class="container">
        <h2 class="section-title">Receba nossas ofertas</h2>
        <p>Inscreva-se e receba informações sobre lançamentos e promoções exclusivas.</p>
        <form class="newsletter-form" @submit.prevent="submitNewsletter">
          <input 
            type="email" 
            v-model="email" 
            placeholder="Seu email" 
            class="newsletter-input" 
            required
          >
          <button type="submit" class="btn" :disabled="subscribing">
            {{ subscribing ? 'Enviando...' : 'Inscrever-se' }}
          </button>
        </form>
        <p v-if="subscribed" class="success-message">Obrigado por se inscrever!</p>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Newsletter',
    data() {
      return {
        email: '',
        subscribing: false,
        subscribed: false
      }
    },
    methods: {
      submitNewsletter() {
        this.subscribing = true;
        
        // Simulate API call
        setTimeout(() => {
          this.subscribing = false;
          this.subscribed = true;
          this.email = '';
          
          // Reset success message after delay
          setTimeout(() => {
            this.subscribed = false;
          }, 3000);
        }, 1000);
      }
    }
  }
  </script>
  
  <style scoped>
  .newsletter {
    padding: 80px 0;
    background-color: var(--white);
    text-align: center;
  }
  
  .newsletter-form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    gap: 10px;
  }
  
  .newsletter-input {
    flex: 1;
    padding: 12px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  
  .success-message {
    color: #4CAF50;
    margin-top: 15px;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    .newsletter-form {
      flex-direction: column;
    }
  }
  </style>