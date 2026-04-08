package com.auth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sessions")
public class Session {

    @Id
    private String id;

    /** Short human-readable code users share (e.g. "ABC-123") */
    private String code;

    /** Username of the session creator */
    private String createdBy;

    /** All participants who have joined (max 2 for a pair session) */
    @Builder.Default
    private List<String> participants = new ArrayList<>();

    /** Shared payload — any JSON-serialisable string your app needs */
    private String sharedData;

    private Instant createdAt;
    private Instant updatedAt;

    /** WAITING → ACTIVE → CLOSED */
    private SessionStatus status;

    public enum SessionStatus {
        WAITING, ACTIVE, CLOSED
    }
}
