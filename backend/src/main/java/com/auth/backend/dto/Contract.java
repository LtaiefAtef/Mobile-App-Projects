package com.auth.backend.dto;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "contracts")
public class Contract {

    @Id
    private String id;

    @Indexed
    private String userId;         // references User._id

    private String contractNumber;
    private String type;           // HEALTH, AUTO, HOME, etc.
    private String status;         // ACTIVE, PENDING, EXPIRED, CANCELLED
    private LocalDate startDate;
    private LocalDate endDate;
    private Double premium;

    private LocalDateTime createdAt = LocalDateTime.now();
}
