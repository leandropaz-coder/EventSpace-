package com.example.aulajovem2026ia.entities;

public class Reserva {

    public Reserva(){ this.id = 1L;}
    public Reserva(String nome){
        this.id = 1000L;
        this.nome = nome;
        this.cpf = cpf;
        this.codigo = codigo;
    }

    private  Long id;
    private String nome;
    private String cpf;
    private String codigo;

    public  Long getId(){ return this.id; }

    public String getNome(){
        return  this.nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public String getCpf(){
        return this.cpf;
    }
    public void setCpf(String cpf){
        this.cpf = cpf;
    }

    public  String getCodigo(){
        return  this.codigo;
    }
    public void setCodigo(){
        this.codigo = codigo;
    }

}//fim da minha classe.
