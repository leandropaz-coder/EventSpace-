package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Sala;
import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<Sala,Long> {

    // Criar para fazer o login
    boolean existsAllByCpfCnpjAndSenha(String cpfCnpj, String senha);

    Optional<Sala> getSalaByCpfCnpj(String cpfCnpj);

    Optional<List<Sala>> getSalaByStatus(String status);

}//fim da minha classe.
