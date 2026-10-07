package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.CursoConsultaResponse;
import com.example.aulajovem2026ia.DTO.CursoRequest;
import com.example.aulajovem2026ia.DTO.CursoResponse;
import com.example.aulajovem2026ia.DTO.MatriculaRequest;
import com.example.aulajovem2026ia.entities.Curso;
import com.example.aulajovem2026ia.repository.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/curso")
public class CursoController {

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private UsuarioController usuarioRepository;

    @PostMapping
    public ResponseEntity<CursoResponse> cadastrarCurso(@RequestBody CursoRequest cursoRequest){
        Curso cursoBanco = new Curso();

        cursoBanco.setDescricao(cursoRequest.getDescricao());
        cursoBanco.setTitulo(cursoRequest.getTitulo());


        cursoRepository.save(cursoBanco);

        return ResponseEntity.ok(new CursoResponse(cursoBanco.getId(),"lasanha1"));

    }


    @GetMapping
    public ResponseEntity<List<CursoConsultaResponse>> listarTodos(){


        var listaCurso = cursoRepository.findAll()
                .stream()
                .map(CursoConsultaResponse::new).toList();

        return ResponseEntity.ok(listaCurso);


    }


    @PostMapping("/matricula")
    public ResponseEntity<CursoResponse> matricular(@RequestBody MatriculaRequest matriculaRequest)

}