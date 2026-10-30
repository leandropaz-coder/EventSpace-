package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.*;
import com.example.aulajovem2026ia.entities.Empresa;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.EmpresaRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
//A anotação @Tag do OpenAPI/Swagger agrupa e nomeia esta classe na documentação interativa da API,
//facilitando a visualização dos endpoints relacionados.
@Tag(name = "Usuario Controller", description = "Classe responsavel por fazer o controle do CRUD:" +
        "Create (Criar / Inserir)" +
        "Read (Ler / Consultar)" +
        "Update (Atualizar / Alterar)" +
        "Delete (Apagar / Remover)" +
        " de Usuário")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping
    @Operation(summary = "Listar todos os usuários", description = "Retorna uma lista completa contendo todos os usuários cadastrados na plataforma EventSpace.")
    public List<UsuarioConsultaResponse> ConsultaUsuario(){

        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioConsultaResponse::new).toList();
    }

    @GetMapping("/{id}")
    /**
     * A anotação @Operation do OpenAPI (Swagger) documenta este endpoint específico.
     * - summary: Fornece um título curto e direto sobre o que a operação faz ("Buscar usuário por ID").
     * - description: Detalha o funcionamento técnico do método, indicando que ele realiza uma consulta
     *   por ID utilizando uma variável de caminho (PathVariable) e retorna como resposta um objeto DTO do usuário.
     */
    @Operation(summary = "Buscar Usuário por ID", description = "Medodo de consulta de usuário por ID que retorna " +
            "somente um usuario e recebo como parametro o RPth varieble id e retorna como saida o objeto do DTO X!")
    public ResponseEntity<UsuarioConsultaResponse> ConsultaUsuarioPorId(@PathVariable Long id){
        var usuario = usuarioRepository.findById(id).orElse(null);

        if(usuario == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UsuarioConsultaResponse(usuario));
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Buscar usuários por ID da empresa", description = "Retorna a lista de todos os usuários " +
            "que estão vinculados a uma determinada empresa (empresaId) cadastrada no sistema.")
    public Usuario ConsultaUsuarioPorEmpresa(@PathVariable Long empresaId){
        Usuario usuarioContrutorCompleto =
                new Usuario("Samuel","063720095945459","27/12/1193");
        return usuarioContrutorCompleto;
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo usuário", description = "Cria e registra um novo usuário no banco de dados " +
            "da aplicação a partir das informações enviadas no corpo da requisição.")
    public ResponseEntity<UsuarioResponse> CadastrarUsuario(@RequestBody UsuarioRequest usuarioRequest){

        var empresaBanco = empresaRepository.findById(usuarioRequest.getEmpresa_id()).orElse(null);

        if(empresaBanco == null){
            return ResponseEntity.notFound().build();
        }

        Usuario usuarioBanco = new Usuario();
        usuarioBanco.setNome(usuarioRequest.getNome());
        usuarioBanco.setCpf(usuarioRequest.getCpf());
        usuarioBanco.setDataNascimento(usuarioRequest.getDataNascimento());
        usuarioBanco.setSenha(usuarioRequest.getSenha());
        usuarioBanco.setEmpresa(empresaBanco);

        usuarioBanco.setDataCadastro(LocalDateTime.now());
        usuarioBanco.setStatus("A");

        //salvando no banco
        usuarioRepository.save(usuarioBanco);

        return ResponseEntity.ok(new UsuarioResponse(usuarioBanco.getId(),
                "Cadastro com sucesso!"));
    }

        @PutMapping("/{id}")
        @Operation(summary = "Atualizar usuário por ID", description = "Realiza a atualização completa dos dados cadastrais de um usuário já existente " +
                "(como nome, e-mail, credenciais e dados de contato) identificado pelo seu id.")
        public ResponseEntity<UsuarioResponse>
        AtualizarUsuario(@PathVariable Long id, @RequestBody UsuarioRequest usuarioRequest){
            //Consulta no banco
            Usuario usuarioBanco = usuarioRepository.findById(id).orElse(null);

            if(usuarioBanco != null){

                var empresaBanco = empresaRepository.findById(usuarioRequest.getEmpresa_id()).orElse(null);
    // regras para alterar, o metodo lista usuário, recebe o cnpj
                if(empresaBanco == null){
                    return ResponseEntity.notFound().build();
                }

                usuarioBanco.setEmpresa(empresaBanco);
                usuarioBanco.setNome(usuarioRequest.getNome());
                usuarioBanco.setCpf(usuarioRequest.getCpf());
                usuarioBanco.setDataNascimento(usuarioRequest.getDataNascimento());
                usuarioBanco.setDataAtualizacao(LocalDateTime.now());
                usuarioBanco.setSenha(usuarioRequest.getSenha());
                usuarioRepository.save(usuarioBanco);

                return ResponseEntity.ok(new UsuarioResponse(usuarioBanco.getId(),
                        "UsuarioAtulizado com sucesso!"));
            }
            return ResponseEntity.notFound().build();
        }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Buscar usuários por ID da empresa", description = "Retorna a lista de todos os usuários que estão " +
            "vinculados a uma determinada empresa (empresaId) cadastrada no sistema.")
    public ResponseEntity<UsuarioResponse>
    AtualizarStatus(@PathVariable Long id, @RequestBody AtualizaStatusUsuarioRequest usuarioRequest){

        //Consuta no banco
        Usuario usuarioBanco = usuarioRepository.findById(id).orElse(null);

        if (usuarioBanco !=null){
            usuarioBanco.setStatus(usuarioRequest.getStatus());
            usuarioRepository.save(usuarioBanco);

            return ResponseEntity.ok(new UsuarioResponse(usuarioBanco.getId(),
                    "Status Atualizado com sucesso!"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar usuário por ID", description = "Remove permanentemente o registro de um usuário do sistema com base no id fornecido.")
    public ResponseEntity<UsuarioResponse> deletar(@PathVariable Long id){
        //Consuta no banco
        Usuario usuarioBanco = usuarioRepository.findById(id).orElse(null);

        if (usuarioBanco !=null){
            usuarioBanco.setStatus("D");
            usuarioRepository.save(usuarioBanco);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

} //fim da minha classe.
