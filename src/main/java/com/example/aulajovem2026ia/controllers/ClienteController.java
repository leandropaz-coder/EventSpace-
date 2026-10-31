package com.example.aulajovem2026ia.controllers;

import com.example.aulajovem2026ia.DTO.*;
import com.example.aulajovem2026ia.entities.Cliente;
import com.example.aulajovem2026ia.entities.Usuario;
import com.example.aulajovem2026ia.repository.ClienteRepository;
import com.example.aulajovem2026ia.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/Cliente")
//A anotação @Tag do OpenAPI/Swagger agrupa e nomeia esta classe na documentação interativa da API,
//facilitando a visualização dos endpoints relacionados.
@Tag(name = "Cliente Controller", description = "classe responsavel por fazer do Curl")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    @Operation(summary = "Listar todos os clientes", description = "Retorna uma lista contendo todos os clientes cadastrados" +
            " na plataforma EventSpace.")
    public List<Cliente> ConsultaCliente(){
        return clienteRepository.findAll();
    }
    @GetMapping("/{id}")
    /**
     * A anotação @Operation do OpenAPI (Swagger) documenta este endpoint específico.
     * - summary: Fornece um título curto e direto sobre o que a operação faz ("Buscar sala por ID").
     * - description: Detalha o funcionamento técnico do método, indicando que ele realiza uma consulta
     *   por ID utilizando uma variável de caminho (PathVariable) e retorna como resposta um objeto DTO do sala.
     */
    @Operation(summary = "Buscar cliente por ID", description = "Retorna os detalhes cadastrais completos de um cliente " +
            "específico com base no seu identificador único (id).")
    public ResponseEntity<Cliente> ConsultaClientePorId(@PathVariable Long id){
        var cliente = clienteRepository.findById(id).orElse(null);

        if(cliente == null){
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(cliente);
    }

    @GetMapping("/empresa/{empresaId}")
    @Operation(summary = "Buscar clientes por ID da empresa", description = "Retorna todos os clientes associados a uma " +
            "empresa específica (empresaId) cadastrada no sistema.")
    public Cliente ConsultaClientePorEmpresa(@PathVariable Long empresaId){
        Cliente clienteContrutorCompleto =
                new Cliente("Pedro","0202020202","15/11/1988", 4000);
        return clienteContrutorCompleto;
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo cliente", description = "Registra um novo cliente no banco de dados a partir " +
            "das informações fornecidas no corpo da requisição.")
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
    @Operation(summary = "Atualizar cliente por ID", description = "Atualiza por completo os dados cadastrais de um " +
            "cliente existente (como nome, CPF/CNPJ, e-mail e telefone) identificado pelo seu id")
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
    @Operation(summary = "Atualizar status do cliente", description = "Realiza uma alteração pontual no status do cliente " +
            "(por exemplo, alternando entre ativo e inativo)")
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
    @Operation(summary = "Deletar cliente por ID", description = "Remove permanentemente o registro de um cliente do sistema com base no id")
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
