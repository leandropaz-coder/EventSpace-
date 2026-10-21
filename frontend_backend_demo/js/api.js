const LOGIN_API_URL = "http://localhost:8082/login";

async function request({ method = 'GET', endpoint, body = null, headers = {} }) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      throw new Error(
          typeof data === 'string'
              ? data
              : JSON.stringify(data, null, 2)
      );
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

async function login(payload) {
  return request({
    method: 'POST',
    endpoint: '/login',
    body: payload,
  });
}

async function getUsuarios() {
  return request({
    method: 'GET',
    endpoint: '/usuarios',
  });
}
