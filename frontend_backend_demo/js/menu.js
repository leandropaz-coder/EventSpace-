// Usa a mesma chave que o formulário de login para conferir a autenticação.
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

let token;

// Uma falha de acesso ao armazenamento também impede confirmar a sessão.
try {
  token = localStorage.getItem(TOKEN_STORAGE_KEY);
} catch (error) {
  console.error('Não foi possível verificar a sessão salva no navegador.', error);
  window.location.replace('index.html');
}

// Sem token, não há sessão para continuar no painel.
if (!token || !token.trim()) {
  window.location.replace('index.html');
}

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const backdrop = document.getElementById('sidebar-backdrop');
const logoutButton = document.getElementById('logout-button');
const dateLabel = document.getElementById('current-date');
const mobileViewport = window.matchMedia('(max-width: 700px)');

// Atualiza o estado visual e acessível do menu quando ele abre ou fecha.
function setMobileMenuOpen(isOpen) {
  sidebar.classList.toggle('is-open', isOpen);
  backdrop.classList.toggle('is-visible', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

menuToggle.addEventListener('click', () => {
  setMobileMenuOpen(!sidebar.classList.contains('is-open'));
});

backdrop.addEventListener('click', () => setMobileMenuOpen(false));

// Fecha o menu depois que uma página de módulo for escolhida no celular.
sidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (mobileViewport.matches) {
      setMobileMenuOpen(false);
    }
  });
});

// A tecla Escape oferece uma forma rápida de fechar a navegação móvel.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
    setMobileMenuOpen(false);
    menuToggle.focus();
  }
});

// Remove a credencial antes de voltar à tela de login.
logoutButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Não foi possível remover a sessão salva no navegador.', error);
  }

  window.location.replace('index.html');
});

// Exibe a data local sem fixar um formato específico para cada navegador.
dateLabel.textContent = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
}).format(new Date());
