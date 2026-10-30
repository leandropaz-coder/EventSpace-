package com.example.aulajovem2026ia.controllers;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.example.aulajovem2026ia.DTO.LoginRequest;
import com.example.aulajovem2026ia.DTO.LoginResponse;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
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
//A anotação @Tag do OpenAPI/Swagger agrupa e nomeia esta classe na documentação interativa da API,
//facilitando a visualização dos endpoints relacionados.
@Tag(name = "classe login Controller", description = "Descreve de forma clara e resumida a responsabilidade geral da classe" +
        "(neste caso, o gerenciamento de acessos e autenticação de usuários do EventSpace).")
public class LoginController {

    // Permite consultar usuários no banco para validar as credenciais informadas.
    @Autowired
    private UsuarioRepository usuarioRepository;

    // Disponibiliza a conexão configurada com o banco; atualmente não é usado nesta classe.
    @Autowired
    private DataSource dataSource;

    // Chave secreta usada para assinar o token JWT.
    @Value("${spring.secret}")
    private String secret;

    // Identifica quem emitiu o token JWT.
    @Value("${spring.emissor}")
    private String emissor;

    // Duração do token em minutos, definida nas configurações da aplicação.
    @Value("${spring.tempo}")
    private Long tempo;

    // Recebe as credenciais enviadas no corpo da requisição POST /login.
    @PostMapping
    public ResponseEntity<LoginResponse> logar(@RequestBody LoginRequest loginRequest){

        // Verifica se existe um usuário com o login (CPF) e a senha informados.
        if ( usuarioRepository.existsAllByCpfAndSenha(loginRequest.getLogin(),
                loginRequest.getSenha()) ){

            // Prepara a resposta de sucesso do login.
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMensagem("Bem vindo! Ao sistema de alunos!");

            // Define HMAC256 com a chave secreta configurada para assinar o JWT.
            Algorithm algorithm = Algorithm.HMAC256(secret);

            // Cria o token com emissor, CPF como assunto e data de expiração, e o assina.
            String token = JWT.create()
                    .withIssuer(emissor)
                    .withSubject(loginRequest.getLogin())
                    .withExpiresAt(gerarDataExpiracao())
                    .sign(algorithm);

            // Inclui o token na resposta e retorna HTTP 200.
            loginResponse.setToken(token);

            return ResponseEntity.ok(loginResponse);
        }

        // Credenciais não encontradas: retorna HTTP 401 (não autorizado).
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // Calcula o instante em que o token JWT deixará de ser válido.
    private Instant gerarDataExpiracao(){

        // Obtém a data e hora atuais.
        LocalDateTime dataAtual = LocalDateTime.now();

        // Soma à hora atual o tempo de validade configurado, em minutos.
        LocalDateTime dataFuturoSoma = dataAtual.plusMinutes(tempo);

        // Converte a data calculada para Instant usando o fuso UTC-03:00.
        return dataFuturoSoma.toInstant(ZoneOffset.of("-03:00"));

    }

} //fim da minha classe.
