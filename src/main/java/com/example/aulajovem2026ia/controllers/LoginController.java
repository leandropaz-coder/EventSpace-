package com.example.aulajovem2026ia.controllers;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.example.aulajovem2026ia.DTO.LoginRequest;
import com.example.aulajovem2026ia.DTO.LoginResponse;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DataSource dataSource;

// para criar o token criar token secret, emissor e tempo.
    @Value("{spring.secret}")
    private String secret;

    @Value("{spring.emissor}")
    private String emissor;

    @Value("{spring.tempo}")
    private Long tempo;

    @PostMapping
    public ResponseEntity<LoginResponse> logar(@RequestBody LoginRequest loginRequest){

        //Usuario usuarioBanco = usuarioRepository.findAll().stream().filter()

        if (usuarioRepository.existsAllByCpfAndSenha(loginRequest.getLogin(),loginRequest.getSenha())) {

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMensagem("Bem vindo! Ao Sistema EventSpace!");


// autenticar login  no token
//JWT metodo
            Algorithm algorithm = Algorithm.HMAC256(secret);

            String token = JWT.create()
                    .withIssuer(emissor)
                    .withSubject(loginRequest.getLogin())
                    .withExpiresAt(gerarDataExpiracao())
                    .sign(algorithm);

            loginResponse.setToken(token);


            return ResponseEntity.ok(loginResponse);
    }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    // DETERMINA A DATA ATUAL.
    private Instant gerarDataExpiracao(){

        LocalDateTime dataAtual = LocalDateTime.now();

        LocalDateTime dataFuturoSoma = dataAtual.plusMinutes(tempo);

        return dataFuturoSoma.toInstant(ZoneOffset.of("-03:00"));


    }

} //fim da minha classe.
