package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.AtualizaStatusUsuarioRequest;
import com.example.aulajovem2026ia.DTO.UsuarioRequest;
import com.example.aulajovem2026ia.DTO.UsuarioResponse;
import com.example.aulajovem2026ia.entities.Usuario;
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

    @GetMapping
    public List<Usuario> ConsultaUsuario(){
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> ConsultaUsuarioPorId(@PathVariable Long id){
        var usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/empresa/{empresaId}")
    public Usuario ConsultaUsuarioPorEmpresa(@PathVariable Long empresaId){
        Usuario usuarioContrutorCompleto =
                new Usuario("Leandro","0213154545","03/05/1982");
                return  usuarioContrutorCompleto;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse>CadastrarUsuario(@RequestBody UsuarioRequest usuarioRequest){

        Usuario usuarioBanco = new Usuario();
        usuarioBanco.setNome(usuarioRequest.getNome());
        usuarioBanco.setCpf(usuarioRequest.getCpf());
        usuarioBanco.setDataNascimento(usuarioRequest.getDataNascimento());
        usuarioBanco.setSenha(usuarioRequest.getSenha());

        usuarioBanco.setDataCadastro(LocalDateTime.now());
        usuarioBanco.setStatus("A");

        //salvando no banco
        usuarioRepository.save(usuarioBanco);

        return ResponseEntity.ok(new UsuarioResponse(usuarioBanco.getId(),
                "Usuario cadastro com sucesso!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> AtualizarUsuario(@PathVariable Long id, @RequestBody UsuarioRequest usuarioRequest) {

        Usuario usuarioBanco = usuarioRepository.findById(id).orElse(null);


        if (usuarioBanco !=null){
            usuarioBanco.setNome(usuarioRequest.getNome());
            usuarioBanco.setCpf(usuarioRequest.getCpf());
            usuarioBanco.setDataNascimento(usuarioRequest.getDataNascimento());
            usuarioBanco.setDataAtualizacao(LocalDateTime.now());
            usuarioBanco.setSenha(usuarioRequest.getSenha());
            usuarioRepository.save(usuarioBanco);

            return ResponseEntity.ok(new UsuarioResponse(usuarioBanco.getId(),
                    "Usuario Atualizado com sucesso!"));
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
