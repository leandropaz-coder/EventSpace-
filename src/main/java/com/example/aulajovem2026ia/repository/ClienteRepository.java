package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Cliente;
import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente,Long> {


    Optional<Cliente> getClienteByCpfCnpj(String cpfCnpj);

    Optional<List<Cliente>> getClienteByStatus(String status);
}