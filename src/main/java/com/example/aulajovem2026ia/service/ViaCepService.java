package com.example.aulajovem2026ia.service;

import com.example.aulajovem2026ia.DTO.EnderecoResponse;
import com.example.aulajovem2026ia.utils.CepUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service // <-- ESSENCIAL para o Spring reconhecer a classe
public class ViaCepService {

    // <-- O NOME EXATO DO MÉTODO PRECISA SER ESTE:
    public EnderecoResponse consultarCep(String cep) {
        String cepLimpo = CepUtils.limparCep(cep);
        String url = "https://viacep.com.br/ws/" + cepLimpo + "/json/";
        RestTemplate restTemplate = new RestTemplate();

        return restTemplate.getForObject(url, EnderecoResponse.class);
    }
}
