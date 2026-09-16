package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.entities.Cliente;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.ClienteRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/Cliente")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> ConsultaCliente(){
        return clienteRepository.findAll();
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
