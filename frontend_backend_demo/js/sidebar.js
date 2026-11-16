// A chave é a mesma usada pelo login para manter o encerramento de sessão coerente.
const SIDEBAR_TOKEN_KEY = 'eventspace.jwt';

// Localiza os controles compartilhados em cada página interna.
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const logoutButton = document.getElementById('logout-button');

// Atualiza classes e atributos acessíveis quando o menu abre ou fecha no celular.
function setSidebarOpen(isOpen) {
  sidebar.classList.toggle('is-open', isOpen);
  sidebarBackdrop.classList.toggle('is-visible', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

menuToggle.addEventListener('click', () => {
  setSidebarOpen(!sidebar.classList.contains('is-open'));
});

sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));

// Fecha o menu depois da navegação e devolve o foco ao botão com Escape.
sidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setSidebarOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
    setSidebarOpen(false);
    menuToggle.focus();
  }
});

// Remove o token antes de voltar ao formulário de login.
logoutButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(SIDEBAR_TOKEN_KEY);
  } catch (error) {
    console.error('Não foi possível encerrar a sessão neste navegador.', error);
    window.alert('Não foi possível encerrar a sessão neste navegador.');
    return;
  }

  window.location.replace('index.html');
});
