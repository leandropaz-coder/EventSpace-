package com.example.aulajovem2026ia.entities;

public class Cliente {

    public Cliente() {
        this.id = 1L;
    }

    public Cliente(String cliente) {
        this.id = 1000L;
    }

    private Long id;
    private String nome;
    private String cpf;
    private String dataNascimento;

    public Long getId() {
        return this.id;
    }

    public String getNome() {
        return this.nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf(){
        return this.cpf;
    }
    public void setCpf(String cpf){
        this.cpf = cpf;
    }

    public String getDataNascimento(){
        return this.dataNascimento;
    }
    public void setDataNascimento(String dataNascimento){
        this.dataNascimento = dataNascimento;
    }

}// fim da minha classe.
