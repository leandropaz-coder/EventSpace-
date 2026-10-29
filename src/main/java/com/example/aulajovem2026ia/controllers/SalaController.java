package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.AtualizaStatusSalaRequest;
import com.example.aulajovem2026ia.entities.Sala;
import com.example.aulajovem2026ia.repository.SalaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Salas")
//A anotação @Tag do OpenAPI/Swagger agrupa e nomeia esta classe na documentação interativa da API,
//facilitando a visualização dos endpoints relacionados.
@Tag(name = "Sala Controller", description = "classe responsavel por fazer do Curl")
public class SalaController {

    private final SalaRepository salaRepository;

    // O Spring injeta o repositório, que concentra as consultas e gravações no banco.
    public SalaController(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    @GetMapping
    public List<Sala> ConsultaSala() {
        // A lista é serializada pelo Spring como um array JSON, inclusive quando estiver vazia.
        return salaRepository.findAll();
    }

    @GetMapping("/{id}")
    /**
     * A anotação @Operation do OpenAPI (Swagger) documenta este endpoint específico.
     * - summary: Fornece um título curto e direto sobre o que a operação faz ("Buscar sala por ID").
     * - description: Detalha o funcionamento técnico do método, indicando que ele realiza uma consulta
     *   por ID utilizando uma variável de caminho (PathVariable) e retorna como resposta um objeto DTO do sala.
     */
    @Operation(summary = "Buscar sala por ID", description = "Metodo de consulta por ID que retorna somente uma sala e recebe como paramentro de RPTH varieble ID E Retorna como saida do objeto do DTO")
    public ResponseEntity<Sala> ConsultaSalaPorID(@PathVariable Long id) {
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(salaBanco);
    }

    @GetMapping("/empresa/{empresaId}")
    public Sala ConsultaSalaPorEmpresa(@PathVariable Long empresaId) {
        return new Sala("Leandro", "Numero", "Andar", "Classe", "A");
    }

    @PostMapping
    public ResponseEntity<Sala> CadastrarSala(@RequestBody Sala salaRequest) {
        // Cria um registro novo e devolve a entidade já salva, incluindo o ID gerado pelo banco.
        Sala salaNova = new Sala();
        salaNova.setNome(salaRequest.getNome());
        salaNova.setNumero(salaRequest.getNumero());
        salaNova.setAndar(salaRequest.getAndar());
        salaNova.setClasse(salaRequest.getClasse());
        salaNova.setStatus("A");

        return ResponseEntity.ok(salaRepository.save(salaNova));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sala> AtualizarSala(@PathVariable Long id, @RequestBody Sala salaRequest) {
        // Atualiza somente um registro existente; IDs inexistentes recebem HTTP 404.
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        salaBanco.setNome(salaRequest.getNome());
        salaBanco.setNumero(salaRequest.getNumero());
        salaBanco.setAndar(salaRequest.getAndar());
        salaBanco.setClasse(salaRequest.getClasse());
        return ResponseEntity.ok(salaRepository.save(salaBanco));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Sala> AtualizarSala(@PathVariable Long id, @RequestBody AtualizaStatusSalaRequest salaRequest) {
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        salaBanco.setStatus(salaRequest.getStatus());
        return ResponseEntity.ok(salaRepository.save(salaBanco));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> AtualizarStatus(@PathVariable Long id) {
        // A exclusão é lógica: o registro permanece no banco com status "D", sem corpo HTTP.
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        salaBanco.setStatus("D");
        salaRepository.save(salaBanco);
        return ResponseEntity.noContent().build();
    }

} //fim da minha classe.
