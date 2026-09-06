package com.example.aulajovem2026ia.entities;

public class Sala {

    // Construtor padrão
    public Sala(){
        this.id = 1L;
    }

    // Construtor completo com todos os parâmetros
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

    public Sala(String leandro, String numero, String andar, String classe) {
    }


    public Long getId(){
        return  this.id;
    }

    // Getters e Setters
    public String getNome() {return nome;}
    public static void setNome(String nome){ nome = nome;}

    public String getNumero(){ return numero;}
    public static void setNumero(String numero){ numero = numero;}

    public String getAndar(){ return andar;}
    public static void setAndar(String andar){ andar = andar;}

    public String getClasse(){return classe;}
    public static void setClasse(String classe){ classe = classe;}

}// fim da minha classe.
// porque está dando erro com this.     public static void setClasse(String classe){this.classe = classe;}

