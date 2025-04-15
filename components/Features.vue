<template>
    <section class="features">
      <div class="container">
        <h2 class="section-title">Por que escolher nossos produtos?</h2>
        <div class="features-grid">
          <div class="feature" v-for="(feature, index) in features" :key="index">
            <div v-html="feature.icon"></div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Features',
    data() {
      return {
        features: [
          {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#14213d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>`,
            title: 'Qualidade Superior',
            description: 'Todos os nossos produtos são feitos com materiais de alta qualidade, garantindo durabilidade e elegância.'
          },
          {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#14213d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>`,
            title: 'Envio Discreto',
            description: 'Garantimos embalagens discretas e envio seguro para todo o Brasil com rastreamento completo.'
          },
          {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#14213d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            title: 'Suporte Especializado',
            description: 'Nossa equipe está disponível para ajudar com informações sobre produtos e recomendações para cada rito.'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .features {
    padding: 80px 0;
    background-color: var(--white);
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }
  
  .feature {
    text-align: center;
    padding: 30px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
  }
  
  .feature:hover {
    transform: translateY(-10px);
  }
  
  .feature svg {
    margin-bottom: 20px;
  }
  
  @media (max-width: 992px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 576px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>