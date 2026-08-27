package com.example.aulajovem2026ia.entities;

public class Sala {

    public Sala(){
        this.id = 1L;
    }
    public Sala(String nome){
        this.id = 1000L;
        this.nome = nome;
        this.numero = numero;
        this.andar = andar;
        this.classe = classe;
    }

    private Long id;
    private String nome;
    private String numero;
    private String andar;
    private String classe;

    public Long getId(){
        return  this.id;
    }

    public String getNome(){
        return this.nome;
    }
    public void setNome(String nome){
        this.nome = nome;
    }

    public String getNumero(){
        return this.numero;
    }
    public void setNumero(String numero){
        this.numero = numero;
    }

    public String getAndar(){
        return this.andar;
    }
    public void setAndar(String andar){
        this.andar = andar;
    }

    public String getClasse(){
        return this.classe;
    }
    public void setClasse(String classe){
        this.classe = classe;}

}// fim da minha classe.


