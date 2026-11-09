package com.example.aulajovem2026ia.DTO;

import com.example.aulajovem2026ia.entities.Empresa;

public class EmpresaConsultaResponse {


    public EmpresaConsultaResponse() {
    }

    public EmpresaConsultaResponse(Empresa empresa) {
        this.cnpj = empresa.getCnpj();
        this.razaoSocial = empresa.getRazaoSocial();
        this.nomeFantasia = empresa.getNomeFantasia();
        this.inscricaoEstadual = empresa.getInscricaoEstadual();
        this.id = empresa.getId();
        this.status = empresa.getStatus();


        if(empresa.getUsuarios()!= null){
            this.quantidadeUsuario = empresa.getUsuarios().size();
        }else {
            this.quantidadeUsuario = 0;
        }
    }

    private Long id;

    private String razaoSocial;

    private String nomeFantasia;

    private String cnpj;

    private String inscricaoEstadual;

    private String status;

    private int quantidadeUsuario;

    public int getQuantidadeUsuario() {
        return quantidadeUsuario;
    }

    public void setQuantidadeUsuario(int quantidadeUsuario) {
        this.quantidadeUsuario = quantidadeUsuario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getInscricaoEstaual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstaual(String inscricaoEstaual) {
        this.inscricaoEstadual = inscricaoEstaual;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}//fim da minha classe.
