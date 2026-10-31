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
@Tag(name = "Sala Controller", description = "é o responsável por expor os endpoints da API REST que vão conversar diretamente com o seu Front-end")
public class SalaController {

    private final SalaRepository salaRepository;

    // O Spring injeta o repositório, que concentra as consultas e gravações no banco.
    public SalaController(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todas as salas", description = "Retorna uma lista contendo todas as salas corporativas cadastradas no sistema " +
            "(Boardroom Summit:refere-se a uma sala de diretoria ou conselho, e Summit:remete a um encontro de alto nível (uma cúpula)., " +
            "Auditório Horizon:Auditório indica um espaço amplo com assentos voltados para um palco ou tela, enquanto " +
            "Horizon (Horizonte) transmite a ideia de expansão de conhecimento e visão de futuro., " +
            "Training Lab: Training (Treinamento) e Lab (Laboratório) juntas indicam um ambiente prático e focado no aprendizado contínuo., " +
            "Sala Insight: remete a ideias, clareza e momentos de descoberta (estalo criativo)., etc.), com seus respectivos status e dados.")

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
    @Operation(summary = "Buscar sala por ID", description = "Retorna os detalhes completos de uma sala específica cadastrada no sistema através do seu identificador único")
    public ResponseEntity<Sala> ConsultaSalaPorID(@PathVariable Long id) {
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(salaBanco);
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Buscar salas por ID da empresa", description = "Retorna todas as salas corporativas que estão vinculadas ou associadas a uma determinada empresa (empresaId) específica.")
    public Sala ConsultaSalaPorEmpresa(@PathVariable Long empresaId) {
        return new Sala("Leandro", "Numero", "Andar", "Classe", "A");
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova sala", description = "Cria e salva uma nova sala corporativa no banco de dados " +
            "com base nos dados enviados no corpo da requisição (payload): carga útil.")
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
    @Operation(summary = "Atualizar sala por ID", description = "Atualiza por completo os dados cadastrais de uma sala já existente (como nome, capacidade, recursos e valor da diária) identificada pelo seu id")
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
    @Operation(summary = "Atualizar status da sala", description = "Realiza uma atualização parcial focada estritamente no status de disponibilidade da sala (por exemplo, alternando entre Disponível e Ocupada")
    public ResponseEntity<Sala> AtualizarSala(@PathVariable Long id, @RequestBody AtualizaStatusSalaRequest salaRequest) {
        Sala salaBanco = salaRepository.findById(id).orElse(null);
        if (salaBanco == null) {
            return ResponseEntity.notFound().build();
        }

        salaBanco.setStatus(salaRequest.getStatus());
        return ResponseEntity.ok(salaRepository.save(salaBanco));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete sala por ID", description = "Remove permanentemente uma sala do sistema com base no id informado.")
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
