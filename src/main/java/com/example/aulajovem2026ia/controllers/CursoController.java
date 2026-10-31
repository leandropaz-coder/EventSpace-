package com.example.aulajovem2026ia.controllers;

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


        cursoRepository.save(cursoBanco);

        return ResponseEntity.ok(new CursoResponse(cursoBanco.getId(),"lasanha1"));

    }


    @GetMapping
    @Operation(summary = "Listar todos os cursos", description = "Retorna uma lista completa contendo todos os cursos cadastrados no sistema.")
    public ResponseEntity<List<CursoConsultaResponse>> listarTodos(){


        var listaCurso = cursoRepository.findAll()
                .stream()
                .map(CursoConsultaResponse::new).toList();

        return ResponseEntity.ok(listaCurso);


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


        return ResponseEntity.ok(new CursoResponse(cursoBanco.getId(),"lasanha2"));


    }


}