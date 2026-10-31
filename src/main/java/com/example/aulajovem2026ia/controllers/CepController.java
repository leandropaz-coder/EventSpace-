package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.EnderecoResponse;
import com.example.aulajovem2026ia.entities.Endereco;
import com.example.aulajovem2026ia.service.ViaCepService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/enderecos")
@Tag(name = "Cep Controller", description = "Gerencia as consultas de CEP para preenchimento automático de endereços, " +
        "integrando a busca de dados postais aos formulários de cadastro do sistema EventSpace.")
public class CepController {

    @Autowired
    private ViaCepService viaCepService;

    // Exemplo de chamada GET: http://localhost:8080/api/enderecos/01001000
    @GetMapping("/{cep}")
    @Operation(summary = "Buscar endereço por CEP", description = "Consulta e retorna os dados detalhados de endereço " +
            "(como logradouro, bairro, cidade e estado) com base no número de CEP informado.")
    public ResponseEntity<EnderecoResponse> buscarCep(@PathVariable String cep) {
        EnderecoResponse endereco = viaCepService.consultarCep(cep);
        return ResponseEntity.ok(endereco);
    }
}
