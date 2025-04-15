<template>
    <footer id="contato">
      <div class="container">
        <div class="footer-content">
          <div>
            <h3 class="footer-title">Maçonaria Elegante</h3>
            <p>Fornecendo artigos maçônicos de qualidade desde 2025. Nossa missão é oferecer produtos que honrem a tradição e simbolismo da Maçonaria.</p>
            <div class="social-links">
              <a v-for="(social, index) in socialLinks" :key="index" :href="social.url" class="social-icon">
                <div v-html="social.icon"></div>
              </a>
            </div>
          </div>
          <div>
            <h3 class="footer-title">Links Rápidos</h3>
            <div class="footer-links">
              <a v-for="(link, index) in quickLinks" :key="index" :href="link.url">{{ link.name }}</a>
            </div>
          </div>
          <div>
            <h3 class="footer-title">Categorias</h3>
            <div class="footer-links">
              <a v-for="(category, index) in categories" :key="index" :href="category.url">{{ category.name }}</a>
            </div>
          </div>
          <div>
            <h3 class="footer-title">Contato</h3>
            <p>Av. Paulista, 1000, São Paulo - SP</p>
            <p>contato@maconariaelegante.com.br</p>
            <p>(11) 99999-8888</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Maçonaria Elegante. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </template>

  <script> 
  export default {
  name: 'AppFooter',
  data() {
    return {
      socialLinks: [
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>`,
          url: '#'
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>`,
          url: '#'
        },
        {
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
          </svg>`,
          url: '#'
        }
      ],
      quickLinks: [
        { name: 'Início', url: '#' },
        { name: 'Produtos', url: '#produtos' },
        { name: 'Sobre Nós', url: '#sobre' },
        { name: 'Contato', url: '#contato' }
      ],
      categories: [
        { name: 'Aventais', url: '#' },
        { name: 'Jóias', url: '#' },
        { name: 'Paramentos', url: '#' },
        { name: 'Livros', url: '#' },
        { name: 'Acessórios', url: '#' }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>

<style scoped>
footer {
  background-color: var(--dark);
  color: var(--white);
  padding: 50px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  margin-bottom: 30px;
}

.footer-title {
  margin-bottom: 20px;
  font-size: 18px;
  position: relative;
}

.footer-title:after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background-color: var(--secondary);
  margin-top: 10px;
}

.footer-links a {
  display: block;
  color: var(--light);
  text-decoration: none;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--secondary);
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.social-icon {
  background-color: rgba(255, 255, 255, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.social-icon:hover {
  background-color: var(--secondary);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>