package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.AtualizaStatusEmpresaRequest;
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
    @PostMapping("/criar")
    @Operation(summary = "Cadastrar nova empresa", description = "C nova empresa   Descrição / Summary: Cria e registra " +
            "uma nova empresa no banco de dados a partir das informações fornecidas no corpo da requisição.")
    // void significa o nada do acesso
    public ResponseEntity<EmpresaResponse> cadastrarEmpresa(@RequestBody EmpresaResquest empresaResquest) {
        Empresa empresaBanco = new Empresa();

        empresaBanco.setRazaoSocial(empresaResquest.getRazaoSocial());
        empresaBanco.setCnpj(empresaResquest.getCnpj());
        empresaBanco.setNomeFantasia(empresaResquest.getNomeFantasia());
        empresaBanco.setInscricaoEstadual(empresaResquest.getInscricaoEstadual());
        empresaBanco.setStatus("A");


        // criar para ir ao banco
        empresaRepository.save(empresaBanco);

        EmpresaResponse empresaResponse = new EmpresaResponse();

        empresaResponse.setId(empresaBanco.getId());
        empresaResponse.setMenssagem("Cadastro da empresa realizado com sucesso");

        return ResponseEntity.ok(empresaResponse);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar empresa por ID", description = "Retorna os dados cadastrais de uma empresa identificada pelo seu ID.")
    public ResponseEntity<EmpresaConsultaResponse> buscarEmpresaPorId(@PathVariable Long id) {
        Empresa empresaBanco = empresaRepository.findById(id).orElse(null);
        if (empresaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new EmpresaConsultaResponse(empresaBanco));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar empresa por ID", description = "Atualiza por completo os dados cadastrais de uma empresa já existente, identificada pelo seu ID.")
    public ResponseEntity<EmpresaConsultaResponse> AtualizarEmpresa(
            @PathVariable Long id,
            @RequestBody Empresa empresaRequest) {
        // Atualiza somente um registro existente; IDs inexistentes recebem HTTP 404.
        Empresa empresaBanco = empresaRepository.findById(id).orElse(null);
        if (empresaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        empresaBanco.setRazaoSocial(empresaRequest.getRazaoSocial());
        empresaBanco.setCnpj(empresaRequest.getCnpj());
        empresaBanco.setNomeFantasia(empresaRequest.getNomeFantasia());
        empresaBanco.setInscricaoEstadual(empresaRequest.getInscricaoEstadual());
        Empresa empresaAtualizada = empresaRepository.save(empresaBanco);
        return ResponseEntity.ok(new EmpresaConsultaResponse(empresaAtualizada));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da empresa", description = "Atualiza o status da empresa para A (ativa) ou D (desativada).")
    public ResponseEntity<EmpresaConsultaResponse> atualizarStatusEmpresa(
            @PathVariable Long id,
            @RequestBody AtualizaStatusEmpresaRequest statusRequest) {
        Empresa empresaBanco = empresaRepository.findById(id).orElse(null);
        if (empresaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        if (statusRequest == null || statusRequest.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }

        String status = statusRequest.getStatus();
        if (!"A".equalsIgnoreCase(status) && !"D".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().build();
        }

        empresaBanco.setStatus(status.toUpperCase());
        Empresa empresaAtualizada = empresaRepository.save(empresaBanco);
        return ResponseEntity.ok(new EmpresaConsultaResponse(empresaAtualizada));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar empresa por ID", description = "Realiza a exclusão lógica da empresa, alterando seu status para D.")
    public ResponseEntity<Void> desativarEmpresa(@PathVariable Long id) {
        Empresa empresaBanco = empresaRepository.findById(id).orElse(null);
        if (empresaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        empresaBanco.setStatus("D");
        empresaRepository.save(empresaBanco);
        return ResponseEntity.noContent().build();
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