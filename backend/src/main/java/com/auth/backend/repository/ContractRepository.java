package com.auth.backend.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.auth.backend.dto.Contract;

import java.util.List;

public interface ContractRepository extends MongoRepository<Contract, String> {

    List<Contract> findByDrivingLicenseNumber(String drivingLicenseNumber);
    // List<Contract> findContractByDrivingLicenseNumber(String drivingLicenseNumber); --- IGNORE ---
    List<Contract> findAll();
}
