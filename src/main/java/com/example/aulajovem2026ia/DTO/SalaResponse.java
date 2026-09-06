package com.example.aulajovem2026ia.DTO;

import com.example.aulajovem2026ia.entities.Sala;

public class SalaResponse {

    public SalaResponse(){}

    public SalaResponse(Long id, String mensagem){
        this.id = id;
        this.mensagem = mensagem;
    }

    private Long id;
    private String mensagem;

    public Long getId(){ return id;}
    public void setId(Long id){ this.id = id;}

    public String getMensagem(){ return  mensagem;}
    public void setMensagem(String mensagem){this.mensagem = mensagem;}

} //fim da minha classe.
