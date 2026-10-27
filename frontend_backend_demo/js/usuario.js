// Endereço base do backend Spring Boot.
const API_BASE_URL = 'http://localhost:8082';
// O token fica no armazenamento local para poder ser compartilhado com o login.
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

// Guarda referências aos elementos HTML usados neste arquivo.
const elementos = {
  tokenForm: document.getElementById('token-form'),
  tokenInput: document.getElementById('api-token'),
  tokenStatus: document.getElementById('token-status'),
  clearTokenButton: document.getElementById('clear-token-button'),
  usersTable: document.getElementById('users-table'),
  usersCount: document.getElementById('users-count'),
  feedback: document.getElementById('feedback'),
  reloadButton: document.getElementById('reload-button'),
  searchForm: document.getElementById('search-form'),
  searchId: document.getElementById('search-id'),
  newUserButton: document.getElementById('new-user-button'),
  dialog: document.getElementById('user-dialog'),
  dialogTitle: document.getElementById('dialog-title'),
  userForm: document.getElementById('user-form'),
  userId: document.getElementById('user-id'),
  userName: document.getElementById('user-name'),
  userCpf: document.getElementById('user-cpf'),
  userBirthDate: document.getElementById('user-birth-date'),
  userCompanyId: document.getElementById('user-company-id'),
  userPassword: document.getElementById('user-password'),
  saveUserButton: document.getElementById('save-user-button'),
  closeDialogButton: document.getElementById('close-dialog'),
  cancelDialogButton: document.getElementById('cancel-dialog'),
};

// Mantém a lista em memória para atualizar a tabela após as ações.
let usuarios = [];

// Recupera o token de autenticação salvo na sessão do navegador.
function obterToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

// Exibe uma mensagem de informação, sucesso ou erro na página.
function mostrarMensagem(mensagem, tipo = 'info') {
  elementos.feedback.textContent = mensagem;
  elementos.feedback.className = `feedback feedback--${tipo}`;
  elementos.feedback.hidden = false;
}

// Esconde e limpa a mensagem atual.
function limparMensagem() {
  elementos.feedback.textContent = '';
  elementos.feedback.hidden = true;
}

// Atualiza o indicador visual da autenticação.
function atualizarEstadoToken(conectado) {
  elementos.tokenStatus.textContent = conectado ? 'Token salvo nesta sessão' : 'Token não informado';
  elementos.tokenStatus.classList.toggle('is-connected', conectado);
}

// Converte erros HTTP em mensagens que ajudam a identificar o problema.
function mensagemErro(response, dados) {
  if (response.status === 401) {
    return 'Token inválido ou expirado. Informe um JWT válido e tente novamente.';
  }
  if (response.status === 403) {
    return 'A API negou o acesso a este recurso.';
  }
  if (response.status === 404) {
    return 'Usuário ou empresa não encontrado. Confira os IDs informados.';
  }
  if (typeof dados === 'string' && dados.trim()) {
    return dados;
  }
  if (dados && typeof dados === 'object') {
    return dados.message || dados.mensagem || JSON.stringify(dados);
  }
  return `A API retornou o erro HTTP ${response.status}.`;
}

// Centraliza as requisições: adiciona o token, envia JSON e trata falhas.
async function requisicaoApi(caminho, opcoes = {}) {
  const token = obterToken();
  if (!token) {
    throw new Error('Informe e conecte um token JWT antes de acessar os usuários.');
  }

  const cabecalhos = new Headers(opcoes.headers || {});
  cabecalhos.set('Authorization', `Bearer ${token}`);
  if (opcoes.body) {
    cabecalhos.set('Content-Type', 'application/json');
  }

  let resposta;
  try {
    resposta = await fetch(`${API_BASE_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos,
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend. Verifique se ele está ativo e se o CORS permite esta página.');
  }

  // Lê primeiro como texto para também lidar com respostas sem corpo, como o DELETE.
  const texto = await resposta.text();
  let dados = null;
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!resposta.ok) {
    throw new Error(mensagemErro(resposta, dados));
  }
  return dados;
}

// Escapa textos antes de inseri-los na tabela, evitando interpretar dados como HTML.
function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Desenha a lista atual de usuários na tabela.
function renderizarUsuarios() {
  elementos.usersCount.textContent =
    `${usuarios.length} ${usuarios.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}`;

  if (usuarios.length === 0) {
    elementos.usersTable.innerHTML =
      '<tr><td class="table-message" colspan="6">Nenhum usuário encontrado.</td></tr>';
    return;
  }

  elementos.usersTable.innerHTML = usuarios.map((usuario) => `
    <tr>
      <td>${escaparHtml(usuario.id)}</td>
      <td>${escaparHtml(usuario.nome || '-')}</td>
      <td>${escaparHtml(usuario.cpf || '-')}</td>
      <td>${escaparHtml(usuario.dataNascimento || '-')}</td>
      <td>${escaparHtml(usuario.razaoSocialEmpresa || `Empresa #${usuario.empresa_id ?? '-'}`)}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-action="edit" data-id="${escaparHtml(usuario.id)}">Editar</button>
          <button class="delete-button" type="button" data-action="delete" data-id="${escaparHtml(usuario.id)}">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// GET /usuarios: busca todos os usuários para preencher a tabela.
async function carregarUsuarios({ manterMensagem = false } = {}) {
  if (!manterMensagem) limparMensagem();
  elementos.usersTable.innerHTML =
    '<tr><td class="table-message" colspan="6">Carregando usuários...</td></tr>';
  elementos.usersCount.textContent = 'Carregando...';

  try {
    const resultado = await requisicaoApi('/usuarios');
    if (!Array.isArray(resultado)) {
      throw new Error('A API respondeu em um formato inesperado: era esperada uma lista de usuários.');
    }
    usuarios = resultado;
    renderizarUsuarios();
  } catch (erro) {
    elementos.usersTable.innerHTML =
      '<tr><td class="table-message" colspan="6">Não foi possível carregar a lista.</td></tr>';
    elementos.usersCount.textContent = 'Falha ao carregar';
    mostrarMensagem(erro.message, 'error');
  }
}

// Prepara o formulário vazio e abre o modal para cadastro.
function abrirCadastro() {
  elementos.userForm.reset();
  elementos.userId.value = '';
  elementos.dialogTitle.textContent = 'Novo usuário';
  elementos.saveUserButton.textContent = 'Salvar usuário';
  elementos.dialog.showModal();
  elementos.userName.focus();
}

// GET /usuarios/{id}: consulta os dados atuais antes de abrir a edição.
async function abrirEdicao(id) {
  limparMensagem();
  try {
    const usuario = await requisicaoApi(`/usuarios/${encodeURIComponent(id)}`);
    if (!usuario || typeof usuario !== 'object') {
      throw new Error('A API não retornou os dados do usuário.');
    }

    elementos.userForm.reset();
    elementos.userId.value = usuario.id ?? id;
    elementos.userName.value = usuario.nome ?? '';
    elementos.userCpf.value = usuario.cpf ?? '';
    elementos.userBirthDate.value = usuario.dataNascimento ?? '';
    elementos.userCompanyId.value = usuario.empresa_id ?? '';
    // A senha não vem no DTO de consulta; por isso deve ser informada novamente.
    elementos.userPassword.value = '';
    elementos.dialogTitle.textContent = `Editar usuário #${usuario.id ?? id}`;
    elementos.saveUserButton.textContent = 'Salvar alterações';
    elementos.dialog.showModal();
    elementos.userName.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  }
}

// Valida o formato de data usado pelo backend: dia/mês/ano.
function dataEstaNoFormatoCorreto(data) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(data);
}

// POST /usuarios ou PUT /usuarios/{id}: envia os campos aceitos pelo UsuarioRequest.
async function salvarUsuario(evento) {
  evento.preventDefault();
  if (!elementos.userForm.reportValidity()) return;

  const id = elementos.userId.value;
  const usuario = {
    nome: elementos.userName.value.trim(),
    cpf: elementos.userCpf.value.trim(),
    dataNascimento: elementos.userBirthDate.value.trim(),
    empresa_id: Number(elementos.userCompanyId.value),
    senha: elementos.userPassword.value,
  };

  if (!dataEstaNoFormatoCorreto(usuario.dataNascimento)) {
    mostrarMensagem('Informe a data de nascimento no formato DD/MM/AAAA.', 'error');
    return;
  }
  if (!Number.isSafeInteger(usuario.empresa_id) || usuario.empresa_id < 1) {
    mostrarMensagem('Informe o ID de uma empresa existente.', 'error');
    return;
  }

  elementos.saveUserButton.disabled = true;
  try {
    const estaEditando = Boolean(id);
    const resultado = await requisicaoApi(
      estaEditando ? `/usuarios/${encodeURIComponent(id)}` : '/usuarios',
      {
        method: estaEditando ? 'PUT' : 'POST',
        body: JSON.stringify(usuario),
      },
    );

    elementos.dialog.close();
    elementos.userForm.reset();
    mostrarMensagem(
      resultado?.mensagem || (estaEditando ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.'),
      'success',
    );
    await carregarUsuarios({ manterMensagem: true });
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  } finally {
    elementos.saveUserButton.disabled = false;
  }
}

// GET /usuarios/{id}: mostra apenas o usuário solicitado na tabela.
async function buscarUsuario(evento) {
  evento.preventDefault();
  const id = elementos.searchId.value.trim();
  if (!id) {
    elementos.searchId.focus();
    return;
  }

  limparMensagem();
  elementos.usersTable.innerHTML =
    '<tr><td class="table-message" colspan="6">Buscando usuário...</td></tr>';

  try {
    const usuario = await requisicaoApi(`/usuarios/${encodeURIComponent(id)}`);
    if (!usuario || typeof usuario !== 'object') {
      throw new Error('A API não retornou os dados do usuário.');
    }
    usuarios = [usuario];
    renderizarUsuarios();
  } catch (erro) {
    usuarios = [];
    renderizarUsuarios();
    mostrarMensagem(erro.message, 'error');
  }
}

// DELETE /usuarios/{id}: confirma e solicita ao backend a desativação lógica.
async function excluirUsuario(id) {
  const usuario = usuarios.find((item) => String(item.id) === String(id));
  const nome = usuario?.nome ? ` "${usuario.nome}"` : '';
  const confirmou = window.confirm(
    `Deseja excluir${nome}? O backend desativará o usuário, sem apagar seus dados.`,
  );
  if (!confirmou) return;

  try {
    await requisicaoApi(`/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' });
    usuarios = usuarios.filter((item) => String(item.id) !== String(id));
    renderizarUsuarios();
    mostrarMensagem('Usuário desativado com sucesso.', 'success');
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  }
}

// Salva o token na sessão e carrega os usuários após a conexão.
elementos.tokenForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const token = elementos.tokenInput.value.trim().replace(/^Bearer\s+/i, '');
  if (!token) return;

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  elementos.tokenInput.value = '';
  atualizarEstadoToken(true);
  await carregarUsuarios();
});

// Remove o token e limpa os dados atualmente exibidos.
elementos.clearTokenButton.addEventListener('click', () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  atualizarEstadoToken(false);
  usuarios = [];
  elementos.usersCount.textContent = 'Aguardando conexão com a API';
  elementos.usersTable.innerHTML =
    '<tr><td class="table-message" colspan="6">Conecte-se à API para carregar os usuários.</td></tr>';
  limparMensagem();
});

// Exige token antes de abrir o cadastro.
elementos.newUserButton.addEventListener('click', () => {
  if (!obterToken()) {
    mostrarMensagem('Conecte-se com um token JWT antes de cadastrar usuários.', 'error');
    elementos.tokenInput.focus();
    return;
  }
  abrirCadastro();
});

// Liga os botões e formulários aos métodos que conversam com a API.
elementos.reloadButton.addEventListener('click', () => carregarUsuarios());
elementos.searchForm.addEventListener('submit', buscarUsuario);
elementos.userForm.addEventListener('submit', salvarUsuario);
elementos.closeDialogButton.addEventListener('click', () => elementos.dialog.close());
elementos.cancelDialogButton.addEventListener('click', () => elementos.dialog.close());

// Um único listener na tabela atende os botões criados dinamicamente.
elementos.usersTable.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-action]');
  if (!botao) return;

  if (botao.dataset.action === 'edit') {
    abrirEdicao(botao.dataset.id);
  } else if (botao.dataset.action === 'delete') {
    excluirUsuario(botao.dataset.id);
  }
});

// Aplica pontuação automática ao CPF enquanto a pessoa digita.
elementos.userCpf.addEventListener('input', () => {
  const numeros = elementos.userCpf.value.replace(/\D/g, '').slice(0, 11);
  elementos.userCpf.value = numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
});

// Insere as barras na data de nascimento conforme os números são digitados.
elementos.userBirthDate.addEventListener('input', () => {
  const numeros = elementos.userBirthDate.value.replace(/\D/g, '').slice(0, 8);
  elementos.userBirthDate.value = numeros
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
});

// Se um token já foi salvo nesta aba, reutiliza-o e carrega a lista.
atualizarEstadoToken(Boolean(obterToken()));
if (obterToken()) {
  carregarUsuarios();
}
