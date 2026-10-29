// Endereço e caminho do recurso seguem as anotações do ClienteController.
const API_BASE_URL = 'http://localhost:8082';
const CLIENTES_ENDPOINT = '/Cliente';
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

// Usa a credencial guardada pelo login em todas as rotas protegidas do controller.
function authorizationHeader() {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const token = savedToken.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw new Error('Entre pelo login para obter um token antes de consultar os clientes.');
  }
  return `Bearer ${token}`;
}

// Reúne os elementos da tela para evitar repetir consultas ao DOM.
const elementos = {
  tabela: document.getElementById('clients-table'),
  contador: document.getElementById('clients-count'),
  feedback: document.getElementById('feedback'),
  atualizarButton: document.getElementById('reload-button'),
  consultaForm: document.getElementById('lookup-form'),
  consultaId: document.getElementById('lookup-id'),
  detalhes: document.getElementById('client-details'),
  novoButton: document.getElementById('new-client-button'),
  dialog: document.getElementById('client-dialog'),
  form: document.getElementById('client-form'),
  dialogTitle: document.getElementById('dialog-title'),
  id: document.getElementById('client-id'),
  nome: document.getElementById('client-name'),
  documento: document.getElementById('client-document'),
  nascimento: document.getElementById('client-birth-date'),
  renda: document.getElementById('client-income'),
  salvarButton: document.getElementById('save-client-button'),
  fecharButton: document.getElementById('close-dialog'),
  cancelarButton: document.getElementById('cancel-dialog'),
};

// Guarda a resposta da listagem para atualizar a tabela após cada operação.
let clientes = [];

// Exibe avisos e resultados das ações em uma região acessível da página.
function mostrarMensagem(texto, tipo = 'info') {
  elementos.feedback.textContent = texto;
  elementos.feedback.className = `feedback feedback--${tipo}`;
  elementos.feedback.hidden = false;
}

// Remove o aviso atual quando o usuário inicia outra ação.
function limparMensagem() {
  elementos.feedback.textContent = '';
  elementos.feedback.hidden = true;
}

// Converte o corpo de uma resposta para JSON ou texto; DELETE pode não retornar conteúdo.
async function lerResposta(resposta) {
  const texto = await resposta.text();
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

// Traduz erros HTTP comuns em mensagens que ajudam a pessoa a resolver o problema.
function mensagemDeErro(resposta, dados) {
  if (resposta.status === 404) {
    return 'Cliente não encontrado. Confira o ID e tente novamente.';
  }
  if (resposta.status === 400) {
    return 'Os dados enviados são inválidos. Confira os campos do formulário.';
  }
  if (typeof dados === 'string' && dados.trim()) {
    return dados;
  }
  if (dados && typeof dados === 'object') {
    return dados.message || dados.mensagem || `A API retornou o erro HTTP ${resposta.status}.`;
  }
  return `A API retornou o erro HTTP ${resposta.status}.`;
}

// Centraliza fetch, cabeçalhos JSON, leitura de respostas e tratamento de falhas de rede.
async function requisicaoApi(caminho, opcoes = {}) {
  const cabecalhos = new Headers(opcoes.headers || {});
  cabecalhos.set('accept', '*/*');
  cabecalhos.set('Authorization', authorizationHeader());
  if (opcoes.body) cabecalhos.set('Content-Type', 'application/json');

  let resposta;
  try {
    resposta = await fetch(`${API_BASE_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos,
    });
  } catch {
    throw new Error('Não foi possível conectar ao backend. Verifique se a API está ativa em localhost:8082 e se o CORS está configurado.');
  }

  const dados = await lerResposta(resposta);
  if (!resposta.ok) {
    throw new Error(mensagemDeErro(resposta, dados));
  }
  return dados;
}

// Formata valores numéricos de renda sem alterar o valor enviado para o backend.
function formatarRenda(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '-';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero);
}

// Exibe uma mensagem em uma célula que ocupa toda a largura da tabela.
function mostrarEstadoTabela(mensagem) {
  const linha = document.createElement('tr');
  const celula = document.createElement('td');
  celula.colSpan = 7;
  celula.className = 'table-message';
  celula.textContent = mensagem;
  linha.append(celula);
  elementos.tabela.replaceChildren(linha);
}

// Cria células com textContent, evitando que dados da API sejam tratados como HTML.
function adicionarCelula(linha, valor) {
  const celula = document.createElement('td');
  celula.textContent = valor === null || valor === undefined || valor === '' ? '-' : String(valor);
  linha.append(celula);
}

// Monta a tabela usando somente os campos que existem na entidade Cliente.
function renderizarClientes() {
  elementos.contador.textContent =
    `${clientes.length} ${clientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}`;

  if (clientes.length === 0) {
    mostrarEstadoTabela('Nenhum cliente encontrado.');
    return;
  }

  const linhas = clientes.map((cliente) => {
    const linha = document.createElement('tr');
    adicionarCelula(linha, cliente.id);
    adicionarCelula(linha, cliente.nome);
    adicionarCelula(linha, cliente.cpfCnpj);
    adicionarCelula(linha, cliente.dataNascimento);
    adicionarCelula(linha, formatarRenda(cliente.renda));

    const celulaStatus = document.createElement('td');
    const status = document.createElement('span');
    const inativo = cliente.status === 'D';
    status.className = inativo ? 'status status--inactive' : 'status';
    status.textContent = cliente.status || 'A';
    celulaStatus.append(status);
    linha.append(celulaStatus);

    const celulaAcoes = document.createElement('td');
    const acoes = document.createElement('div');
    acoes.className = 'row-actions';
    acoes.append(
      criarBotaoAcao('Editar', 'editar', cliente.id),
      criarBotaoAcao(inativo ? 'Ativar' : 'Desativar', 'status', cliente.id),
      criarBotaoAcao('Excluir', 'excluir', cliente.id, true),
    );
    celulaAcoes.append(acoes);
    linha.append(celulaAcoes);
    return linha;
  });

  elementos.tabela.replaceChildren(...linhas);
}

// Usa atributos data para que o clique seja tratado pelo listener único da tabela.
function criarBotaoAcao(rotulo, acao, id, perigoso = false) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = perigoso ? 'row-action row-action--delete' : 'row-action';
  botao.dataset.action = acao;
  botao.dataset.id = String(id);
  botao.textContent = rotulo;
  return botao;
}

// GET /Cliente: busca todos os clientes e atualiza o conteúdo da tabela.
async function carregarClientes({ manterMensagem = false } = {}) {
  if (!manterMensagem) limparMensagem();
  elementos.contador.textContent = 'Carregando...';
  mostrarEstadoTabela('Carregando clientes...');

  try {
    const resposta = await requisicaoApi(CLIENTES_ENDPOINT);
    if (!Array.isArray(resposta)) {
      throw new Error('A API respondeu em um formato inesperado: era esperada uma lista de clientes.');
    }
    clientes = resposta;
    renderizarClientes();
  } catch (erro) {
    clientes = [];
    elementos.contador.textContent = 'Falha ao carregar';
    mostrarEstadoTabela('Não foi possível carregar a lista.');
    mostrarMensagem(erro.message, 'error');
  }
}

// GET /Cliente/{id}: apresenta os dados da consulta em um cartão de detalhes.
async function consultarCliente(id) {
  elementos.detalhes.replaceChildren();
  const carregando = document.createElement('p');
  carregando.className = 'empty-state';
  carregando.textContent = `Consultando cliente de ID ${id}...`;
  elementos.detalhes.append(carregando);

  try {
    const cliente = await requisicaoApi(`${CLIENTES_ENDPOINT}/${encodeURIComponent(id)}`);
    const campos = [
      ['ID', cliente.id],
      ['Nome', cliente.nome],
      ['CPF/CNPJ', cliente.cpfCnpj],
      ['Data de nascimento', cliente.dataNascimento],
      ['Renda', formatarRenda(cliente.renda)],
      ['Status', cliente.status],
    ];
    const grade = document.createElement('dl');
    grade.className = 'detail-grid';

    campos.forEach(([rotulo, valor]) => {
      const item = document.createElement('div');
      item.className = 'detail-item';
      const titulo = document.createElement('dt');
      titulo.textContent = rotulo;
      const descricao = document.createElement('dd');
      descricao.textContent = valor === null || valor === undefined || valor === ''
        ? '-'
        : String(valor);
      item.append(titulo, descricao);
      grade.append(item);
    });

    elementos.detalhes.replaceChildren(grade);
  } catch (erro) {
    const mensagem = document.createElement('p');
    mensagem.className = 'empty-state';
    mensagem.textContent = erro.message;
    elementos.detalhes.replaceChildren(mensagem);
  }
}

// Limpa os campos e prepara o formulário para a rota POST /Cliente.
function abrirCadastro() {
  elementos.form.reset();
  elementos.id.value = '';
  elementos.dialogTitle.textContent = 'Novo cliente';
  elementos.salvarButton.textContent = 'Salvar cliente';
  elementos.dialog.showModal();
  elementos.nome.focus();
}

// GET /Cliente/{id}: carrega os dados atuais antes de permitir uma atualização.
async function abrirEdicao(id) {
  limparMensagem();
  try {
    const cliente = await requisicaoApi(`${CLIENTES_ENDPOINT}/${encodeURIComponent(id)}`);
    elementos.form.reset();
    elementos.id.value = cliente.id ?? id;
    elementos.nome.value = cliente.nome ?? '';
    elementos.documento.value = cliente.cpfCnpj ?? '';
    elementos.nascimento.value = cliente.dataNascimento ?? '';
    elementos.renda.value = cliente.renda ?? '';
    elementos.dialogTitle.textContent = `Editar cliente #${id}`;
    elementos.salvarButton.textContent = 'Salvar alterações';
    elementos.dialog.showModal();
    elementos.nome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  }
}

// Envia POST para cadastro e PUT/{id} para atualização, usando o mesmo DTO da API.
async function salvarCliente(evento) {
  evento.preventDefault();
  const id = elementos.id.value;
  const payload = {
    nome: elementos.nome.value.trim(),
    cpfCnpj: elementos.documento.value.trim(),
    dataNascimento: elementos.nascimento.value.trim(),
    renda: Number(elementos.renda.value),
  };

  elementos.salvarButton.disabled = true;
  try {
    const resposta = await requisicaoApi(
      id ? `${CLIENTES_ENDPOINT}/${encodeURIComponent(id)}` : CLIENTES_ENDPOINT,
      {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      },
    );

    elementos.dialog.close();
    await carregarClientes({ manterMensagem: true });
    mostrarMensagem(resposta?.mensagem || (id ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.'), 'success');
    if (id) {
      elementos.consultaId.value = id;
      await consultarCliente(id);
    } else if (resposta?.id !== undefined) {
      elementos.consultaId.value = resposta.id;
      await consultarCliente(resposta.id);
    }
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  } finally {
    elementos.salvarButton.disabled = false;
  }
}

// PATCH /Cliente/{id}/status alterna entre ativo (A) e desativado (D).
async function alternarStatus(id) {
  const cliente = clientes.find((item) => String(item.id) === String(id));
  const novoStatus = cliente?.status === 'D' ? 'A' : 'D';

  try {
    const resposta = await requisicaoApi(`${CLIENTES_ENDPOINT}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: novoStatus }),
    });
    await carregarClientes({ manterMensagem: true });
    mostrarMensagem(resposta?.mensagem || 'Status do cliente atualizado com sucesso.', 'success');
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  }
}

// DELETE /Cliente/{id} marca o status como D no backend; não apaga o registro do banco.
async function excluirCliente(id) {
  if (!window.confirm(`Deseja desativar o cliente #${id}?`)) return;

  try {
    await requisicaoApi(`${CLIENTES_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await carregarClientes({ manterMensagem: true });
    mostrarMensagem('Cliente desativado com sucesso.', 'success');
  } catch (erro) {
    mostrarMensagem(erro.message, 'error');
  }
}

// Liga os eventos depois que o HTML já foi interpretado pelo navegador.
elementos.atualizarButton.addEventListener('click', carregarClientes);
elementos.novoButton.addEventListener('click', abrirCadastro);
elementos.form.addEventListener('submit', salvarCliente);
elementos.fecharButton.addEventListener('click', () => elementos.dialog.close());
elementos.cancelarButton.addEventListener('click', () => elementos.dialog.close());

// Impede IDs negativos ou fracionários antes de chamar a rota da API.
elementos.consultaForm.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const id = Number(elementos.consultaId.value);
  if (!Number.isSafeInteger(id) || id < 0) {
    mostrarMensagem('Informe um ID inteiro igual ou maior que zero.', 'error');
    return;
  }
  consultarCliente(id);
});

// Trata ações dos botões dentro da tabela sem criar um listener para cada linha.
elementos.tabela.addEventListener('click', (evento) => {
  const botao = evento.target.closest('button[data-action]');
  if (!botao) return;

  const { action, id } = botao.dataset;
  if (action === 'editar') abrirEdicao(id);
  if (action === 'status') alternarStatus(id);
  if (action === 'excluir') excluirCliente(id);
});

// Ao iniciar, testa explicitamente GET /Cliente/0 e também carrega a listagem completa.
consultarCliente(0);
carregarClientes();
