package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.EmpresaResponse;
import com.example.aulajovem2026ia.DTO.EmpresaResquest;
import com.example.aulajovem2026ia.entities.Empresa;
import com.example.aulajovem2026ia.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Presica colocar @RESTCONTROLLER PARA ATIVAR A @AUTOWIRED
@RestController
@RequestMapping
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping
    public List<Empresa> listarTodos(){
        return empresaRepository.findAll();
    }

    // Metodo para chamar mais do post "/criar"
    @PostMapping("/Criar")

    // void significa o nada do acesso
    public ResponseEntity<EmpresaResponse> cadastrarEmpresa(@RequestBody EmpresaResquest empresaResquest) {
        Empresa empresaBanco = new Empresa();

        empresaBanco.setRazaoSocial(empresaResquest.getRazaoSocial());
        empresaBanco.setCnpj(empresaResquest.getCnpj());
        empresaBanco.setNomeFantasia(empresaResquest.getRazaoSocial());
        empresaBanco.setInscricaoEstadual(empresaResquest.getInscricaoEstadual());


        // criar para ir ao banco
        empresaRepository.save(empresaBanco);

        EmpresaResponse empresaResponse = new EmpresaResponse();

        empresaResponse.setId(empresaBanco.getId());
        empresaResponse.setMenssagem("Cadastro da empresa realizado com sucesso");

        return ResponseEntity.ok(empresaResponse);
    }
}//fim da minha classe.