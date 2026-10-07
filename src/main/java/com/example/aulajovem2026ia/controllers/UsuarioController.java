package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.*;
import com.example.aulajovem2026ia.entities.Empresa;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.EmpresaRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping
    public List<UsuarioConsultaResponse> ConsultaUsuario(){

        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioConsultaResponse::new).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioConsultaResponse> ConsultaUsuarioPorId(@PathVariable Long id){
        var usuario = usuarioRepository.findById(id).orElse(null);

        if(usuario == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UsuarioConsultaResponse(usuario));
    }

    @GetMapping("/empresa/{empresaId}")
    public Usuario ConsultaUsuarioPorEmpresa(@PathVariable Long empresaId){
        Usuario usuarioContrutorCompleto =
                new Usuario("Samuel","063720095945459","27/12/1193");
        return usuarioContrutorCompleto;
    }

    @PostMapping
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
