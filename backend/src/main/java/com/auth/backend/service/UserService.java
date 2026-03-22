package com.auth.backend.service;

import com.auth.backend.dto.Claim;
import com.auth.backend.dto.Contract;
import com.auth.backend.dto.User;

import com.auth.backend.repository.ClaimRepository;
import com.auth.backend.repository.ContractRepository;
import com.auth.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ClaimRepository claimRepository;

    // ── Users ──────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // ── Contracts ──────────────────────────────────────────────

    public List<Contract> getContractByClientLicense(String clientLicense) {
        return contractRepository.findByDrivingLicenseNumber(clientLicense);
    }
    public List<Contract> getAllContracts() {
        return contractRepository.findAll();
    }
    // public Contract updateContractStatus(String contractId, String status) {
    //     Contract existing = contractRepository.findById(contractId)
    //             .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));
    //     existing.setStatus(status);
    //     return contractRepository.save(existing);
    // }

    // ── Claims ─────────────────────────────────────────────────

    public List<Claim> getClaimsByUser(String userId) {
        return claimRepository.findByUserId(userId);
    }

    public Claim updateClaimStatus(String claimId, String status) {
        Claim existing = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found: " + claimId));
        existing.setStatus(status);
        return claimRepository.save(existing);
    }
}
