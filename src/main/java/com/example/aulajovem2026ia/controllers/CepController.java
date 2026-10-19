package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.EnderecoResponse;
import com.example.aulajovem2026ia.entities.Endereco;
import com.example.aulajovem2026ia.service.ViaCepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enderecos")
public class CepController {

    @Autowired
    private ViaCepService viaCepService;

    // Exemplo de chamada GET: http://localhost:8080/api/enderecos/01001000
    @GetMapping("/{cep}")
    public ResponseEntity<EnderecoResponse> buscarCep(@PathVariable String cep) {
        EnderecoResponse endereco = viaCepService.consultarCep(cep);
        return ResponseEntity.ok(endereco);
    }
}
