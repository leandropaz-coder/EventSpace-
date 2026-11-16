const API_BASE_URL = 'http://localhost:8082';
const CURSOS_ENDPOINT = `${API_BASE_URL}/curso`;
const TOKEN_STORAGE_KEY = 'eventspace.jwt';

const courseDialog = document.getElementById('course-dialog');
const courseForm = document.getElementById('course-form');
const coursesTable = document.getElementById('courses-table');
const coursesCount = document.getElementById('courses-count');
const feedback = document.getElementById('feedback');
const saveCourseButton = document.getElementById('save-course-button');
const courseDetail = document.getElementById('course-detail');
const courseDetailTitle = document.getElementById('course-detail-title');
const courseDetailCount = document.getElementById('course-detail-count');
const courseStudents = document.getElementById('course-students');
const courseEnrollment = document.getElementById('course-enrollment');
const enrollmentForm = document.getElementById('enrollment-form');
const enrollButton = document.getElementById('enroll-button');

function authorizationHeader() {
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  const token = savedToken.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    throw new Error('Entre pelo login para obter um token antes de consultar os cursos.');
  }
  return `Bearer ${token}`;
}

async function requestCurso(url, options = {}) {
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      accept: 'application/json',
      Authorization: authorizationHeader(),
    },
  };

  if (options.body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json';
    requestOptions.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } catch (error) {
    throw new Error(
      `Não foi possível conectar à API em ${API_BASE_URL}. Verifique se o backend está ativo. Detalhe: ${error.message}`
    );
  }

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

function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
  row.append(cell);
  return cell;
}

function createCourseAction(label, action, id, course) {
  const button = document.createElement('button');
  button.className = action === 'deactivate' ? 'button button--danger' : 'button button--secondary';
  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = String(id);
  button.dataset.status = course.status || 'A';
  button.dataset.courseTitle = course.titulo || '';
  button.disabled = !id;
  button.setAttribute('aria-label', `${label} curso ${course.titulo || id}`);
  return button;
}

function renderTableMessage(message, isError = false) {
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = `table-message${isError ? ' error-text' : ''}`;
  cell.colSpan = 6;
  cell.textContent = message;
  row.append(cell);
  coursesTable.replaceChildren(row);
}

function renderCursos(cursos) {
  coursesTable.replaceChildren();

  if (cursos.length === 0) {
    renderTableMessage('Nenhum curso encontrado.');
    coursesCount.textContent = '0 cursos encontrados';
    return;
  }

  cursos.forEach((curso) => {
    const row = document.createElement('tr');
    const id = curso.id === null || curso.id === undefined ? '' : String(curso.id);
    const status = String(curso.status || 'A').toUpperCase();
    appendCell(row, curso.id);
    appendCell(row, curso.titulo);
    appendCell(row, curso.descricao);
    appendCell(row, Array.isArray(curso.usuarios) ? curso.usuarios.length : 0);

    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge${status === 'D' ? ' status-badge--inactive' : ''}`;
    statusBadge.textContent = status === 'D' ? 'Inativo' : 'Ativo';
    statusCell.append(statusBadge);
    row.append(statusCell);

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'row-actions course-actions';
    const detailsButton = createCourseAction('Alunos', 'details', id, curso);
    const editButton = createCourseAction('Editar', 'edit', id, curso);
    const enrollAction = createCourseAction('Matricular', 'enroll', id, curso);
    const statusButton = createCourseAction(status === 'D' ? 'Ativar' : 'Desativar', 'status', id, curso);
    const deactivateButton = createCourseAction('Desativar', 'deactivate', id, curso);
    enrollAction.disabled = !id || status === 'D';
    deactivateButton.disabled = !id || status === 'D';
    actions.append(detailsButton, editButton, enrollAction, statusButton, deactivateButton);
    actionsCell.append(actions);
    row.append(actionsCell);
    coursesTable.append(row);
  });

  coursesCount.textContent = `${cursos.length} ${cursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`;
}

async function carregarCursos({ reportError = true } = {}) {
  coursesCount.textContent = 'Carregando cursos...';
  renderTableMessage('Carregando cursos...');

  try {
    const cursos = await requestCurso(CURSOS_ENDPOINT);
    if (!Array.isArray(cursos)) {
      throw new Error('A rota GET /curso precisa retornar uma lista JSON.');
    }
    renderCursos(cursos);
    if (reportError) clearFeedback();
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao consultar os cursos.';
    renderTableMessage(message, true);
    coursesCount.textContent = 'Não foi possível carregar os cursos';
    if (reportError) showFeedback(message, 'error');
    return message;
  }
}

function abrirFormularioNovo() {
  courseForm.reset();
  document.getElementById('course-id').value = '';
  document.getElementById('dialog-title').textContent = 'Novo curso';
  saveCourseButton.textContent = 'Salvar curso';
  clearFeedback();
  courseDialog.showModal();
  document.getElementById('course-title').focus();
}

async function buscarCursoPorId(id) {
  const curso = await requestCurso(`${CURSOS_ENDPOINT}/${encodeURIComponent(id)}`);
  if (!curso || typeof curso !== 'object' || Array.isArray(curso)) {
    throw new Error('A API não retornou os dados do curso em formato de objeto JSON.');
  }
  return curso;
}

async function abrirFormularioEdicao(id) {
  clearFeedback();
  try {
    const curso = await buscarCursoPorId(id);
    courseForm.reset();
    document.getElementById('course-id').value = curso.id ?? id;
    document.getElementById('course-title').value = curso.titulo ?? '';
    document.getElementById('course-description').value = curso.descricao ?? '';
    document.getElementById('dialog-title').textContent = `Editar curso ${curso.id ?? id}`;
    saveCourseButton.textContent = 'Salvar alterações';
    courseDialog.showModal();
    document.getElementById('course-title').focus();
  } catch (error) {
    showFeedback(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao consultar o curso.', 'error');
  }
}

async function mostrarAlunosCurso(id) {
  clearFeedback();
  try {
    const curso = await buscarCursoPorId(id);
    const alunos = Array.isArray(curso.usuarios) ? curso.usuarios : [];
    courseDetail.hidden = false;
    courseDetailTitle.textContent = `Alunos matriculados — ${curso.titulo || `Curso ${id}`}`;
    courseDetailCount.textContent = `${alunos.length} ${alunos.length === 1 ? 'aluno matriculado' : 'alunos matriculados'}`;
    courseStudents.replaceChildren();

    if (alunos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.className = 'table-message';
      cell.colSpan = 4;
      cell.textContent = 'Este curso ainda não possui alunos matriculados.';
      row.append(cell);
      courseStudents.append(row);
    } else {
      alunos.forEach((aluno) => {
        const row = document.createElement('tr');
        appendCell(row, aluno.id);
        appendCell(row, aluno.nome);
        appendCell(row, aluno.cpf);
        appendCell(row, aluno.dataNascimento);
        courseStudents.append(row);
      });
    }
    courseDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao consultar os alunos.';
    showFeedback(message, 'error');
    return message;
  }
}

function abrirFormularioMatricula(id, status) {
  if (String(status).toUpperCase() === 'D') {
    showFeedback('Não é possível realizar matrícula em um curso inativo.', 'error');
    return;
  }
  enrollmentForm.reset();
  document.getElementById('enrollment-course-id').value = id;
  courseEnrollment.hidden = false;
  courseEnrollment.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('enrollment-user-id').focus();
}

async function desativarCurso(id, titulo) {
  if (!window.confirm(`Deseja desativar ${titulo}? O curso e suas matrículas serão preservados.`)) {
    return;
  }

  clearFeedback();
  try {
    await requestCurso(`${CURSOS_ENDPOINT}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const refreshError = await carregarCursos({ reportError: false });
    showFeedback(
      refreshError ? `Curso desativado, mas a lista não pôde ser atualizada: ${refreshError}` : 'Curso desativado com sucesso.',
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    showFeedback(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao desativar o curso.', 'error');
  }
}

async function atualizarStatusCurso(id, status) {
  const nextStatus = String(status).toUpperCase() === 'D' ? 'A' : 'D';
  clearFeedback();
  try {
    await requestCurso(`${CURSOS_ENDPOINT}/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status: nextStatus },
    });
    const refreshError = await carregarCursos({ reportError: false });
    showFeedback(
      refreshError
        ? `Status atualizado, mas a lista não pôde ser atualizada: ${refreshError}`
        : `Curso ${nextStatus === 'A' ? 'ativado' : 'desativado'} com sucesso.`,
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    showFeedback(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao atualizar o status.', 'error');
  }
}

courseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFeedback();
  saveCourseButton.disabled = true;
  const curso = {
    titulo: document.getElementById('course-title').value.trim(),
    descricao: document.getElementById('course-description').value.trim(),
  };
  const id = document.getElementById('course-id').value;
  const isEditing = Boolean(id);

  try {
    const result = await requestCurso(
      isEditing ? `${CURSOS_ENDPOINT}/${encodeURIComponent(id)}` : CURSOS_ENDPOINT,
      { method: isEditing ? 'PUT' : 'POST', body: curso },
    );
    const refreshError = await carregarCursos({ reportError: false });
    courseDialog.close();
    showFeedback(
      refreshError
        ? `Curso ${isEditing ? 'salvo' : 'cadastrado'}, mas a lista não pôde ser atualizada: ${refreshError}`
        : result && typeof result === 'object' && result.mensagem
          ? result.mensagem
          : isEditing ? 'Curso atualizado com sucesso.' : 'Curso cadastrado com sucesso.',
      refreshError ? 'error' : 'success',
    );
  } catch (error) {
    showFeedback(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao salvar o curso.', 'error');
  } finally {
    saveCourseButton.disabled = false;
    saveCourseButton.textContent = isEditing ? 'Salvar alterações' : 'Salvar curso';
  }
});

enrollmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFeedback();
  enrollButton.disabled = true;
  const request = {
    curso_id: Number(document.getElementById('enrollment-course-id').value),
    usuario_id: Number(document.getElementById('enrollment-user-id').value),
  };

  try {
    const result = await requestCurso(`${CURSOS_ENDPOINT}/matricula`, {
      method: 'POST',
      body: request,
    });
    const refreshError = await carregarCursos({ reportError: false });
    const detailError = await mostrarAlunosCurso(request.curso_id);
    const refreshMessage = refreshError || detailError;
    showFeedback(
      refreshMessage
        ? `Matrícula realizada, mas os dados não puderam ser atualizados: ${refreshMessage}`
        : result && typeof result === 'object' && result.mensagem
          ? result.mensagem
          : 'Matrícula realizada com sucesso.',
      refreshMessage ? 'error' : 'success',
    );
    enrollmentForm.reset();
    courseEnrollment.hidden = true;
  } catch (error) {
    showFeedback(error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao realizar a matrícula.', 'error');
  } finally {
    enrollButton.disabled = false;
  }
});

document.getElementById('new-course-button').addEventListener('click', abrirFormularioNovo);
document.getElementById('reload-button').addEventListener('click', () => carregarCursos());
document.getElementById('close-dialog').addEventListener('click', () => courseDialog.close());
document.getElementById('cancel-dialog').addEventListener('click', () => courseDialog.close());

document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = document.getElementById('search-id').value.trim();
  if (!id) {
    await carregarCursos();
    return;
  }

  clearFeedback();
  coursesCount.textContent = 'Buscando curso...';
  renderTableMessage('Buscando curso...');
  try {
    const curso = await buscarCursoPorId(id);
    renderCursos([{ ...curso, id: curso.id ?? id }]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao buscar o curso.';
    renderTableMessage(message, true);
    coursesCount.textContent = 'Curso não encontrado';
    showFeedback(message, 'error');
  }
});

coursesTable.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !button.dataset.id) return;

  if (button.dataset.action === 'details') {
    mostrarAlunosCurso(button.dataset.id);
  } else if (button.dataset.action === 'edit') {
    abrirFormularioEdicao(button.dataset.id);
  } else if (button.dataset.action === 'enroll') {
    abrirFormularioMatricula(button.dataset.id, button.dataset.status);
  } else if (button.dataset.action === 'status') {
    atualizarStatusCurso(button.dataset.id, button.dataset.status);
  } else if (button.dataset.action === 'deactivate') {
    desativarCurso(button.dataset.id, button.dataset.courseTitle || `curso ${button.dataset.id}`);
  }
});

carregarCursos();
