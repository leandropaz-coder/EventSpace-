package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.SalaResponse;
import com.example.aulajovem2026ia.entities.Sala;
import com.example.aulajovem2026ia.entities.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Salas")
public class SalaController {
    @GetMapping
    public String ConsultaSala() {
        return "Hellor Sala";
    }

    @GetMapping("/{id}")
    public Sala ConsultaSalaPorID(@PathVariable Long id) {
        Sala sala = new Sala();
        Sala.setNome("Leandro");
        Sala.setNumero("0213154545");
        Sala.setAndar("03");
        Sala.setClasse("B");
        return sala;
    }

    @GetMapping("/empresa/{empresaId}")
    public Sala ConsultaSalaPorEmpresa(@PathVariable Long empresaId) {
        Sala salaContrutorCompleto =
                new Sala("Leandro", "Numero", "Andar", "Classe");
        return salaContrutorCompleto;
    }

    @PostMapping
    public ResponseEntity<SalaResponse> CadastrarSala(@RequestBody Sala salaRequest) {
        Sala salaBanco = new Sala();
        salaBanco.setNome(salaRequest.getNome());
        salaBanco.setNumero(salaRequest.getNumero());
        salaBanco.setAndar(salaRequest.getAndar());
        salaBanco.setClasse(salaRequest.getClasse());

        return ResponseEntity.ok(new SalaResponse(salaBanco.getId(),
                "Sala Atualizado com sucesso!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaResponse> AtualizarSala(@PathVariable Long id, @RequestBody Sala salaRequest) {

        //Consulta no banco
        Sala salaBanco = new Sala();

        salaBanco = salaRequest;

        if (salaBanco != null) {
            salaBanco.setNome(salaRequest.getNome());
            salaBanco.setNumero(salaRequest.getNumero());
            salaBanco.setAndar(salaRequest.getAndar());
            salaBanco.setClasse(salaRequest.getClasse());

            return ResponseEntity.ok(new SalaResponse(salaBanco.getId(),
                    "Sala Atualizado com sucesso!"));
        }

        return ResponseEntity.notFound().build();

    }
} //fim da minha classe.
