package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @GetMapping
    public String ConsultaUsuario() {
        return "Hellor Word";
    }
    @GetMapping("/{id}")
    public Usuario ConsultaUsuarioPorID(@PathVariable Long id){
        Usuario usuario = new Usuario();
        usuario.setNome("Leandro");
        usuario.setCpf("0213154545");
        usuario.setDataNascimento("03/05/1982");

        return  usuario;
    }

    @GetMapping("/empresa/{empresaId}")
    public Usuario ConsultaUsuarioPorEmpresa(@PathVariable Long empresaId){
        Usuario usuarioContrutorCompleto =
                new Usuario("Leandro","0213154545","03/05/1982");
                return  usuarioContrutorCompleto;
    }

    @PostMapping
    public ResponseEntity<Usuario>CadastrarUsuario(@RequestBody Usuario usuarioRequest){
        return ResponseEntity.ok(usuarioRequest);
    }
}
