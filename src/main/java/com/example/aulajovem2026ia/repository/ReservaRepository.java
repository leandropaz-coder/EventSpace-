package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Reserva;
import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva,Long> {


}//fim da minha classe.