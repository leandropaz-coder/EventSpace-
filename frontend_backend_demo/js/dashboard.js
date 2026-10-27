const sections = {
  home: {
    title: 'Home',
    content: `
      <div class="cards-grid">
        <article class="info-card highlight">
          <span class="card-label">Resumo geral</span>
          <h3>120</h3>
          <p>Alunos ativos no sistema</p>
        </article>

        <article class="info-card">
          <span class="card-label">Cursos</span>
          <h3>18</h3>
          <p>Disciplinas disponíveis</p>
        </article>

        <article class="info-card">
          <span class="card-label">Usuários</span>
          <h3>42</h3>
          <p>Colaboradores cadastrados</p>
        </article>
      </div>

      <div class="panel">
        <h2>Bem-vindo ao painel</h2>
        <p>
          Acompanhe métricas do sistema, gerencie usuários e mantenha as informações do
          ambiente acadêmico organizadas.
        </p>
      </div>
    `,
  },
  curso: {
    title: 'Curso',
    content: `
      <div class="panel">
        <h2>Gerenciamento de cursos</h2>
        <ul class="list">
          <li>Frontend com HTML, CSS e JavaScript</li>
          <li>Backend e integrações com APIs</li>
          <li>Banco de dados e persistência</li>
        </ul>
      </div>
    `,
  },
  usuario: {
    title: 'Usuário',
    content: `
      <section class="usuarios-section">
        <div class="section-header">
          <h2>Usuários</h2>
          <button class="primary-btn" type="button">Adicionar Usuário</button>
        </div>

        <div class="table-wrapper">
          <table class="usuarios-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Data de Nascimento</th>
                <th>Empresa</th>
              </tr>
            </thead>
            <tbody id="usuariosTableBody">
              <tr>
                <td colspan="5" class="table-empty">Carregando usuários...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `,
  },
  empresa: {
    title: 'Empresa',
    content: `
      <div class="panel">
        <h2>Dados da empresa</h2>
        <p>Nome: Tech Academy</p>
        <p>Setor: Educação e tecnologia</p>
        <p>Localização: São Paulo - SP</p>
      </div>
    `,
  },
};

const pageTitle = document.getElementById('pageTitle');
const pageContent = document.getElementById('pageContent');
const navItems = document.querySelectorAll('.nav-item');

if (sessionStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = 'index.html';
}

function renderSection(sectionKey) {
  const section = sections[sectionKey] || sections.home;

  pageTitle.textContent = section.title;
  pageContent.innerHTML = section.content;

  navItems.forEach((button) => {
    const isActive = button.dataset.section === sectionKey;
    button.classList.toggle('active', isActive);
  });

  if (sectionKey === 'usuario') {
    carregarUsuarios();
  }
}

function logoutUsuario() {
  sessionStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
}

renderSection('home');