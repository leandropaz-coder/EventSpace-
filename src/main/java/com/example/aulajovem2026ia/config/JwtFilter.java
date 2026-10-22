package com.example.aulajovem2026ia.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.sql.model.PreparableMutationOperation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// FILTER É PARA CONTROLAR NOSSA REQUISIÇÃO.
@Component
public class JwtFilter extends OncePerRequestFilter {

    // Chave usada para conferir a assinatura HMAC256 dos tokens recebidos.
    @Value("${spring.secret}")
    private String secret;

    // Emissor esperado: tokens assinados por outro emissor não serão aceitos.
    @Value("${spring.emissor}")
    private String emissor;

    // Tempo configurado para a validade do token; a expiração é criada no LoginController.
    @Value("${spring.tempo}")
    private Long tempo;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // Obtém o caminho requisitado para identificar endpoints que não exigem JWT.
        String caminho = request.getRequestURI();

        // Permite login, documentação da API e requisições CORS de preflight sem token.
        if(caminho.equals("/login") ||
                caminho.startsWith("/swagger-ui") ||
                caminho.startsWith("/webjars") ||
                caminho.startsWith("/swagger-resources") ||
                caminho.startsWith("/v3/api-docs")||
                request.getMethod().startsWith("OPTIONS")
        ){
            filterChain.doFilter(request,response);
            return;
        }

        // Lê o cabeçalho de autenticação enviado pelo cliente.
        String headerToken = request.getHeader("Authorization");

        // Continua a validação somente quando o cabeçalho usa o esquema Bearer.
        if (headerToken!= null && headerToken.startsWith("Bearer")){

            // Remove o prefixo Bearer para obter apenas o JWT.
            String token = headerToken.replace("Bearer ","");


            // Cria o algoritmo de verificação com a mesma chave usada ao assinar o token.
            Algorithm algorithm = Algorithm.HMAC256(secret);

            // Configura a validação para aceitar somente tokens do emissor esperado.
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(emissor)
                    .build();

            // Verifica assinatura, emissor e validade; token inválido gera erro de validação.
            var resultado = verifier.verify(token);

            // Registra o assunto do token validado para diagnóstico.
            System.out.println(resultado.getSubject());


        }else {
            // Sem token Bearer, interrompe a requisição e responde com HTTP 401.
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token invalido!");
            return;
        }

        // Após a autenticação, permite que a requisição continue até o controller.
        filterChain.doFilter(request,response);




    }
}
