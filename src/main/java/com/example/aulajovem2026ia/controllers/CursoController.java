package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.AtualizaStatusCursoRequest;
import com.example.aulajovem2026ia.DTO.CursoConsultaResponse;
import com.example.aulajovem2026ia.DTO.CursoRequest;
import com.example.aulajovem2026ia.DTO.CursoResponse;
import com.example.aulajovem2026ia.DTO.MatriculaRequest;
import com.example.aulajovem2026ia.entities.Curso;
import com.example.aulajovem2026ia.repository.CursoRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/curso")
@Tag(name = "Curso Controller", description = "Gerencia o cadastro, listagem de cursos e o processamento de matrículas, " +
        "permitindo organizar e controlar a oferta educacional dentro da plataforma.")
public class CursoController {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping
    @Operation(summary = "Cadastrar novo curso", description = "Cria e registra um novo curso no banco de dados a partir " +
            "das informações fornecidas no corpo da requisição.")
    public ResponseEntity<CursoResponse> cadastrarCurso(@RequestBody CursoRequest cursoRequest){
        Curso cursoBanco = new Curso();

        cursoBanco.setDescricao(cursoRequest.getDescricao());
        cursoBanco.setTitulo(cursoRequest.getTitulo());
        cursoBanco.setStatus("A");


        cursoRepository.save(cursoBanco);

        return ResponseEntity.ok(new CursoResponse(cursoBanco.getId(), "Curso cadastrado com sucesso."));

    }


    @GetMapping
    @Operation(summary = "Listar todos os cursos", description = "Retorna uma lista completa contendo todos os cursos cadastrados no sistema.")
    public ResponseEntity<List<CursoConsultaResponse>> listarTodos(){


        var listaCurso = cursoRepository.findAll()
                .stream()
                .map(CursoConsultaResponse::new).toList();

        return ResponseEntity.ok(listaCurso);


    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar curso por ID", description = "Retorna os dados de um curso e seus alunos matriculados.")
    public ResponseEntity<CursoConsultaResponse> buscarCursoPorId(@PathVariable Long id) {
        Curso cursoBanco = cursoRepository.findById(id).orElse(null);
        if (cursoBanco == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new CursoConsultaResponse(cursoBanco));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar curso por ID", description = "Atualiza o título e a descrição de um curso existente.")
    public ResponseEntity<CursoConsultaResponse> atualizarCurso(
            @PathVariable Long id,
            @RequestBody CursoRequest cursoRequest) {
        Curso cursoBanco = cursoRepository.findById(id).orElse(null);
        if (cursoBanco == null) {
            return ResponseEntity.notFound().build();
        }

        cursoBanco.setTitulo(cursoRequest.getTitulo());
        cursoBanco.setDescricao(cursoRequest.getDescricao());
        Curso cursoAtualizado = cursoRepository.save(cursoBanco);
        return ResponseEntity.ok(new CursoConsultaResponse(cursoAtualizado));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do curso", description = "Atualiza o status do curso para A (ativo) ou D (desativado).")
    public ResponseEntity<CursoConsultaResponse> atualizarStatusCurso(
            @PathVariable Long id,
            @RequestBody AtualizaStatusCursoRequest statusRequest) {
        Curso cursoBanco = cursoRepository.findById(id).orElse(null);
        if (cursoBanco == null) {
            return ResponseEntity.notFound().build();
        }

        if (statusRequest == null || statusRequest.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }

        String status = statusRequest.getStatus();
        if (!"A".equalsIgnoreCase(status) && !"D".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().build();
        }

        cursoBanco.setStatus(status.toUpperCase());
        Curso cursoAtualizado = cursoRepository.save(cursoBanco);
        return ResponseEntity.ok(new CursoConsultaResponse(cursoAtualizado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar curso por ID", description = "Realiza a exclusão lógica do curso, alterando seu status para D e preservando as matrículas.")
    public ResponseEntity<Void> desativarCurso(@PathVariable Long id) {
        Curso cursoBanco = cursoRepository.findById(id).orElse(null);
        if (cursoBanco == null) {
            return ResponseEntity.notFound().build();
        }

        cursoBanco.setStatus("D");
        cursoRepository.save(cursoBanco);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/matricula")
    @Operation(summary = "Realizar matrícula em curso", description = "Processa e registra a matrícula de um participante " +
            "ou aluno em um curso específico do sistema.")
    public ResponseEntity<CursoResponse> matricular(@RequestBody MatriculaRequest matriculaRequest) {

        var usuarioBanco = usuarioRepository.findById(matriculaRequest.getUsuario_id()).orElse(null);


        var cursoBanco = cursoRepository.findById(matriculaRequest.getCurso_id()).orElse(null);

        if(usuarioBanco == null || cursoBanco ==null){
            return ResponseEntity.notFound().build();
        }

        if(cursoBanco.getAlunos().contains(usuarioBanco)){
            throw  new IllegalArgumentException("Aluno já cadastrado nesse curso!");
        }

        cursoBanco.adicionarAluno(usuarioBanco);

        cursoRepository.save(cursoBanco);


        return ResponseEntity.ok(new CursoResponse(cursoBanco.getId(), "Matrícula realizada com sucesso."));


    }


}