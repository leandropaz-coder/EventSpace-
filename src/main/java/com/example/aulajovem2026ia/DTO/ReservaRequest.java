package com.example.aulajovem2026ia.DTO;

import com.example.aulajovem2026ia.entities.Reserva;

public class ReservaRequest {

    public ReservaRequest(){}

    private String nome;
    private String cpf;
    private String codigo;

    public String getNome() {return nome;}
    public void setNome(String nome) {this.nome = nome;}

    public String getCpf() {return cpf;}
    public void setCpf(String cpf) {this.cpf = cpf;}

    public String getCodigo() {return codigo;}
    public void setCodigo(String codigo) {this.codigo = codigo;}

} //fim da minha classe.