package com.example.aulajovem2026ia.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

// Construtor padrão
@Entity
public class Reserva{

// Construtor completo com todos os parâmetros

    public Reserva(){}

    public Reserva(String nome, String cpfCnpj, String codigo) {
            this.nome = nome;
            this.cpfCnpj = cpfCnpj;
            this.codigo = codigo;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String cpfCnpj;
    private String codigo;

// Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public void setStatus(String d) {
    }

    public void setDataCadastro(LocalDateTime now) {
    }

    public void setDataAtualizacao(LocalDateTime now) {

    }
}//fim da minha classe.
