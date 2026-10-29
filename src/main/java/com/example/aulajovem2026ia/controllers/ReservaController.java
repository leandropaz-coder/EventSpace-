package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.*;
import com.example.aulajovem2026ia.entities.Reserva;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.ReservaRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/Reserva")
//A anotação @Tag do OpenAPI/Swagger agrupa e nomeia esta classe na documentação interativa da API,
//facilitando a visualização dos endpoints relacionados.
@Tag(name = "Reserva Controller", description = "classe responsavel por fazer do Curl")
public class ReservaController  {

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    public List<Reserva> ConsultaReserva(){
        return reservaRepository.findAll();
    }

    @GetMapping("/{id}")
    /**
     * A anotação @Operation do OpenAPI (Swagger) documenta este endpoint específico.
     * - summary: Fornece um título curto e direto sobre o que a operação faz ("Buscar sala por ID").
     * - description: Detalha o funcionamento técnico do método, indicando que ele realiza uma consulta
     *   por ID utilizando uma variável de caminho (PathVariable) e retorna como resposta um objeto DTO do sala.
     */
    @Operation(summary = "Buscar reserva por ID", description = "Metodo de consulta por ID que retorna somente uma reserva e recebe como paramentro de RPTH varieble ID E Retorna como saída do objeto do DTO")
    public ResponseEntity<Reserva> ConsultaReservaPorId(@PathVariable Long id){
        var reserva = reservaRepository.findById(id).orElse(null);

        if(reserva == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reserva);
    }

    @GetMapping("/empresa/{empresaId}")
    public Reserva ConsultarReservaPorEmpresa(@PathVariable Long empresaId){
        Reserva reservaContrutorCompleto =
                new Reserva("Joao","0146644946494","003");
        return reservaContrutorCompleto;
    }

    @PostMapping
    public ResponseEntity<ReservaResponse> CadastrarReserva(@RequestBody ReservaRequest reservaRequest){

        Reserva reservaBanco = new Reserva();
        reservaBanco.setNome(reservaRequest.getNome());
        reservaBanco.setCpfCnpj(reservaRequest.getCpfCnpj());
        reservaBanco.setCodigo(reservaRequest.getCodigo());

        reservaBanco.setDataCadastro(LocalDateTime.now());
        reservaBanco.setStatus("A");

        //salvando no banco
        reservaRepository.save(reservaBanco);

        return ResponseEntity.ok(new ReservaResponse(reservaBanco.getId(),
                "Cadastro da reserva com sucesso!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponse>
    AtualizarReserva(@PathVariable Long id, @RequestBody ReservaRequest reservaRequest){
        //Consulta no banco
        Reserva reservaBanco = reservaRepository.findById(id).orElse(null);

        if(reservaBanco != null){
            reservaBanco.setNome(reservaRequest.getNome());
            reservaBanco.setCpfCnpj(reservaRequest.getCpfCnpj());
            reservaBanco.setCodigo(reservaRequest.getCodigo());
            reservaBanco.setDataAtualizacao(LocalDateTime.now());
            reservaBanco.setStatus(reservaRequest.getStatus());
            reservaRepository.save(reservaBanco);

            return ResponseEntity.ok(new ReservaResponse(reservaBanco.getId(),
                    "Reserva Atulizado com sucesso!"));
        }
        return ResponseEntity.notFound().build();
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservaResponse>
    AtualizarStatus(@PathVariable Long id, @RequestBody AtualizaStatusReservaRequest reservaRequest){
        //Consulta no banco
        Reserva reservaBanco = reservaRepository.findById(id).orElse(null);

        if(reservaBanco != null){
            reservaBanco.setStatus(reservaRequest.getStatus());
            reservaRepository.save(reservaBanco);

            return ResponseEntity.ok(new ReservaResponse(reservaBanco.getId(),
                    "Status atualizado com sucesso!"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ReservaResponse> deletar(@PathVariable Long id){
        //Consulta no banco


        Reserva reservaBanco = reservaRepository.findById(id).orElse(null);

        if(reservaBanco != null){
            reservaBanco.setStatus("D");
            reservaRepository.save(reservaBanco);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

} //fim da minha classe.
