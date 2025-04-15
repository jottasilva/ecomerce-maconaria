<template>
    <section class="hero">
      <div class="container hero-content">
        <h1>Artigos Maçônicos de Alta Qualidade</h1>
        <p>Descubra nossa exclusiva coleção de paramentos, jóias, aventais e livros para todas as lojas e ritos.</p>
        <a href="#produtos" class="btn">Ver Produtos</a>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Hero'
  }
  </script>
  
  <style scoped>
  .hero {
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../public/freepik__upload__98986.jpeg') center;
    height: 600px;
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--white);
    margin-top: 80px;
  }
  
  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .hero h1 {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .hero p {
    font-size: 20px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 36px;
    }
  }
  </style>