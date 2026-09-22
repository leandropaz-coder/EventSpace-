package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {

  // Criar para fazer o login
    boolean existsAllByCpfAndSenha(String cpf, String senha);

    Optional<Usuario> getUsuarioByCpf(String cpfCnpj);

    Optional<List<Usuario>> getUsuarioByStatus(String status);

}//fim da minha classe.
