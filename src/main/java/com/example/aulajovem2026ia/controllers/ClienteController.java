package com.example.aulajovem2026ia.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Cliente")
public class ClienteController {
    @GetMapping
    public String ConsultaCliente(){
        return "Hellor Cliente";
    }
    @GetMapping("/{id}")
    public String ConsultaClientePorID(@PathVariable Long id){
        return "Cliente por ID: " + id;
    }
    @GetMapping("/empresa/{empresaId}")
    public String ConsultaClientePorEmpresa(@PathVariable Long empresaId){
        return "Empresa por ID: " + empresaId;
    }
}
