package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Reserva;
import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva,Long> {

    // Criar para fazer o login
    boolean existsAllByCpfCnpjAndSenha(String cpfCnpj, String senha);

    Optional<Reserva> getReservaByCpfCnpj(String cpfCnpj);

    Optional<List<Reserva>> getReservaByStatus(String status);

}//fim da minha classe.