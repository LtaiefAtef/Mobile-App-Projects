package com.auth.backend.controller;

import com.auth.backend.dto.User;
import com.auth.backend.dto.Contract;
import com.auth.backend.dto.AddClaimRequest;
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
    @GetMapping("/{username}")
    public ResponseEntity<User> getUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
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
    @PostMapping("/contracts/create-contract")
    public ResponseEntity<Contract> createContract(@RequestBody Contract contract){
        System.out.println("Received request to create contract");
        return ResponseEntity.ok(userService.createContractForClient(contract));
    }
    // GET users/claims
    @GetMapping("/claims")
    public ResponseEntity<List<Claim>> getAllClaims(){
        System.out.println("Received Request to get all claims");
        return ResponseEntity.ok(userService.findClaims());
    }
    @GetMapping("/claims/{claimId}")
    public ResponseEntity<List<Claim>> getClaimById(String ClaimId){
        System.out.println("Recieved get claim request");
        return ResponseEntity.ok(userService.getClaimByClaimId(ClaimId));
    }
    @PostMapping("/create-claim")
    public ResponseEntity<Claim> createClaim(@RequestBody Claim claim){
        System.out.println("Recieved Claim Create Request");
        return ResponseEntity.ok(userService.createClaim(claim));
    }
    @PostMapping("/set-account-claim")
    public ResponseEntity<User> addClaimForUser(@RequestBody AddClaimRequest addClaimRequest){
        System.out.println("Adding new claim reference");
        return ResponseEntity.ok(userService.addClaimIdToUser(addClaimRequest));
    }
}
