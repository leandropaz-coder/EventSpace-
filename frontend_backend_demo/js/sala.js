// Endereço e caminho usam a porta configurada para o Spring Boot e a rota real do controller.
const API_BASE_URL = 'http://localhost:8082';
const SALAS_ENDPOINT = `${API_BASE_URL}/Salas`;
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

// Converte o token salvo pelo login no formato exigido pelo filtro JWT do backend.
function authorizationHeader() {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const token = savedToken.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw new Error('Entre pelo login para obter um token antes de consultar as salas.');
  }
  return `Bearer ${token}`;
}

// Elementos e dados compartilhados pelos eventos desta página.
const roomForm = document.getElementById('room-form');
const roomDialog = document.getElementById('room-dialog');
const roomsTable = document.getElementById('rooms-table');
const roomsCount = document.getElementById('rooms-count');
const feedback = document.getElementById('feedback');
const saveRoomButton = document.getElementById('save-room-button');

/**
 * Faz uma requisição à API, interpreta JSON ou texto e transforma respostas HTTP
 * malsucedidas em erros legíveis para que a tela não mostre sucesso indevido.
 */
async function requestSala(url, options = {}) {
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      accept: 'application/json',
      Authorization: authorizationHeader(),
    },
  };

  // O controller recebe objetos Sala em JSON nos métodos POST e PUT.
  if (options.body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    throw new Error(
      `Não foi possível conectar à API em http://localhost:8082. Verifique se o backend está ativo. Detalhe: ${error.message}`
    );
  }

  // Ler primeiro como texto evita chamar response.json() em respostas HTTP 204 ou vazias.
  const responseText = (await response.text()).trim();
  const contentType = response.headers.get('content-type') || '';
  let result = responseText || null;

  if (responseText && (contentType.includes('json') || /^[\[{]/.test(responseText))) {
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`A API retornou um JSON inválido na rota ${url}.`);
    }
  }

  if (!response.ok) {
    const serverMessage = result && typeof result === 'object'
      ? result.mensagem || result.message || result.error
      : result;
    throw new Error(serverMessage || `A API respondeu com o status HTTP ${response.status}.`);
  }

  return result;
}

// Mensagens são inseridas como texto, não HTML, para manter o conteúdo da API inerte.
function showFeedback(message, type = 'success') {
  feedback.textContent = message;
  feedback.classList.toggle('feedback--error', type === 'error');
  feedback.hidden = false;
}

function clearFeedback() {
  feedback.textContent = '';
  feedback.hidden = true;
  feedback.classList.remove('feedback--error');
}

// Cria células com textContent para evitar interpretar valores da API como marcação HTML.
function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value === null || value === undefined || value === '' ? '-' : String(value);
  row.append(cell);
  return cell;
}

function renderSalas(salas) {
  roomsTable.replaceChildren();

  if (!salas.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'table-message';
    cell.colSpan = 7;
    cell.textContent = 'Nenhuma sala encontrada.';
    row.append(cell);
    roomsTable.append(row);
    roomsCount.textContent = '0 salas encontradas';
    return;
  }

  salas.forEach((sala) => {
    const row = document.createElement('tr');
    const salaId = sala.id === null || sala.id === undefined ? '' : String(sala.id);

    appendCell(row, sala.id);
    appendCell(row, sala.nome);
    appendCell(row, sala.numero);
    appendCell(row, sala.andar);
    appendCell(row, sala.classe);

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    const status = sala.status === null || sala.status === undefined ? '' : String(sala.status);
    statusBadge.className = `status-badge${status.toUpperCase() === 'D' ? ' status-badge--inactive' : ''}`;
    statusBadge.textContent = status.toUpperCase() === 'D'
      ? 'Inativa'
      : status
        ? status
        : '—';
    statusCell.append(statusBadge);
    row.append(statusCell);

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'row-actions';

    const editButton = document.createElement('button');
    editButton.className = 'button button--secondary';
    editButton.type = 'button';
    editButton.textContent = 'Editar';
    editButton.dataset.action = 'edit';
    editButton.dataset.id = salaId;
    editButton.disabled = !salaId;
    editButton.setAttribute('aria-label', `Editar sala ${sala.nome || salaId || ''}`);

    const deactivateButton = document.createElement('button');
    deactivateButton.className = 'button button--danger';
    deactivateButton.type = 'button';
    deactivateButton.textContent = 'Desativar';
    deactivateButton.dataset.action = 'deactivate';
    deactivateButton.dataset.id = salaId;
    deactivateButton.disabled = !salaId || status.toUpperCase() === 'D';
    deactivateButton.setAttribute('aria-label', `Desativar sala ${sala.nome || salaId || ''}`);

    actions.append(editButton, deactivateButton);
    actionsCell.append(actions);
    row.append(actionsCell);
    roomsTable.append(row);
  });

  roomsCount.textContent = `${salas.length} ${salas.length === 1 ? 'sala encontrada' : 'salas encontradas'}`;
}

function renderTableMessage(message, isError = false) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = `table-message${isError ? ' error-text' : ''}`;
  cell.colSpan = 7;
  cell.textContent = message;
  row.append(cell);
  roomsTable.replaceChildren(row);
}

/**
 * A listagem é declarada como GET /Salas, mas o código atual do controller
 * devolve uma String fixa. A interface exige um array e informa esse contrato,
 * em vez de tratar o texto como uma lista vazia e ocultar a incompatibilidade.
 */
async function carregarSalas({ reportError = true } = {}) {
  roomsCount.textContent = 'Carregando salas...';
  renderTableMessage('Carregando salas...');

  try {
    const resultado = await requestSala(SALAS_ENDPOINT);

    if (!Array.isArray(resultado)) {
      const resposta = typeof resultado === 'string'
        ? ` Resposta recebida: "${resultado}".`
        : '';
      throw new Error(
        `A rota GET /Salas precisa retornar uma lista (array JSON). O controller atual retornou outro formato.${resposta}`
      );
    }

    renderSalas(resultado);
    clearFeedback();
    return null;
  } catch (error) {
    renderTableMessage(error.message, true);
    roomsCount.textContent = 'Não foi possível carregar as salas';
    if (reportError) {
      showFeedback(error.message, 'error');
    }
    return error.message;
  }
}

function abrirFormularioNovo() {
  roomForm.reset();
  document.getElementById('room-id').value = '';
  document.getElementById('dialog-title').textContent = 'Nova sala';
  saveRoomButton.textContent = 'Salvar sala';
  clearFeedback();
  roomDialog.showModal();
  document.getElementById('room-name').focus();
}

async function abrirFormularioEdicao(id) {
  clearFeedback();

  try {
    // Reconsulta o recurso usando GET /Salas/{id}, rota específica do SalaController.
    const sala = await requestSala(`${SALAS_ENDPOINT}/${encodeURIComponent(id)}`);
    if (!sala || typeof sala !== 'object' || Array.isArray(sala)) {
      throw new Error('A API não retornou os dados da sala em formato de objeto JSON.');
    }

    roomForm.reset();
    document.getElementById('room-id').value = sala.id ?? id;
    document.getElementById('room-name').value = sala.nome ?? '';
    document.getElementById('room-number').value = sala.numero ?? '';
    document.getElementById('room-floor').value = sala.andar ?? '';
    document.getElementById('room-class').value = sala.classe ?? '';
    document.getElementById('dialog-title').textContent = `Editar sala ${sala.id ?? id}`;
    saveRoomButton.textContent = 'Salvar alterações';
    roomDialog.showModal();
    document.getElementById('room-name').focus();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function salvarSala(event) {
  event.preventDefault();
  clearFeedback();

  // As chaves correspondem aos atributos existentes em Sala.java e aceitos pelo controller.
  const payload = {
    nome: document.getElementById('room-name').value.trim(),
    numero: document.getElementById('room-number').value.trim(),
    andar: document.getElementById('room-floor').value.trim(),
    classe: document.getElementById('room-class').value.trim(),
  };
  const id = document.getElementById('room-id').value;
  const isEditing = Boolean(id);

  saveRoomButton.disabled = true;
  saveRoomButton.textContent = isEditing ? 'Atualizando...' : 'Salvando...';

  try {
    // POST cria uma sala; PUT envia os mesmos campos ao recurso identificado pelo ID.
    const resultado = await requestSala(
      isEditing ? `${SALAS_ENDPOINT}/${encodeURIComponent(id)}` : SALAS_ENDPOINT,
      { method: isEditing ? 'PUT' : 'POST', body: payload }
    );
    const refreshError = await carregarSalas({ reportError: false });
    const mensagem = resultado && typeof resultado === 'object' && resultado.mensagem
      ? resultado.mensagem
      : isEditing
        ? 'Sala atualizada com sucesso.'
        : 'Sala cadastrada com sucesso.';

    roomDialog.close();
    showFeedback(
      refreshError ? `${mensagem} Porém, não foi possível atualizar a lista: ${refreshError}` : mensagem,
      refreshError ? 'error' : 'success'
    );
  } catch (error) {
    showFeedback(error.message, 'error');
  } finally {
    saveRoomButton.disabled = false;
    saveRoomButton.textContent = isEditing ? 'Salvar alterações' : 'Salvar sala';
  }
}

async function desativarSala(id) {
  const sala = Array.from(roomsTable.querySelectorAll('button[data-action="deactivate"]'))
    .find((button) => button.dataset.id === id);
  const salaNome = sala?.getAttribute('aria-label') || `ID ${id}`;

  // A confirmação deixa claro que DELETE muda o status da sala para D.
  if (!window.confirm(`Deseja desativar ${salaNome}? O registro não será apagado do banco.`)) {
    return;
  }

  clearFeedback();
  try {
    const resultado = await requestSala(`${SALAS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const refreshError = await carregarSalas({ reportError: false });
    const mensagem = resultado && typeof resultado === 'object' && resultado.mensagem
      ? resultado.mensagem
      : 'Sala desativada com sucesso.';
    showFeedback(
      refreshError ? `${mensagem} Porém, não foi possível atualizar a lista: ${refreshError}` : mensagem,
      refreshError ? 'error' : 'success'
    );
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function buscarSala(event) {
  event.preventDefault();
  const id = document.getElementById('search-id').value.trim();

  if (!id) {
    await carregarSalas();
    return;
  }

  clearFeedback();
  roomsCount.textContent = 'Buscando sala...';
  renderTableMessage('Buscando sala...');

  try {
    // Esta busca usa GET /Salas/{id}; a resposta do controller é um objeto Sala.
    const sala = await requestSala(`${SALAS_ENDPOINT}/${encodeURIComponent(id)}`);
    if (!sala || typeof sala !== 'object' || Array.isArray(sala)) {
      throw new Error('A API não retornou os dados da sala em formato de objeto JSON.');
    }
    // O método GET por ID atual não inclui o próprio ID no objeto retornado.
    renderSalas([{ ...sala, id: sala.id ?? id }]);
  } catch (error) {
    renderTableMessage(error.message, true);
    roomsCount.textContent = 'Sala não encontrada';
    showFeedback(error.message, 'error');
  }
}

// Eventos da página: o carregamento inicial acontece assim que o DOM está pronto,
// pois o script foi incluído com defer no HTML.
document.getElementById('new-room-button').addEventListener('click', abrirFormularioNovo);
document.getElementById('reload-button').addEventListener('click', () => carregarSalas());
document.getElementById('search-form').addEventListener('submit', buscarSala);
roomForm.addEventListener('submit', salvarSala);
document.getElementById('close-dialog').addEventListener('click', () => roomDialog.close());
document.getElementById('cancel-dialog').addEventListener('click', () => roomDialog.close());

// Delegação permite atender aos botões de linhas criadas dinamicamente.
roomsTable.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !button.dataset.id) {
    return;
  }

  if (button.dataset.action === 'edit') {
    abrirFormularioEdicao(button.dataset.id);
  } else if (button.dataset.action === 'deactivate') {
    desativarSala(button.dataset.id);
  }
});

carregarSalas();
