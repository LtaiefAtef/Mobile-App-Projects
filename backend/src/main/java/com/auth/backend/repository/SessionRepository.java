package com.auth.backend.repository;

import com.auth.backend.dto.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {

    Optional<Session> findByCode(String code);

    boolean existsByCode(String code);
}
