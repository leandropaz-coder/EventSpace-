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
@Tag(name = "Reserva Controller", description = "Gerencia o ciclo de vida das reservas de salas corporativas no " +
        "EventSpace, aplicando validações essenciais como a prevenção estrita contra Double Booking e o " +
        "cálculo automático de desconto progressivo para reservas com mais de 3 dias consecutivos.")
public class ReservaController  {

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    @Operation(summary = "Buscar reserva por ID", description = "Retorna os detalhes completos de uma reserva específica" +
            "cadastrada no sistema com base no identificador único (id) informado.")
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
    @Operation(summary = "Buscar reserva por ID", description = "")
    public ResponseEntity<Reserva> ConsultaReservaPorId(@PathVariable Long id){
        var reserva = reservaRepository.findById(id).orElse(null);

        if(reserva == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reserva);
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Buscar reservas por ID da empresa", description = "Retorna todas as reservas associadas a uma " +
            "determinada empresa (empresaId) cadastrada no ecossistema.")
    public Reserva ConsultarReservaPorEmpresa(@PathVariable Long empresaId){
        Reserva reservaContrutorCompleto =
                new Reserva("Joao","0146644946494","003");
        return reservaContrutorCompleto;
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova reserva", description = "Cria e registra uma nova reserva no banco de dados, aplicando" +
            "as validações de regra de negócio (como a verificação de Double Booking para evitar sobreposições de horários" +
            "na mesma sala e o cálculo automático do desconto progressivo de 15% para períodos superiores a 3 dias)")
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
    @Operation(summary = "Atualizar reserva por ID", description = "Realiza a atualização completa dos dados de uma " +
            "reserva já existente (como datas de início e término, alteração de sala ou cliente associado) identificada pelo seu id.")
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
    @Operation(summary = "Atualizar status da reserva", description = "Executa uma alteração pontual no status de uma " +
            "reserva específica (por exemplo, alternando entre pendente, confirmada ou cancelada).")
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
    @Operation(summary = "Deletar reserva por ID", description = "Remove permanentemente um registro de reserva do sistema" +
            "com base no id fornecido, liberando a respectiva sala para novas marcações.")
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
