// A API e as rotas abaixo correspondem aos mapeamentos dos controllers Spring.
const API_BASE_URL = 'http://localhost:8082';
const TOKEN_STORAGE_KEY = 'eventspace.jwt';
const ENDPOINTS = {
  users: `${API_BASE_URL}/usuarios`,
  clients: `${API_BASE_URL}/Cliente`,
  reservations: `${API_BASE_URL}/Reserva`,
};

// Mantém os cartões, o menu e a planta organizados em referências reutilizáveis.
const elements = {
  metrics: {
    users: {
      value: document.getElementById('users-value'),
      meta: document.getElementById('users-meta'),
      label: 'usuários',
    },
    clients: {
      value: document.getElementById('clients-value'),
      meta: document.getElementById('clients-meta'),
      label: 'clientes',
    },
    reservations: {
      value: document.getElementById('reservations-value'),
      meta: document.getElementById('reservations-meta'),
      label: 'reservas',
    },
  },
  reloadButton: document.getElementById('reload-button'),
  apiNote: document.getElementById('api-note'),
  seatButtons: document.querySelectorAll('.seat'),
  selectionCount: document.getElementById('selection-count'),
  sidebar: document.getElementById('sidebar'),
  menuToggle: document.getElementById('menu-toggle'),
  backdrop: document.getElementById('sidebar-backdrop'),
  logoutButton: document.getElementById('logout-button'),
  dateLabel: document.getElementById('current-date'),
};

// O login existente armazena o JWT com esta chave; telas protegidas usam o mesmo token.
function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (error) {
    console.error('Não foi possível acessar a sessão salva no navegador.', error);
    throw new Error('O navegador não permitiu verificar sua sessão. Habilite o armazenamento e tente novamente.');
  }
}

// Sem uma sessão, retorna à tela de login em vez de consultar rotas protegidas.
let authToken;
try {
  authToken = getToken();
} catch (error) {
  window.alert(error.message);
  window.location.replace('index.html');
}

if (!authToken || !authToken.trim()) {
  window.location.replace('index.html');
}

// Lê a resposta como texto primeiro, pois alguns endpoints podem responder sem JSON.
async function readResponse(response) {
  const responseText = await response.text();
  if (!responseText) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error('A API retornou um JSON inválido.');
    }
  }

  return responseText;
}

// Faz uma consulta GET autenticada e transforma falhas HTTP ou de rede em erros legíveis.
async function fetchList(endpoint) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (error) {
    throw new Error(`Não foi possível conectar à API em ${API_BASE_URL}. Verifique se o backend está ativo e se o CORS está configurado.`);
  }

  const responseBody = await readResponse(response);
  if (!response.ok) {
    const message = responseBody && typeof responseBody === 'object'
      ? responseBody.message || responseBody.mensagem || responseBody.error
      : responseBody;
    throw new Error(message || `A API respondeu com o status HTTP ${response.status}.`);
  }

  // Uma métrica de quantidade precisa de uma lista, não de um texto ou objeto isolado.
  if (!Array.isArray(responseBody)) {
    throw new Error('A rota respondeu, mas não retornou uma lista de registros.');
  }

  return responseBody;
}

// Escreve valores recebidos como texto para evitar interpretar conteúdo da API como HTML.
function showMetric(metric, count, message, hasError = false) {
  metric.value.textContent = count === null
    ? '—'
    : new Intl.NumberFormat('pt-BR').format(count);
  metric.meta.textContent = message;
  metric.meta.classList.toggle('is-error', hasError);
}

// Atualiza cada cartão independentemente para que uma rota indisponível não esconda as outras.
async function loadMetrics() {
  // O redirecionamento de sessão também pode estar em andamento; não consulta sem JWT.
  if (!authToken || !authToken.trim()) return;

  elements.reloadButton.disabled = true;
  elements.apiNote.textContent = 'Consultando os dados do EventSpace...';

  Object.values(elements.metrics).forEach((metric) => {
    showMetric(metric, null, 'Carregando dados...');
  });

  const results = await Promise.allSettled([
    fetchList(ENDPOINTS.users),
    fetchList(ENDPOINTS.clients),
    fetchList(ENDPOINTS.reservations),
  ]);
  const metricNames = ['users', 'clients', 'reservations'];
  let failedRequests = 0;

  results.forEach((result, index) => {
    const metric = elements.metrics[metricNames[index]];

    if (result.status === 'fulfilled') {
      const count = result.value.length;
      const noun = count === 1 ? metric.label.slice(0, -1) : metric.label;
      showMetric(metric, count, `${count} ${noun} retornados pela API`);
      return;
    }

    failedRequests += 1;
    const message = result.reason instanceof Error
      ? result.reason.message
      : 'Ocorreu um erro inesperado ao consultar a API.';
    console.error(`Falha ao carregar ${metric.label}.`, result.reason);
    showMetric(metric, null, message, true);
  });

  elements.apiNote.textContent = failedRequests === 0
    ? 'Dados atualizados diretamente pela API.'
    : `${failedRequests} consulta(s) não puderam ser concluídas. Confira os detalhes em cada indicador e verifique o backend.`;
  elements.reloadButton.disabled = false;
}

// Abre ou fecha a navegação móvel e mantém seus atributos acessíveis atualizados.
function setMobileMenuOpen(isOpen) {
  elements.sidebar.classList.toggle('is-open', isOpen);
  elements.backdrop.classList.toggle('is-visible', isOpen);
  elements.menuToggle.setAttribute('aria-expanded', String(isOpen));
  elements.menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

// O menu compacto é controlado pelo botão, pelo fundo escurecido e pela tecla Escape.
elements.menuToggle.addEventListener('click', () => {
  setMobileMenuOpen(!elements.sidebar.classList.contains('is-open'));
});
elements.backdrop.addEventListener('click', () => setMobileMenuOpen(false));
elements.sidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMobileMenuOpen(false));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.sidebar.classList.contains('is-open')) {
    setMobileMenuOpen(false);
    elements.menuToggle.focus();
  }
});

// Ao sair, remove a mesma credencial criada pela tela de login e volta para ela.
elements.logoutButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Não foi possível remover a sessão salva no navegador.', error);
    window.alert('Não foi possível encerrar a sessão neste navegador.');
    return;
  }

  window.location.replace('index.html');
});

// Cada assento alterna somente o destaque visual; esta prévia não cria uma reserva.
function updateSeatSelection() {
  const selectedSeats = Array.from(elements.seatButtons)
    .filter((seat) => seat.getAttribute('aria-pressed') === 'true');
  const selectedCount = selectedSeats.length;

  elements.selectionCount.textContent = selectedCount === 0
    ? 'Nenhum lugar selecionado'
    : `${selectedCount} ${selectedCount === 1 ? 'lugar selecionado' : 'lugares selecionados'}`;
}

elements.seatButtons.forEach((seat) => {
  seat.addEventListener('click', () => {
    const isSelected = seat.getAttribute('aria-pressed') === 'true';
    seat.setAttribute('aria-pressed', String(!isSelected));
    seat.classList.toggle('is-selected', !isSelected);
    updateSeatSelection();
  });
});

// A data local ajuda a contextualizar o painel sem depender do servidor.
elements.dateLabel.textContent = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'long',
}).format(new Date());

// O botão permite atualizar manualmente as métricas após mudanças nos cadastros.
elements.reloadButton.addEventListener('click', loadMetrics);
loadMetrics();
