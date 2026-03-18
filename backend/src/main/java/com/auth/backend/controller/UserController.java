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

    // GET /api/users/{id}/contracts
    @GetMapping("/{id}/contracts")
    public ResponseEntity<List<Contract>> getUserContracts(@PathVariable String id) {
        return ResponseEntity.ok(userService.getContractsByUser(id));
    }

    // PATCH /api/users/contracts/{contractId}
    @PatchMapping("/contracts/{contractId}")
    public ResponseEntity<Contract> updateContract(
            @PathVariable String contractId,
            @RequestBody Contract updates) {
        return ResponseEntity.ok(userService.updateContract(contractId, updates));
    }

    // GET /api/users/{id}/claims
    @GetMapping("/{id}/claims")
    public ResponseEntity<List<Claim>> getUserClaims(@PathVariable String id) {
        return ResponseEntity.ok(userService.getClaimsByUser(id));
    }

    // PATCH /api/users/claims/{claimId}/status
    @PatchMapping("/claims/{claimId}/status")
    public ResponseEntity<Claim> updateClaimStatus(
            @PathVariable String claimId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateClaimStatus(claimId, body.get("status")));
    }
}
