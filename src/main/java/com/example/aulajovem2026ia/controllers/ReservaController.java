package com.example.aulajovem2026ia.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Reserva")
public class ReservaController {
        @GetMapping
        public String ConsultaReservaPorID(@PathVariable Long id){
            return "Reserve por ID: " + id;
        }
        @GetMapping("/empresa/{empresaId}")
        public  String ConsultaReservaPorEmpresa(@PathVariable Long empresaId){
            return "Empresa por ID: " + empresaId;
    }
}
