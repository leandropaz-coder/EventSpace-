// Endereço do backend e endpoint definido em LoginController: POST /login.
const LOGIN_API_URL = 'http://localhost:8082/login';
// Nome usado também pela tela de usuários para recuperar o token salvo.
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

// Obtém os elementos do formulário que serão usados durante o login.
const loginForm = document.getElementById('login-form');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('senha');
const feedback = document.getElementById('feedback');
const submitButton = document.getElementById('submit-button');
const buttonLabel = document.getElementById('button-label');

// Mostra uma mensagem acessível para informar o andamento ou o resultado.
function showFeedback(message, type = 'info') {
  feedback.textContent = message;
  feedback.className = `feedback feedback--${type}`;
  feedback.hidden = false;
}

// Converte a resposta de erro do servidor em uma mensagem compreensível.
function getErrorMessage(status, responseBody) {
  if (status === 401) {
    return 'CPF ou senha incorretos. Confira os dados e tente novamente.';
  }
  if (status === 404) {
    return 'O endpoint de login não foi encontrado. Confira a configuração do backend.';
  }
  if (typeof responseBody === 'string' && responseBody.trim()) {
    return responseBody;
  }
  if (responseBody && typeof responseBody === 'object') {
    return responseBody.message || responseBody.mensagem || `Não foi possível entrar (HTTP ${status}).`;
  }
  return `Não foi possível entrar (HTTP ${status}). Tente novamente.`;
}

// Impede o envio tradicional do navegador e autentica usando a API.
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // O LoginRequest do backend espera as propriedades "login" e "senha".
  const login = loginInput.value.trim();
  // Não removemos espaços da senha, pois podem fazer parte da credencial.
  const senha = passwordInput.value;

  if (!login || !senha) {
    showFeedback('Informe seu CPF e sua senha para continuar.', 'error');
    return;
  }

  // Evita envios duplicados e informa que a autenticação está em andamento.
  submitButton.disabled = true;
  buttonLabel.textContent = 'Verificando...';
  showFeedback('Validando suas credenciais...', 'info');

  try {
    // Envia JSON para o método POST mapeado em /login.
    const response = await fetch(LOGIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, senha }),
    });

    // A resposta pode ser JSON, texto simples ou vazia em caso de erro.
    const responseText = await response.text();
    let data = null;
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }

    // Para status de erro, mostra uma mensagem sem tentar redirecionar.
    if (!response.ok) {
      throw new Error(getErrorMessage(response.status, data));
    }

    // O contrato de LoginResponse contém o JWT na propriedade "token".
    if (!data || typeof data.token !== 'string' || !data.token.trim()) {
      throw new Error('O servidor respondeu sem um token de autenticação. Verifique a resposta do LoginController.');
    }

    // A tela de usuários utiliza a mesma chave para enviar Authorization: Bearer.
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    } catch {
      throw new Error('Não foi possível salvar a sessão neste navegador. Verifique as permissões de armazenamento.');
    }

    showFeedback(data.mensagem || 'Login realizado com sucesso. Redirecionando...', 'success');

    // Abre o painel principal após salvar o token JWT.
    window.setTimeout(() => {
      window.location.href = 'painel.html';
    }, 450);
  } catch (error) {
    // Falhas de rede (incluindo CORS ou servidor desligado) normalmente são TypeError.
    if (error instanceof TypeError) {
      showFeedback('Não foi possível conectar ao servidor. Verifique se o backend está ativo em http://localhost:8082.', 'error');
    } else {
      showFeedback(error.message || 'Ocorreu um erro ao tentar entrar.', 'error');
    }
  } finally {
    // Reabilita o botão quando ocorre falha. Em caso de sucesso, a navegação começará logo.
    submitButton.disabled = false;
    buttonLabel.textContent = 'Entrar';
  }
});
