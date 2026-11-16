# EventSpace — Front-end

Interface web do **EventSpace**, um sistema de gerenciamento de espaços corporativos. O projeto reúne telas para administrar salas, empresas, usuários, clientes, cursos e reservas, além de páginas de acesso e acompanhamento.

Este front-end consome a API REST do back-end Java Spring Boot, esperado por padrão em `http://localhost:8082`.

## Tecnologias

- **HTML5** para a estrutura e os formulários das páginas.
- **CSS3** para os estilos, a adaptação a diferentes telas e a identidade visual compartilhada.
- **JavaScript puro (Vanilla JS)** para eventos, validações e atualização da interface.
- **REST com `fetch()`** para enviar e receber dados JSON da API, sem uma biblioteca de cliente HTTP.

## Organização do projeto

As páginas HTML ficam na raiz desta pasta. Estilos e scripts são agrupados em diretórios próprios:

```text
frontend_backend_demo/
├── index.html             # Login
├── menu.html              # Menu inicial
├── painel.html            # Painel com indicadores e carrossel
├── sala.html              # Cadastro e consulta de salas
├── empresa.html           # Cadastro e gerenciamento de empresas
├── usuario.html           # Gerenciamento de usuários
├── cliente.html           # Gerenciamento de clientes
├── curso.html             # Gerenciamento de cursos
├── reserva.html           # Gerenciamento de reservas
├── dashboard.html         # Visão integrada de módulos
├── css/                   # Estilos específicos e compartilhados
└── js/                    # Lógica das páginas e comunicação com a API
```

Em `css/`, arquivos como `theme.css` concentram estilos e cores compartilhados; os demais arquivos cuidam da apresentação de páginas ou módulos específicos. Em `js/`, os scripts correspondem às telas (por exemplo, `sala.js`, `empresa.js` e `painel.js`) e implementam chamadas à API, manipulação de formulários e atualização do DOM. Algumas telas também compartilham comportamentos de navegação.

## Identidade visual

A interface usa tons de **dourado e mostarda** para ações e destaques, sobre superfícies brancas e um **fundo cinza-claro**. O menu lateral utiliza azul-marinho `#0b132b`. As cores e outros valores visuais compartilhados são definidos em `css/theme.css`.

## Como executar

1. Inicie o back-end Spring Boot e confirme que a API está disponível em `http://localhost:8082`.
2. Abra a pasta `frontend_backend_demo` no VS Code.
3. Sirva os arquivos HTML por um servidor local de desenvolvimento, como a extensão **Live Server** do VS Code. Abra `index.html` pelo endereço servido (por exemplo, `http://127.0.0.1:5500/index.html`), em vez de abrir como `file://`.
4. Entre pela tela de login. As telas protegidas usam o token de autenticação recebido do back-end para consultar e alterar dados.

Se o navegador bloquear as requisições, confira se o back-end está ativo, se a URL base configurada nos scripts continua sendo `http://localhost:8082` e se o CORS do Spring Boot permite a origem e a porta usadas pelo servidor local do front-end.

> **Nota:** a URL da API está definida nos scripts JavaScript. Se o back-end usar outra porta ou endereço, atualize essa configuração para que as chamadas `fetch()` apontem para a origem correta.
