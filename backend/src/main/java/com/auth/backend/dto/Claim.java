package com.auth.backend.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "claims")
public class Claim {

    @Id
    private String id;

    @Indexed
    private String userId;         // references User._id

    @Indexed
    private String contractId;     // references Contract._id

    private String claimNumber;
    private String description;
    private String status;         // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    private Double amount;

    private LocalDateTime submittedAt = LocalDateTime.now();
}
