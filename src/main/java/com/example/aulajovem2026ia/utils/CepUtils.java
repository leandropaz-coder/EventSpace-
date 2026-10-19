package com.example.aulajovem2026ia.utils;


public class    CepUtils {

    public static String limparCep(String cep) {
        if (cep == null) {
            return "";
        }
        // Remove tudo que não for dígito (0-9)
        return cep.replaceAll("\\D", "");
    }
}
