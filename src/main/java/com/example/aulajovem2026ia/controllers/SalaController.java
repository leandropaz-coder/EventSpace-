package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.AtualizaStatusSalaRequest;
import com.example.aulajovem2026ia.DTO.AtualizaStatusUsuarioRequest;
import com.example.aulajovem2026ia.DTO.SalaResponse;
import com.example.aulajovem2026ia.DTO.UsuarioResponse;
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
        sala.setNome("Leandro");
        sala.setNumero("0213154545");
        sala.setAndar("03");
        sala.setClasse("B");
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
        salaBanco.setStatus("A");

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

    @PatchMapping("/{id}/status")
    public ResponseEntity<SalaResponse> AtualizarSala(@PathVariable Long id, @RequestBody AtualizaStatusSalaRequest salaRequest) {

        //Consuta no banco
        Sala salaBanco = new Sala();

        if (salaBanco !=null){
            salaBanco.setStatus(salaBanco.getStatus());

            return ResponseEntity.ok(new SalaResponse(salaBanco.getId(),
                    "Usuario Atualizado com sucesso!"));
        }

        return ResponseEntity.notFound().build();

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<SalaResponse> AtualizarStatus(@PathVariable Long id){
        //Consuta no banco
        Sala salaBanco = new Sala();

        if (salaBanco !=null){
            salaBanco.setStatus("D");

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

} //fim da minha classe.
