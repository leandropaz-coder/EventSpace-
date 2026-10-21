package com.example.aulajovem2026ia.config;

import com.auth0.jwt.algorithms.Algorithm;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.sql.model.PreparableMutationOperation;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// FILTER É PARA CONTROLAR NOSSA REQUISIÇÃO.
public class JwtFilter extends OncePerRequestFilter {


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String caminho = request.getRequestURI();

        if (caminho.equals("/login") ||
                caminho.equals("/cursos")

        ) {
            filterChain.doFilter(request, response);
            return;
        }

        String headerToken = request.getHeader("Authorizartion");

        if (headerToken != null && headerToken.startsWith("Bearer")){
            String token = headerToken.replace("Bearer", "");

            Algorithm algorithm = Algorithm.HMAC256()

    }else{
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token invalido!");
            return;
        }



    }
}
