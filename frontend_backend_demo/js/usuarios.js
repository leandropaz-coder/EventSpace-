async function carregarUsuarios() {
    const tbody = document.getElementById('usuariosTableBody');

    if (!tbody) return;

    tbody.innerHTML = `
    <tr>
      <td colspan="5" class="table-empty">Carregando usuários...</td>
    </tr>
  `;

    try {
        const usuarios = await getUsuarios();

        const lista = Array.isArray(usuarios) ? usuarios : [];

        if (!lista.length) {
            tbody.innerHTML = `
        <tr>
          <td colspan="5" class="table-empty">Nenhum usuário encontrado.</td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = lista
            .map((usuario) => `
        <tr>
          <td>${usuario.id ?? '-'}</td>
          <td>${usuario.nome ?? '-'}</td>
          <td>${usuario.cpf ?? '-'}</td>
          <td>${usuario.dataNascimento ?? '-'}</td>
          <td>${usuario.razaoSocialEmpresa ?? 'Sem empresa'}</td>
        </tr>
      `)
            .join('');
    } catch (error) {
        tbody.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty error-text">
          ${error.message || 'Erro ao carregar usuários.'}
        </td>
      </tr>
    `;
    }
}