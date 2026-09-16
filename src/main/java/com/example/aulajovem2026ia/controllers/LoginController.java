package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.LoginRequest;
import com.example.aulajovem2026ia.DTO.LoginResponse;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<LoginResponse> logar(@RequestBody LoginRequest loginRequest){

        //Usuario usuarioBanco = usuarioRepository.findAll().stream().filter()

        if (usuarioRepository.existsAllByCpfAndSenha(loginRequest.getLogin(),loginRequest.getSenha())) {

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMensagem("Bem vindo! Ao Sistema EventSpace!");

            return ResponseEntity.ok(loginResponse);
    }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

} //fim da minha classe.
