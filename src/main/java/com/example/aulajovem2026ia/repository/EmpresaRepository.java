package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa,Long> {

} //fim da minha classe.
