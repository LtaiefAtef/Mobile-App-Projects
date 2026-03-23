package com.auth.backend.controller;

import com.auth.backend.dto.User;
import com.auth.backend.dto.Contract;
import com.auth.backend.dto.Claim;

import com.auth.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users
    @GetMapping
    public ResponseEntity<List<User>> getUsers(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(userService.searchUsers(search));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }
    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    // GET /api/users/contracts
    @GetMapping("/contracts")
    public ResponseEntity<List<Contract>> getAllContracts() {
        System.out.println("Received request to get all contracts");
        return ResponseEntity.ok(userService.getAllContracts());
    }
    @PostMapping("/contracts")
    public ResponseEntity<List<Contract>> getUserContract(@RequestBody Map<String,String> contractInfo) {
        System.out.println("Received request to get all contracts + id= " + contractInfo.get("contractNumber"));
        return ResponseEntity.ok(userService.getClientContract(contractInfo.get("contractNumber")));
    }
    // GET /api/users/{id}/claims
    @GetMapping("/{id}/claims")
    public ResponseEntity<List<Claim>> getUserClaims(@PathVariable String id) {
        return ResponseEntity.ok(userService.getClaimsByUser(id));
    }
}
