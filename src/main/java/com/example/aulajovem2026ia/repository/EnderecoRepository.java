package com.example.aulajovem2026ia.repository;
import com.example.aulajovem2026ia.entities.Endereco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    // Métodos de busca personalizados podem ser adicionados aqui se necessário
}
