package com.example.aulajovem2026ia.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.service.annotation.GetExchange;

@RestController
@RequestMapping("/Salas")
public class SalaController {

   @GetMapping
    public String ConsultaSala(){
       return "Hellor Sala";
   }
   @GetMapping("/{id}")
    public String ConsultaSalaPorID(@PathVariable Long id){
       return "Sala por ID: " + id;
   }
   @GetMapping("/empresa/{empresaId}")
    public String ConsultaSalaPorEmpresa(@PathVariable Long empresaId){
       return "Empresa por ID: " + empresaId;
   }

}
