export default class GoogleLoginService {
  constructor(clientId) {
    this.clientId = clientId;
    this.isLoaded = false;
    this.auth = null;
    this.currentUser = null;
  }

  /**
   * Inicializa o serviço de autenticação Google
   * @returns {Promise} - Promise que resolve quando o serviço estiver pronto
   */
  async init() {
    if (this.isLoaded) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Carrega o script do Google Identity Services
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        try {
          this.isLoaded = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  /**
   * Realiza o login com Google
   * @returns {Promise} - Promise que resolve com os dados do usuário logado
   */
  async login() {
    if (!this.isLoaded) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        // Inicializa o cliente de autenticação Google
        const client = google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(tokenResponse);
              return;
            }

            try {
              const userData = await this.fetchUserInfo(
                tokenResponse.access_token
              );
              this.currentUser = userData;
              localStorage.setItem("googleUser", JSON.stringify(userData));
              localStorage.setItem("googleToken", tokenResponse.access_token);
              resolve(userData);
            } catch (error) {
              reject(error);
            }
          },
        });
        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtém os dados do usuário a partir do token de acesso
   * @param {string} accessToken - Token de acesso Google
   * @returns {Promise} - Promise que resolve com os dados do usuário
   */
  async fetchUserInfo(accessToken) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Falha ao obter informações do usuário");
    }

    return response.json();
  }

  /**
   * Verifica se o usuário está logado
   * @returns {boolean} - true se estiver logado, false caso contrário
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Retorna o usuário atual
   * @returns {Object|null} - Dados do usuário atual ou null se não estiver logado
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
  
    // Verifica se está executando no navegador antes de acessar localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      // Tenta recuperar do localStorage
      const savedUser = localStorage.getItem('googleUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        return this.currentUser;
      }
    }
  
    return null;
  }

  logout() {
    this.currentUser = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('googleUser');
      localStorage.removeItem('googleToken');
    }
  }

  /**
   * Obtém o token de acesso atual
   * @returns {string|null} - Token de acesso ou null se não estiver disponível
   */
  getAccessToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('googleToken');
    }
    return null;
  }
}
