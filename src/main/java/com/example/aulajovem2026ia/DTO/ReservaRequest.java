package com.example.aulajovem2026ia.DTO;

import com.example.aulajovem2026ia.entities.Reserva;

public class ReservaRequest {

    public ReservaRequest(){}

    private String nome;
    private String cpfCnpj;
    private String codigo;
    private String status;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpfCnpj() {
        return cpfCnpj;
    }

    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} //fim da minha classe.