package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.EmpresaConsultaResponse;
import com.example.aulajovem2026ia.DTO.EmpresaResponse;
import com.example.aulajovem2026ia.DTO.EmpresaResquest;
import com.example.aulajovem2026ia.DTO.UsuarioConsultaResponse;
import com.example.aulajovem2026ia.entities.Empresa;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.EmpresaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Presica colocar @RESTCONTROLLER PARA ATIVAR A @AUTOWIRED
@RestController
@RequestMapping
@Tag(name = "Empresa Controller", description = "Gerencia o cadastro e a consulta de empresas parceiras no ecossistema " +
        "do EventSpace, permitindo também listar os usuários vinculados a cada CNPJ.")
public class EmpresaController {

    @Autowired
    private EmpresaRepository empresaRepository;

    @GetMapping
    @Operation(summary = "Listar todas as empresas", description = "Retorna uma lista completa contendo todas as empresas cadastradas no sistema.")
    public List<EmpresaConsultaResponse> listarTodos(){

        return empresaRepository.findAll()
                .stream()
                .map(EmpresaConsultaResponse::new).toList();
    }

    // Metodo para chamar mais do post "/criar"
    @PostMapping("/Criar")
    @Operation(summary = "Cadastrar nova empresa", description = "C nova empresa   Descrição / Summary: Cria e registra " +
            "uma nova empresa no banco de dados a partir das informações fornecidas no corpo da requisição.")
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
    // No @GetMapping COMO(cnpj)/OQUE(usuarios) 4 PILARES DA FUNÇÃo Se ela vem pelo urlO
    @GetMapping("/porcnpj/{cnpj}/usuarios")
    @Operation(summary = "Buscar usuários por CNPJ da empresa", description = "Retorna todos os usuários que estão vinculados " +
            "a uma empresa específica identificada pelo seu número de CNPJ.")
    public  ResponseEntity<List<UsuarioConsultaResponse>> buscarUsuariosPorCnpjEmpresa(@PathVariable String cnpj) {
        var empresaBanco = empresaRepository.getEmpresaByCnpj(cnpj).orElse(null);
        if (empresaBanco == null)
            return ResponseEntity.notFound().build();

        var usuarioEmpresaBanco = empresaBanco.getUsuarios()
                .stream()
                .map(UsuarioConsultaResponse::new)
                .toList();

        return ResponseEntity.ok(usuarioEmpresaBanco);
    }

}//fim da minha classe.