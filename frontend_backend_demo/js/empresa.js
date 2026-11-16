// Endereço base usado pelo backend Spring Boot neste projeto.
const COMPANY_API_URL = 'http://localhost:8082';
const COMPANY_TOKEN_KEY = 'eventspace.jwt';

// Guarda os elementos HTML que a tela atualiza ao consultar ou cadastrar empresas.
const companyForm = document.getElementById('company-form');
const companyFeedback = document.getElementById('company-feedback');
const companyList = document.getElementById('company-list');
const companyCount = document.getElementById('company-count');
const reloadCompaniesButton = document.getElementById('reload-companies');
const saveCompanyButton = document.getElementById('save-company');
const cancelCompanyEditButton = document.getElementById('cancel-company-edit');
const companyFormEyebrow = document.getElementById('company-form-eyebrow');
const companyFormTitle = document.getElementById('company-form-title');
const companyUsersSection = document.getElementById('company-users-section');
const companyUsersTitle = document.getElementById('company-users-title');
const companyUsersCount = document.getElementById('company-users-count');
const companyUsersList = document.getElementById('company-users-list');
let editingCompanyId = null;

// Lê primeiro o texto para conseguir mostrar respostas de erro sem formato JSON.
async function readCompanyResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Retorna uma mensagem útil para respostas JSON, texto simples ou falhas HTTP.
function getCompanyErrorMessage(body, status) {
  if (body && typeof body === 'object') {
    return body.message || body.mensagem || body.error || `A API respondeu com HTTP ${status}.`;
  }

  return typeof body === 'string' && body.trim()
    ? body
    : `A API respondeu com HTTP ${status}.`;
}

// Converte o token salvo pelo login para o formato que o filtro JWT espera.
function getCompanyAuthorizationHeader() {
  const savedToken = localStorage.getItem(COMPANY_TOKEN_KEY) || '';
  const token = savedToken.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    throw new Error('Entre pelo login para obter um token antes de consultar as empresas.');
  }

  return `Bearer ${token}`;
}

// Centraliza as chamadas para enviar autorização e tratar erros HTTP da API.
async function requestCompany(url, options = {}) {
  // Todas as rotas da tela usam o token de sessão. O método padrão é GET,
  // adequado para consultas que não modificam dados.
  const headers = {
    accept: 'application/json',
    Authorization: getCompanyAuthorizationHeader(),
  };
  const requestOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body !== undefined) {
    // Só serializa e declara JSON quando existe um corpo (POST, PUT ou PATCH);
    // consultas GET e DELETE seguem sem payload.
    headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    // Falhas de conexão não possuem status HTTP, então são descritas à parte
    // para facilitar a verificação de servidor, porta e rede.
    throw new Error(`Não foi possível conectar à API em ${COMPANY_API_URL}. Verifique se o backend está ativo.`);
  }

  // A resposta já vem como JSON convertido ou texto simples. A mesma rotina
  // consegue então gerar mensagens para APIs com os dois formatos.
  const body = await readCompanyResponse(response);
  if (!response.ok) {
    throw new Error(getCompanyErrorMessage(body, response.status));
  }

  return body;
}

// Mostra o resultado da operação por texto, sem interpretar HTML vindo do servidor.
function showCompanyFeedback(message, type) {
  companyFeedback.textContent = message;
  companyFeedback.classList.toggle('is-error', type === 'error');
  companyFeedback.classList.toggle('is-success', type === 'success');
  companyFeedback.hidden = false;
}

function clearCompanyFeedback() {
  companyFeedback.textContent = '';
  companyFeedback.classList.remove('is-error', 'is-success');
  companyFeedback.hidden = true;
}

// Cria uma célula de tabela com texto seguro para dados retornados pela API.
function createCompanyCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value === null || value === undefined || value === ''
    ? '—'
    : String(value);
  return cell;
}

function createCompanyAction(label, action, id, company) {
  const button = document.createElement('button');
  button.className = 'company-button company-button--secondary';
  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = String(id);
  button.dataset.cnpj = company.cnpj || '';
  button.dataset.companyName = company.nomeFantasia || company.razaoSocial || '';
  button.dataset.razaoSocial = company.razaoSocial || '';
  button.dataset.nomeFantasia = company.nomeFantasia || '';
  button.dataset.inscricaoEstadual = company.inscricaoEstadual || company.inscricaoEstaual || '';
  button.dataset.status = company.status || 'A';
  return button;
}

function renderCompanyTableMessage(message, isError = false) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = `company-table__message${isError ? ' is-error' : ''}`;
  cell.colSpan = 8;
  cell.textContent = message;
  row.append(cell);
  companyList.replaceChildren(row);
}

// Desenha as empresas recebidas e mantém um estado vazio legível quando não há dados.
function renderCompanies(companies) {
  // Substitui o conteúdo da tabela para não misturar resultados de consultas.
  companyList.replaceChildren();

  // A lista vazia é um resultado válido, diferente de uma falha na requisição.
  if (companies.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.className = 'company-table__message';
    cell.colSpan = 8;
    cell.textContent = 'Ainda não há empresas cadastradas.';
    row.append(cell);
    companyList.append(row);
    companyCount.textContent = 'Nenhuma empresa cadastrada';
    return;
  }

  // Cada linha é construída com nós DOM e valores exibidos por textContent
  // em createCompanyCell, sem interpretar dados remotos como HTML.
  companies.forEach((company) => {
    const row = document.createElement('tr');
    // O operador ?? preserva valores válidos como zero e só usa o nome legado
    // da propriedade quando a chave atual não veio na resposta.
    row.append(
      createCompanyCell(company.id),
      createCompanyCell(company.razaoSocial),
      createCompanyCell(company.nomeFantasia),
      createCompanyCell(company.cnpj),
      createCompanyCell(company.inscricaoEstadual ?? company.inscricaoEstaual),
      createCompanyCell(company.quantidadeUsuario),
    );

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    // O back-end usa "D" para desativada; normalizar para maiúsculas também
    // tolera diferenças de caixa sem alterar o valor original do registro.
    const status = String(company.status || 'A').toUpperCase();
    statusBadge.className = `company-status${status === 'D' ? ' company-status--inactive' : ''}`;
    statusBadge.textContent = status === 'D' ? 'Desativada' : 'Ativa';
    statusCell.append(statusBadge);
    row.append(statusCell);

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'company-row-actions';
    // Os dados necessários às ações ficam nos botões da própria linha e são
    // lidos depois pelo listener delegado no elemento da tabela.
    const companyId = company.id;
    const editButton = createCompanyAction('Editar', 'edit', companyId, company);
    const usersButton = createCompanyAction('Usuários', 'users', companyId, company);
    const statusButton = createCompanyAction(status === 'D' ? 'Ativar' : 'Desativar', 'status', companyId, company);
    const deleteButton = createCompanyAction('Excluir', 'delete', companyId, company);
    editButton.disabled = companyId === null || companyId === undefined;
    usersButton.disabled = !company.cnpj;
    statusButton.disabled = companyId === null || companyId === undefined;
    deleteButton.disabled = companyId === null || companyId === undefined || status === 'D';
    editButton.setAttribute('aria-label', `Editar empresa ${company.nomeFantasia || companyId || ''}`);
    usersButton.setAttribute('aria-label', `Consultar usuários de ${company.nomeFantasia || companyId || ''}`);
    statusButton.setAttribute('aria-label', `${status === 'D' ? 'Ativar' : 'Desativar'} empresa ${company.nomeFantasia || companyId || ''}`);
    deleteButton.setAttribute('aria-label', `Excluir empresa ${company.nomeFantasia || companyId || ''}`);
    actions.append(editButton, usersButton, statusButton, deleteButton);
    actionsCell.append(actions);
    row.append(actionsCell);
    companyList.append(row);
  });

  const total = companies.length;
  companyCount.textContent = `${total} ${total === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}`;
}

// Consulta a rota de listagem de EmpresaController e apresenta erros explicitamente.
async function loadCompanies() {
  // Apresenta o estado de carregamento e impede uma segunda atualização
  // concorrente acionada pelo botão de recarregar.
  reloadCompaniesButton.disabled = true;
  companyCount.textContent = 'Carregando empresas...';
  companyList.replaceChildren();

  const loadingRow = document.createElement('tr');
  const loadingCell = document.createElement('td');
  loadingCell.className = 'company-table__message';
  loadingCell.colSpan = 8;
  loadingCell.textContent = 'Carregando registros...';
  loadingRow.append(loadingCell);
  companyList.append(loadingRow);

  try {
    // A rota raiz do controller devolve a coleção; não aceitamos um formato
    // diferente, pois a renderização e a contagem pressupõem um array.
    const companies = await requestCompany(`${COMPANY_API_URL}/`);
    if (!Array.isArray(companies)) {
      throw new Error('A rota de empresas não retornou uma lista JSON.');
    }

    renderCompanies(companies);
    return null;
  } catch (error) {
    // Mantém a falha visível na própria tabela e retorna sua mensagem para
    // operações que precisam informar se a atualização posterior funcionou.
    console.error('Não foi possível carregar as empresas.', error);
    companyCount.textContent = 'Falha ao carregar empresas';
    const message = error instanceof Error
      ? error.message
      : 'Ocorreu um erro inesperado ao consultar a API.';
    renderCompanyTableMessage(message, true);
    return message;
  } finally {
    // Restaura a ação de recarregar mesmo quando fetch ou validação falha.
    reloadCompaniesButton.disabled = false;
  }
}

async function startCompanyEdit(id) {
  clearCompanyFeedback();

  try {
    const company = await requestCompany(`${COMPANY_API_URL}/${encodeURIComponent(id)}`);
    if (!company || typeof company !== 'object' || Array.isArray(company)) {
      throw new Error('A API não retornou os dados da empresa em formato de objeto JSON.');
    }

    editingCompanyId = String(company.id ?? id);
    companyForm.elements.namedItem('razaoSocial').value = company.razaoSocial || '';
    companyForm.elements.namedItem('nomeFantasia').value = company.nomeFantasia || '';
    companyForm.elements.namedItem('cnpj').value = company.cnpj || '';
    companyForm.elements.namedItem('inscricaoEstadual').value = company.inscricaoEstadual || company.inscricaoEstaual || '';
    companyFormEyebrow.textContent = 'EDITAR EMPRESA';
    companyFormTitle.textContent = `Dados cadastrais — ID ${editingCompanyId}`;
    saveCompanyButton.textContent = 'Salvar alterações';
    cancelCompanyEditButton.hidden = false;
    companyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    companyForm.elements.namedItem('razaoSocial').focus();
  } catch (error) {
    showCompanyFeedback(
      error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao consultar a empresa.',
      'error',
    );
  }
}

function cancelCompanyEdit() {
  editingCompanyId = null;
  companyForm.reset();
  companyFormEyebrow.textContent = 'NOVA EMPRESA';
  companyFormTitle.textContent = 'Dados cadastrais';
  saveCompanyButton.textContent = 'Cadastrar empresa';
  cancelCompanyEditButton.hidden = true;
  clearCompanyFeedback();
}

async function loadCompanyUsers(cnpj, companyName) {
  // Abre a seção imediatamente e limpa os dados anteriores para não sugerir
  // que a lista antiga pertence à empresa que acabou de ser selecionada.
  companyUsersSection.hidden = false;
  companyUsersTitle.textContent = `Usuários — ${companyName}`;
  companyUsersCount.textContent = 'Carregando usuários...';
  companyUsersList.replaceChildren();
  const loadingRow = document.createElement('tr');
  const loadingCell = document.createElement('td');
  loadingCell.className = 'company-table__message';
  loadingCell.colSpan = 5;
  loadingCell.textContent = 'Carregando usuários...';
  loadingRow.append(loadingCell);
  companyUsersList.append(loadingRow);

  try {
    // Codificar o CNPJ protege os caracteres do identificador no caminho URL.
    const users = await requestCompany(
      `${COMPANY_API_URL}/porcnpj/${encodeURIComponent(cnpj)}/usuarios`,
    );
    // Uma resposta que não seja array não pode ser percorrida com segurança
    // nem contada como uma lista de usuários.
    if (!Array.isArray(users)) {
      throw new Error('A rota de usuários não retornou uma lista JSON.');
    }

    companyUsersList.replaceChildren();
    // Zero resultados também é um retorno bem-sucedido e tem mensagem própria.
    if (users.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.className = 'company-table__message';
      emptyCell.colSpan = 5;
      emptyCell.textContent = 'Esta empresa ainda não possui usuários vinculados.';
      emptyRow.append(emptyCell);
      companyUsersList.append(emptyRow);
      companyUsersCount.textContent = 'Nenhum usuário vinculado';
      return;
    }

    // Renderiza as propriedades esperadas de cada usuário usando células de
    // texto seguro e calcula o total a partir da lista efetivamente recebida.
    users.forEach((user) => {
      const row = document.createElement('tr');
      row.append(
        createCompanyCell(user.id),
        createCompanyCell(user.nome),
        createCompanyCell(user.cpf),
        createCompanyCell(user.dataNascimento),
        createCompanyCell(user.razaoSocialEmpresa),
      );
      companyUsersList.append(row);
    });
    companyUsersCount.textContent = `${users.length} ${users.length === 1 ? 'usuário vinculado' : 'usuários vinculados'}`;
  } catch (error) {
    // A falha fica no contexto da seção de usuários, sem apagar a tabela de
    // empresas que continua sendo útil para a pessoa.
    console.error('Não foi possível carregar os usuários da empresa.', error);
    companyUsersCount.textContent = 'Falha ao carregar usuários';
    const errorRow = document.createElement('tr');
    const errorCell = document.createElement('td');
    errorCell.className = 'company-table__message is-error';
    errorCell.colSpan = 5;
    errorCell.textContent = error instanceof Error
      ? error.message
      : 'Ocorreu um erro inesperado ao consultar os usuários.';
    errorRow.append(errorCell);
    companyUsersList.replaceChildren(errorRow);
  }
}

async function updateCompanyStatus(id, currentStatus) {
  const nextStatus = currentStatus === 'D' ? 'A' : 'D';
  clearCompanyFeedback();

  try {
    await requestCompany(`${COMPANY_API_URL}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status: nextStatus },
    });
    const refreshError = await loadCompanies();
    showCompanyFeedback(
      refreshError
        ? `Empresa ${id} ${nextStatus === 'A' ? 'ativada' : 'desativada'}, mas a lista não pôde ser atualizada: ${refreshError}`
        : `Empresa ${id} ${nextStatus === 'A' ? 'ativada' : 'desativada'} com sucesso.`,
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    console.error('Não foi possível atualizar o status da empresa.', error);
    showCompanyFeedback(
      error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao atualizar o status.',
      'error',
    );
  }
}

async function deleteCompany(id, companyName) {
  if (!window.confirm(`Deseja excluir ${companyName}? A empresa será desativada e continuará no sistema.`)) {
    return;
  }

  clearCompanyFeedback();
  try {
    await requestCompany(`${COMPANY_API_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const refreshError = await loadCompanies();
    showCompanyFeedback(
      refreshError
        ? `Empresa ${id} desativada, mas a lista não pôde ser atualizada: ${refreshError}`
        : `Empresa ${id} desativada com sucesso.`,
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    console.error('Não foi possível excluir a empresa.', error);
    showCompanyFeedback(
      error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao excluir a empresa.',
      'error',
    );
  }
}

// Envia os campos cadastrados para as rotas POST ou PUT da EmpresaController.
companyForm.addEventListener('submit', async (event) => {
  // O envio é tratado no navegador para chamar a API sem recarregar a página.
  event.preventDefault();
  clearCompanyFeedback();
  saveCompanyButton.disabled = true;

  const formData = new FormData(companyForm);
  // FormData lê os campos pelo atributo name; String e trim normalizam os
  // valores para montar o objeto que o Spring receberá como JSON.
  const companyData = {
    razaoSocial: String(formData.get('razaoSocial') || '').trim(),
    nomeFantasia: String(formData.get('nomeFantasia') || '').trim(),
    cnpj: String(formData.get('cnpj') || '').trim(),
    inscricaoEstadual: String(formData.get('inscricaoEstadual') || '').trim(),
  };
  // O mesmo formulário atende cadastro e edição, diferenciados pelo ID salvo
  // quando a pessoa escolhe editar uma linha.
  const isEditing = editingCompanyId !== null;

  try {
    // A edição aponta para /{id} com PUT; o cadastro usa /criar com POST.
    // encodeURIComponent mantém o identificador seguro dentro do caminho.
    const result = await requestCompany(
      isEditing
        ? `${COMPANY_API_URL}/${encodeURIComponent(editingCompanyId)}`
        : `${COMPANY_API_URL}/criar`,
      {
        method: isEditing ? 'PUT' : 'POST',
        body: companyData,
      },
    );

    // O ID pode vir do registro editado ou da resposta de criação; ele é usado
    // apenas para compor o feedback, pois a lista será buscada novamente.
    const savedId = isEditing ? editingCompanyId : result?.id;
    cancelCompanyEdit();
    companyUsersSection.hidden = true;
    // Atualiza os dados exibidos após persistir. Se esta consulta falhar,
    // o feedback distingue a gravação bem-sucedida da lista desatualizada.
    const refreshError = await loadCompanies();
    showCompanyFeedback(
      refreshError
        ? `${isEditing ? 'A empresa foi atualizada' : 'A empresa foi cadastrada'}, mas a lista não pôde ser atualizada: ${refreshError}`
        : result && typeof result === 'object' && (result.menssagem || result.mensagem || result.message)
        ? result.menssagem || result.mensagem || result.message
        : isEditing
          ? `Empresa ${savedId ? `ID ${savedId} ` : ''}atualizada com sucesso.`
          : `Empresa cadastrada com sucesso${savedId ? ` (ID ${savedId})` : ''}.`,
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    // Erros de validação/servidor permanecem visíveis; finally abaixo sempre
    // libera o botão para permitir correção ou nova tentativa.
    console.error(isEditing ? 'Não foi possível atualizar a empresa.' : 'Não foi possível cadastrar a empresa.', error);
    showCompanyFeedback(
      error instanceof Error
        ? error.message
        : `Ocorreu um erro inesperado ao ${isEditing ? 'atualizar' : 'cadastrar'} a empresa.`,
      'error',
    );
  } finally {
    saveCompanyButton.disabled = false;
  }
});

// O botão atualiza a listagem sem recarregar a página inteira.
reloadCompaniesButton.addEventListener('click', loadCompanies);
cancelCompanyEditButton.addEventListener('click', cancelCompanyEdit);

companyList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !button.dataset.id) {
    return;
  }

  if (button.dataset.action === 'edit') {
    startCompanyEdit(button.dataset.id);
  } else if (button.dataset.action === 'users') {
    loadCompanyUsers(button.dataset.cnpj, button.dataset.companyName || `CNPJ ${button.dataset.cnpj}`);
    companyUsersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (button.dataset.action === 'status') {
    updateCompanyStatus(button.dataset.id, button.dataset.status.toUpperCase());
  } else if (button.dataset.action === 'delete') {
    deleteCompany(button.dataset.id, button.dataset.companyName || `empresa ID ${button.dataset.id}`);
  }
});

// Mostra a lista atual assim que a tela termina de carregar.
loadCompanies();
