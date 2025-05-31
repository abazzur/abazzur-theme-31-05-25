/**
 * ABAZZUR™ Customer Classification Pop-up
 * Script de controle para classificação de usuários e login automático
 * 
 * Este script gerencia:
 * 1. Exibição do pop-up na página inicial
 * 2. Navegação entre etapas
 * 3. Registro e login com Google OAuth
 * 4. Registro e login com email/senha
 * 5. Integração com API Shopify para criação de cliente
 * 6. Integração com checkout Yampi
 */

(function() {
  // Configurações
  const config = {
    cookieName: 'abazzur_user_type',
    cookieExpiry: 30, // dias
    popupShownCookieName: 'abazzur_popup_shown',
    apiEndpoint: '/api/2023-07/customers.json',
    yampiCheckoutDomain: 'checkout.yampi.com.br/loja/abazzur'
  };
  
  // Elementos do DOM
  let popup;
  let steps;
  let userType = '';
  
  // Inicialização quando DOM estiver pronto
  document.addEventListener('DOMContentLoaded', init);
  
  function init() {
    popup = document.getElementById('abazzur-popup');
    if (!popup) return;
    
    steps = popup.querySelectorAll('.abazzur-popup-step');
    
    // Verificar se o pop-up já foi mostrado
    if (isHomePage() && !getCookie(config.popupShownCookieName) && !isLoggedIn()) {
      showPopup();
    }
    
    // Adicionar event listeners
    setupEventListeners();
  }
  
  function setupEventListeners() {
    // Botões da Etapa 1 (Tipo de usuário)
    const typeButtons = popup.querySelectorAll('[data-type]');
    typeButtons.forEach(button => {
      button.addEventListener('click', function() {
        userType = this.getAttribute('data-type');
        goToStep(2);
      });
    });
    
    // Botões da Etapa 2 (Opções de login)
    const googleButton = popup.querySelector('.abazzur-btn-google');
    if (googleButton) {
      googleButton.addEventListener('click', initiateGoogleLogin);
    }
    
    const emailButton = popup.querySelector('.abazzur-btn-email');
    if (emailButton) {
      emailButton.addEventListener('click', function() {
        goToStep(3);
      });
    }
    
    // Formulário de registro Etapa 3
    const registerForm = document.getElementById('abazzur-register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEmailRegistration();
      });
    }
  }
  
  // === Funções de Navegação e UI ===
  
  function showPopup() {
    popup.classList.add('active');
    goToStep(1);
    
    // Marcar como exibido
    setCookie(config.popupShownCookieName, 'true', 1); // Expira em 1 dia
  }
  
  function hidePopup() {
    popup.classList.remove('active');
  }
  
  function goToStep(stepNumber) {
    steps.forEach(step => {
      step.style.display = 'none';
    });
    
    const targetStep = popup.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
      targetStep.style.display = 'block';
    }
  }
  
  // === Funções de Autenticação ===
  
  function initiateGoogleLogin() {
    // Configurar OAuth do Google
    // Aqui usaríamos a biblioteca gapi para iniciar a autenticação
    console.log('Iniciando login com Google para tipo de usuário:', userType);
    
    // Simulação - em produção, usaríamos a resposta real do Google OAuth
    const mockGoogleUser = {
      name: 'Usuário Google',
      email: 'usuario@gmail.com',
      googleId: '123456789'
    };
    
    createCustomerInShopify(mockGoogleUser, true);
  }
  
  function handleEmailRegistration() {
    const nameInput = document.getElementById('abazzur-name');
    const emailInput = document.getElementById('abazzur-email');
    const termsCheckbox = document.getElementById('abazzur-terms');
    
    if (!nameInput.value || !emailInput.value || !termsCheckbox.checked) {
      alert('Por favor, preencha todos os campos e aceite os termos.');
      return;
    }
    
    const userData = {
      name: nameInput.value,
      email: emailInput.value
    };
    
    createCustomerInShopify(userData, false);
  }
  
  function createCustomerInShopify(userData, isGoogleAuth) {
    console.log('Criando cliente na Shopify:', userData, 'Tipo:', userType);
    
    // Gerar senha aleatória para usuários de e-mail
    const password = isGoogleAuth ? generateRandomPassword() : generateRandomPassword();
    
    // Dados para a API Shopify
    const customerData = {
      customer: {
        first_name: userData.name.split(' ')[0],
        last_name: userData.name.split(' ').slice(1).join(' '),
        email: userData.email,
        password: password,
        password_confirmation: password,
        tags: userType,
        verified_email: isGoogleAuth // Email já é verificado se vier do Google
      }
    };
    
    // Em produção, aqui faria a chamada à API Shopify
    // Simulando sucesso para demonstração
    console.log('Cliente criado com sucesso:', customerData);
    
    // Armazenar tipo de usuário em cookie
    setCookie(config.cookieName, userType, config.cookieExpiry);
    
    // Integração com o checkout da Yampi
    syncUserWithYampi(userData, userType);
    
    // Simular login bem-sucedido
    performAutoLogin(userData.email, password);
  }
  
  function syncUserWithYampi(userData, userType) {
    // Armazena os dados para uso pelo checkout da Yampi
    localStorage.setItem('abazzur_user', JSON.stringify({
      email: userData.email,
      name: userData.name,
      type: userType,
      timestamp: new Date().toISOString()
    }));
    
    // Configura cookies para o checkout da Yampi
    document.cookie = `abazzur_user_type=${userType}; path=/; max-age=${60*60*24*30}; domain=${window.location.hostname}; secure`;
    
    // Modifica links de compra rápida para incluir parâmetros da Yampi
    document.querySelectorAll('a[href*="checkout.yampi"], button[data-action="buy-now"]').forEach(el => {
      el.addEventListener('click', function(e) {
        const currentHref = this.getAttribute('href') || '';
        if (currentHref.includes('yampi')) {
          this.setAttribute('href', `${currentHref}${currentHref.includes('?') ? '&' : '?'}customer_type=${userType}`);
        }
      });
    });
  }
  
  function performAutoLogin(email, password) {
    // Aqui faria o login do cliente usando a API de autenticação da Shopify
    console.log('Login automático realizado para:', email);
    
    // Fecha o popup após login bem-sucedido
    hidePopup();
    
    // Recarrega a página para refletir o estado de login
    // window.location.reload();
    
    // Simulação de redirecionamento após login
    setTimeout(() => {
      alert(`Login realizado com sucesso! Bem-vindo(a) à ABAZZUR™.\nVocê está classificado como: ${userType}`);
    }, 1000);
  }
  
  // === Funções Auxiliares ===
  
  function isHomePage() {
    return window.location.pathname === '/' || 
           window.location.pathname === '/collections/all' || 
           window.location.pathname === '/collections/frontpage';
  }
  
  function isLoggedIn() {
    // Verificar se o cliente já está logado
    // No Shopify, podemos usar a variável global customer
    return window.customer && window.customer.id;
  }
  
  function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
  }
  
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/; secure";
  }
  
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    
    return null;
  }
})();