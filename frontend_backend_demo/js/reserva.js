// A URL base e o caminho respeitam a porta e a rota declaradas no ReservaController.
const API_RESERVAS_URL = 'http://localhost:8082/reserva';
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

// O filtro JWT do backend exige um token Bearer nas rotas de reservas.
function authorizationHeader() {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const token = savedToken.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw new Error('Entre pelo login para obter um token antes de consultar as reservas.');
  }
  return `Bearer ${token}`;
}

// Guardamos referências dos elementos para atualizar a página sem recriá-la.
const searchForm = document.getElementById('search-form');
const reservationIdInput = document.getElementById('reservation-id');
const detailLoading = document.getElementById('detail-loading');
const detailEmpty = document.getElementById('detail-empty');
const detailCard = document.getElementById('detail-card');
const feedback = document.getElementById('feedback');
const reservationsTable = document.getElementById('reservations-table');
const reservationsCount = document.getElementById('reservations-count');
const companySearchForm = document.getElementById('company-search-form');
const companyIdInput = document.getElementById('company-id');
const companyReservationsTable = document.getElementById('company-reservations-table');
const companyFeedback = document.getElementById('company-feedback');
const reservationDialog = document.getElementById('reservation-dialog');
const reservationForm = document.getElementById('reservation-form');
const formFeedback = document.getElementById('form-feedback');
const saveReservationButton = document.getElementById('save-reservation-button');

// Mantemos o ID selecionado para direcionar edição e desativação ao registro correto.
let reservaAtualId = null;
let listaCarregada = false;

/**
 * Concentra as requisições HTTP em um só lugar. Assim, erros de conexão,
 * respostas sem JSON e códigos HTTP de falha recebem tratamento consistente.
 */
async function requestReserva(url, options = {}) {
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      accept: '*/*',
      Authorization: authorizationHeader(),
    },
  };

  // POST e PUT enviam os campos do ReservaRequest como JSON.
  if (options.body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    throw new Error(
      `Não foi possível conectar à API em ${API_RESERVAS_URL}. Verifique se o backend está ativo.`
    );
  }

  // Ler a resposta como texto também funciona em rotas com corpo vazio.
  const responseText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let result = responseText;

  if (responseText && contentType.includes('application/json')) {
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      throw new Error('A API retornou um JSON inválido.');
    }
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Reserva não encontrada. Confira o ID e tente novamente.');
    }

    const serverMessage = result && typeof result === 'object'
      ? result.mensagem || result.message || result.error
      : result;
    throw new Error(serverMessage || `A API respondeu com o status HTTP ${response.status}.`);
  }

  return result;
}

// Mensagens são inseridas como texto para evitar interpretar conteúdo da API como HTML.
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

function showFormFeedback(message, type = 'error') {
  formFeedback.textContent = message;
  formFeedback.classList.toggle('feedback--error', type === 'error');
  formFeedback.hidden = false;
}

function clearFormFeedback() {
  formFeedback.textContent = '';
  formFeedback.hidden = true;
  formFeedback.classList.remove('feedback--error');
}

// Formata valores opcionais para deixar claro quando o backend não os informou.
function displayValue(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function statusLabel(status) {
  if (status === 'A') {
    return 'Ativa (A)';
  }
  if (status === 'D') {
    return 'Desativada (D)';
  }
  return displayValue(status);
}

function showLoading() {
  detailLoading.hidden = false;
  detailEmpty.hidden = true;
  detailCard.hidden = true;
  detailLoading.textContent = 'Carregando reserva...';
}

function showEmptyState(title, description) {
  detailLoading.hidden = true;
  detailCard.hidden = true;
  detailEmpty.hidden = false;
  document.getElementById('empty-title').textContent = title;
  document.getElementById('empty-description').textContent = description;
}

// Exibe apenas as propriedades que existem na entidade Reserva do projeto.
function renderReserva(reserva) {
  document.getElementById('reservation-id-badge').textContent = `ID ${displayValue(reserva.id)}`;
  document.getElementById('reservation-name').textContent = displayValue(reserva.nome);
  document.getElementById('reservation-document').textContent = displayValue(reserva.cpfCnpj);
  document.getElementById('reservation-code').textContent = displayValue(reserva.codigo);
  document.getElementById('reservation-status').textContent = statusLabel(reserva.status);
  document.getElementById('reservation-status-input').value =
    reserva.status === 'D' ? 'D' : 'A';

  reservaAtualId = reserva.id === null || reserva.id === undefined
    ? null
    : String(reserva.id);
  reservationIdInput.value = reservaAtualId || '';
  detailLoading.hidden = true;
  detailEmpty.hidden = true;
  detailCard.hidden = false;
}

/**
 * Consulta uma reserva pela rota GET /reserva/{id}. A consulta inicial usa
 * exatamente o ID 1 indicado para teste; a mesma função atende a busca e a edição.
 */
async function carregarReserva(id, { reportError = true } = {}) {
  showLoading();
  clearFeedback();

  try {
    const reserva = await requestReserva(`${API_RESERVAS_URL}/${encodeURIComponent(id)}`);

    if (!reserva || typeof reserva !== 'object' || Array.isArray(reserva)) {
      throw new Error('A API não retornou os dados da reserva em formato de objeto JSON.');
    }

    renderReserva(reserva);
    return null;
  } catch (error) {
    reservaAtualId = null;
    showEmptyState('Não foi possível carregar a reserva', error.message);
    if (reportError) {
      showFeedback(error.message, 'error');
    }
    return error.message;
  }
}

// Cria células com textContent para mostrar os dados recebidos sem executar HTML.
function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = displayValue(value);
  row.append(cell);
  return cell;
}

function renderTableMessage(message, isError = false) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = `table-message${isError ? ' feedback--error' : ''}`;
  cell.colSpan = 6;
  cell.textContent = message;
  row.append(cell);
  reservationsTable.replaceChildren(row);
}

function renderReservas(reservas) {
  reservationsTable.replaceChildren();

  if (!reservas.length) {
    renderTableMessage('Nenhuma reserva encontrada.');
    reservationsCount.textContent = '0 reservas encontradas';
    return;
  }

  reservas.forEach((reserva) => {
    const row = document.createElement('tr');
    appendCell(row, reserva.id);
    appendCell(row, reserva.nome);
    appendCell(row, reserva.cpfCnpj);
    appendCell(row, reserva.codigo);
    appendCell(row, statusLabel(reserva.status));

    const actionsCell = document.createElement('td');
    actionsCell.className = 'row-actions';
    const viewButton = document.createElement('button');
    viewButton.className = 'button button--secondary';
    viewButton.type = 'button';
    viewButton.textContent = 'Detalhes';
    viewButton.dataset.action = 'view';
    viewButton.dataset.id = reserva.id === null || reserva.id === undefined ? '' : String(reserva.id);
    viewButton.disabled = !viewButton.dataset.id;
    viewButton.setAttribute('aria-label', `Ver detalhes da reserva ${viewButton.dataset.id}`);
    actionsCell.append(viewButton);
    row.append(actionsCell);
    reservationsTable.append(row);
  });

  reservationsCount.textContent = `${reservas.length} ${
    reservas.length === 1 ? 'reserva encontrada' : 'reservas encontradas'
  }`;
}

// GET /reserva deve retornar uma lista JSON; qualquer outro formato é mostrado como erro.
async function carregarLista() {
  const loadListButton = document.getElementById('load-list-button');
  loadListButton.disabled = true;
  loadListButton.textContent = 'Carregando...';
  reservationsCount.textContent = 'Carregando reservas...';
  renderTableMessage('Carregando reservas...');

  try {
    const resultado = await requestReserva(API_RESERVAS_URL);

    if (!Array.isArray(resultado)) {
      throw new Error('A rota GET /reserva precisa retornar uma lista (array JSON).');
    }

    renderReservas(resultado);
    listaCarregada = true;
    clearFeedback();
  } catch (error) {
    renderTableMessage(error.message, true);
    reservationsCount.textContent = 'Não foi possível carregar as reservas.';
    showFeedback(error.message, 'error');
  } finally {
    loadListButton.disabled = false;
    loadListButton.textContent = 'Atualizar lista';
  }
}

function renderReservasEmpresa(reservas) {
  companyReservationsTable.replaceChildren();

  if (!reservas.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'table-message';
    cell.colSpan = 5;
    cell.textContent = 'Nenhuma reserva foi retornada para esta empresa.';
    row.append(cell);
    companyReservationsTable.append(row);
    return;
  }

  reservas.forEach((reserva) => {
    const row = document.createElement('tr');
    appendCell(row, reserva.id);
    appendCell(row, reserva.nome);
    appendCell(row, reserva.cpfCnpj);
    appendCell(row, reserva.codigo);
    appendCell(row, statusLabel(reserva.status));
    companyReservationsTable.append(row);
  });
}

async function carregarReservasEmpresa(event) {
  event.preventDefault();
  const empresaId = companyIdInput.value.trim();
  if (!empresaId || Number(empresaId) < 1) {
    companyFeedback.textContent = 'Informe um ID de empresa válido.';
    companyFeedback.classList.add('feedback--error');
    companyFeedback.hidden = false;
    return;
  }

  const searchButton = document.getElementById('search-company-button');
  searchButton.disabled = true;
  searchButton.textContent = 'Buscando...';
  companyFeedback.hidden = true;

  try {
    const resultado = await requestReserva(
      `${API_RESERVAS_URL}/empresa/${encodeURIComponent(empresaId)}`
    );
    const reservas = Array.isArray(resultado) ? resultado : [resultado];
    if (reservas.some((reserva) => !reserva || typeof reserva !== 'object')) {
      throw new Error('A API retornou dados inválidos para a consulta por empresa.');
    }

    renderReservasEmpresa(reservas);
    companyFeedback.textContent = `${reservas.length} ${
      reservas.length === 1 ? 'reserva retornada' : 'reservas retornadas'
    } para a empresa ${empresaId}.`;
    companyFeedback.classList.remove('feedback--error');
    companyFeedback.hidden = false;
  } catch (error) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'table-message feedback--error';
    cell.colSpan = 5;
    cell.textContent = error.message;
    row.append(cell);
    companyReservationsTable.replaceChildren(row);
    companyFeedback.textContent = error.message;
    companyFeedback.classList.add('feedback--error');
    companyFeedback.hidden = false;
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = 'Buscar empresa';
  }
}

function abrirFormularioNovo() {
  reservationForm.reset();
  document.getElementById('reservation-form-status').value = 'A';
  document.getElementById('form-reservation-id').value = '';
  document.getElementById('dialog-title').textContent = 'Nova reserva';
  saveReservationButton.textContent = 'Salvar reserva';
  clearFormFeedback();
  reservationDialog.showModal();
  document.getElementById('reservation-name-input').focus();
}

function abrirFormularioEdicao() {
  if (!reservaAtualId || detailCard.hidden) {
    showFeedback('Consulte uma reserva antes de tentar editá-la.', 'error');
    return;
  }

  // Reutiliza os valores já consultados para não perder os dados da reserva selecionada.
  document.getElementById('form-reservation-id').value = reservaAtualId;
  document.getElementById('reservation-name-input').value =
    document.getElementById('reservation-name').textContent === '—'
      ? ''
      : document.getElementById('reservation-name').textContent;
  document.getElementById('reservation-document-input').value =
    document.getElementById('reservation-document').textContent === '—'
      ? ''
      : document.getElementById('reservation-document').textContent;
  document.getElementById('reservation-code-input').value =
    document.getElementById('reservation-code').textContent === '—'
      ? ''
      : document.getElementById('reservation-code').textContent;
  document.getElementById('reservation-form-status').value =
    document.getElementById('reservation-status-input').value;
  document.getElementById('dialog-title').textContent = `Editar reserva ${reservaAtualId}`;
  saveReservationButton.textContent = 'Salvar alterações';
  clearFormFeedback();
  reservationDialog.showModal();
}

function obterDadosFormulario() {
  return {
    nome: document.getElementById('reservation-name-input').value.trim(),
    cpfCnpj: document.getElementById('reservation-document-input').value.trim(),
    codigo: document.getElementById('reservation-code-input').value.trim(),
    status: document.getElementById('reservation-form-status').value,
  };
}

// Converte o retorno do cadastro/edição em uma mensagem amigável quando disponível.
function getSuccessMessage(result, fallback) {
  return result && typeof result === 'object' && result.mensagem
    ? result.mensagem
    : fallback;
}

async function salvarReserva(event) {
  event.preventDefault();
  clearFormFeedback();
  saveReservationButton.disabled = true;
  saveReservationButton.textContent = 'Salvando...';

  const id = document.getElementById('form-reservation-id').value;
  const isEditing = Boolean(id);
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing ? `${API_RESERVAS_URL}/${encodeURIComponent(id)}` : API_RESERVAS_URL;

  try {
    const resultado = await requestReserva(url, {
      method,
      body: obterDadosFormulario(),
    });

    const savedId = resultado && typeof resultado === 'object'
      ? resultado.id || id
      : id;
    const successMessage = getSuccessMessage(
      resultado,
      isEditing ? 'Reserva atualizada com sucesso.' : 'Reserva cadastrada com sucesso.'
    );

    reservationDialog.close();

    let detailError = null;
    if (savedId) {
      detailError = await carregarReserva(savedId, { reportError: false });
    } else {
      showEmptyState('Reserva salva', 'O backend não retornou o ID para consultar os dados.');
    }

    if (listaCarregada) {
      await carregarLista();
    }

    // O carregamento dos dados limpa mensagens antigas; reapresentamos o resultado da gravação.
    if (detailError) {
      showFeedback(detailError, 'error');
    } else if (!feedback.classList.contains('feedback--error')) {
      showFeedback(successMessage);
    }
  } catch (error) {
    showFormFeedback(error.message);
  } finally {
    saveReservationButton.disabled = false;
    saveReservationButton.textContent = isEditing ? 'Salvar alterações' : 'Salvar reserva';
  }
}

async function desativarReserva() {
  if (!reservaAtualId) {
    showFeedback('Consulte uma reserva antes de tentar desativá-la.', 'error');
    return;
  }

  const confirmou = window.confirm(
    `Deseja excluir a reserva ${reservaAtualId}? O controller usa DELETE para marcar o status como "D".`
  );
  if (!confirmou) {
    return;
  }

  const deactivateButton = document.getElementById('deactivate-reservation-button');
  deactivateButton.disabled = true;

  try {
    const idDesativado = reservaAtualId;
    const resultado = await requestReserva(
      `${API_RESERVAS_URL}/${encodeURIComponent(idDesativado)}`,
      { method: 'DELETE' }
    );

    reservaAtualId = null;
    showEmptyState('Reserva excluída', 'A operação DELETE foi concluída.');
    showFeedback(getSuccessMessage(resultado, `A reserva ${idDesativado} foi excluída.`));

    if (listaCarregada) {
      await carregarLista();
    }
  } catch (error) {
    showFeedback(error.message, 'error');
  } finally {
    deactivateButton.disabled = false;
  }
}

async function atualizarStatusReserva(event) {
  event.preventDefault();
  if (!reservaAtualId) {
    showFeedback('Consulte uma reserva antes de atualizar o status.', 'error');
    return;
  }

  const button = document.getElementById('update-status-button');
  const status = document.getElementById('reservation-status-input').value;
  button.disabled = true;
  button.textContent = 'Atualizando...';

  try {
    const resultado = await requestReserva(
      `${API_RESERVAS_URL}/${encodeURIComponent(reservaAtualId)}/status`,
      { method: 'PATCH', body: { status } }
    );
    const id = reservaAtualId;
    const detailError = await carregarReserva(id, { reportError: false });
    if (listaCarregada) {
      await carregarLista();
    }
    if (detailError) {
      showFeedback(detailError, 'error');
    } else {
      showFeedback(getSuccessMessage(resultado, 'Status da reserva atualizado com sucesso.'));
    }
  } catch (error) {
    showFeedback(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Atualizar status';
  }
}

// Buscar usa a rota singular, informando na tela quando o ID não existe.
searchForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = reservationIdInput.value.trim();

  if (!id || Number(id) < 1) {
    showFeedback('Informe um ID de reserva válido.', 'error');
    return;
  }

  await carregarReserva(id);
});

document.getElementById('new-reservation-button')
  .addEventListener('click', abrirFormularioNovo);
document.getElementById('edit-reservation-button')
  .addEventListener('click', abrirFormularioEdicao);
document.getElementById('deactivate-reservation-button')
  .addEventListener('click', desativarReserva);
document.getElementById('load-list-button')
  .addEventListener('click', carregarLista);
reservationForm.addEventListener('submit', salvarReserva);
document.getElementById('status-form').addEventListener('submit', atualizarStatusReserva);
companySearchForm.addEventListener('submit', carregarReservasEmpresa);

// Os botões de detalhes da tabela são tratados no pai para atender linhas dinâmicas.
reservationsTable.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="view"]');
  if (!button || !button.dataset.id) {
    return;
  }

  reservationIdInput.value = button.dataset.id;
  await carregarReserva(button.dataset.id);
  document.getElementById('reservation-heading').scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
});

function fecharFormulario() {
  reservationDialog.close();
  clearFormFeedback();
}

document.getElementById('close-dialog-button').addEventListener('click', fecharFormulario);
document.getElementById('cancel-dialog-button').addEventListener('click', fecharFormulario);

// Ao abrir a tela, faz o GET inicial em /reserva/1.
carregarReserva('1');
