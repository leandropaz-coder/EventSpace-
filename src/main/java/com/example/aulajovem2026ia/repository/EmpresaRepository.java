package com.example.aulajovem2026ia.repository;

import com.example.aulajovem2026ia.entities.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa,Long> {
    // Procurar se a empresa existe.Como fazer?Pq não temos uma consulta no CNPJ.Criar dessa maneira:
    //Consulta empresa por cnpj
    Optional<Empresa> getEmpresaByCnpj(String cnpj);




} //fim da minha classe.
