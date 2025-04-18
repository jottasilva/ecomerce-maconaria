<template>
    <div v-if="isOpen" class="modal-overlay">
      <div class="box">
        <div class="modal-header">
          <h2>Sobre Nós</h2>
          <button class="close-button" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      <div class="modal-container">
        <div class="modal-content">
          <div class="about-content">
            <img src="../public/assets/logo.svg" alt="Bode Chique Logo" class="about-logo">
            <h3>Bode Chique - Artigos Maçônicos de Qualidade</h3>
            <p>Fundada em 2025, a Bode Chique nasceu com o propósito de fornecer artigos maçônicos de alta qualidade que honram a tradição e o simbolismo da Maçonaria.</p>
            <p>Nossa equipe é formada por mestres artesãos e maçons dedicados, que compreendem profundamente o significado e a importância de cada símbolo e artefato que produzimos.</p>
            <h4>Nossa Missão</h4>
            <p>Preservar e difundir os valores maçônicos através de produtos confeccionados com excelência, atenção aos detalhes e respeito às tradições.</p>
            <h4>Nossos Valores</h4>
            <ul>
              <li>Integridade em todos os processos</li>
              <li>Excelência na qualidade dos materiais</li>
              <li>Respeito às tradições maçônicas</li>
              <li>Compromisso com a satisfação do cliente</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ModalSobre',
    props: {
      isOpen: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      closeModal() {
        this.$emit('close');
      }
    }
  }
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-container {
    max-width: 1000px;
    max-height: 90vh;
    background-color: white;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 15px 20px;
    background-color: var(--primary);
    color: var(--white);
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--white);
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-button:hover {
    opacity: 0.8;
  }
  
  .modal-content {
    padding: 20px;
    overflow-y: auto;
    flex-grow: 1;
  }
  
  .about-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .about-logo {
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
  }
  
  h3 {
    color: var(--primary);
    margin-bottom: 15px;
    text-align: center;
  }
  
  h4 {
    color: var(--primary);
    margin-top: 20px;
    margin-bottom: 10px;
    width: 100%;
  }
  
  p {
    margin-bottom: 15px;
    line-height: 1.6;
    color: #555;
    text-align: justify;
  }
  
  ul {
    width: 100%;
    padding-left: 20px;
    color: #555;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  @media (max-width: 1068px) {
    .box {
      width: 90%;

    }
  }
  </style>