package com.auth.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.auth.backend.dto.Claim;

import java.util.List;

public interface ClaimRepository extends MongoRepository<Claim, String> {
    List<Claim> findAll();
    boolean existsByClaimId(String claimId);
    List<Claim> findByClaimId(String claimId);
}
