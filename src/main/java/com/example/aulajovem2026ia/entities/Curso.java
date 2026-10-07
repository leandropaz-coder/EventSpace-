package com.example.aulajovem2026ia.entities;

import jakarta.persistence.*;


import java.util.HashSet;
import java.util.Set;

@Entity
public class Curso {
    public Curso(){

    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(nullable = false)
    private String titulo;
    private String descricao;

// lista de alunos que vai fazer um controle que não apaga tudo. Ele vai mostrar o qual vc apagou da lista.
    @ManyToMany
    private Set<Usuario> alunos = new HashSet<>();

    @OneToOne
    private Usuario usuarioCadastro;

    public void adicionarAluno


// Criar getter e setter


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Set<Usuario> getAlunos() {
        return alunos;
    }

    public void setAlunos(Set<Usuario> alunos) {
        this.alunos = alunos;
    }

    public Usuario getUsuarioCadastro() {
        return usuarioCadastro;
    }

    public void setUsuarioCadastro(Usuario usuarioCadastro) {
        this.usuarioCadastro = usuarioCadastro;
    }
}//fim da minha classe.

