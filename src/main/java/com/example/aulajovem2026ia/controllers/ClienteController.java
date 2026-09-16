package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.*;
import com.example.aulajovem2026ia.entities.Cliente;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.ClienteRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/Cliente")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public List<Cliente> ConsultaCliente(){
        return clienteRepository.findAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> ConsultaClientePorId(@PathVariable Long id){
        var cliente = clienteRepository.findById(id).orElse(null);

        if(cliente == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/empresa/{empresaId}")
    public Cliente ConsultaClientePorEmpresa(@PathVariable Long empresaId){
        Cliente clienteContrutorCompleto =
                new Cliente("Pedro","0202020202","15/11/1988", 4000);
        return clienteContrutorCompleto;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> CadastrarCLiente(@RequestBody ClienteRequest clienteRequest){

        Cliente clienteBanco = new Cliente();
        clienteBanco.setNome(clienteRequest.getNome());
        clienteBanco.setCpfCnpj(clienteRequest.getCpfCnpj());
        clienteBanco.setDataNascimento(clienteRequest.getDataNascimento());
        clienteBanco.setRenda(clienteRequest.getRenda());

        clienteBanco.setStatus("A");

        //salvando no banco
        clienteRepository.save(clienteBanco);

        return ResponseEntity.ok(new ClienteResponse(clienteBanco.getId(),
                "Cadastro com sucesso!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse>
    AtualizarUsuario(@PathVariable Long id, @RequestBody ClienteRequest clienteRequest){
        //Consulta no banco
        Cliente clienteBanco = clienteRepository.findById(id).orElse(null);

        if(clienteBanco != null){
            clienteBanco.setNome(clienteRequest.getNome());
            clienteBanco.setCpfCnpj(clienteRequest.getCpfCnpj());
            clienteBanco.setDataNascimento(clienteRequest.getDataNascimento());
            clienteBanco.setDataAtualizacao(LocalDateTime.now());
            clienteBanco.setRenda(clienteRequest.getRenda());
            clienteRepository.save(clienteBanco);

            return ResponseEntity.ok(new ClienteResponse(clienteBanco.getId(),
                    " Cliente Atulizado com sucesso!"));
        }
        return ResponseEntity.notFound().build();
    }
    @PatchMapping("/{id}/status")
    public ResponseEntity<ClienteResponse>
    AtualizarStatus(@PathVariable Long id, @RequestBody AtualizaStatusClienteRequest clienteRequest){
        //Consulta no banco
        Cliente clienteBanco = clienteRepository.findById(id).orElse(null);

        if(clienteBanco != null){
            clienteBanco.setStatus(clienteRequest.getStatus());
            clienteRepository.save(clienteBanco);

            return ResponseEntity.ok(new ClienteResponse(clienteBanco.getId(),
                    "Status atualizado com sucesso!"));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ClienteResponse> deletar(@PathVariable Long id){
        //Consulta no banco


        Cliente clienteBanco = clienteRepository.findById(id).orElse(null);

        if(clienteBanco != null){
            clienteBanco.setStatus("D");
            clienteRepository.save(clienteBanco);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }


}//fim da minha classe.
