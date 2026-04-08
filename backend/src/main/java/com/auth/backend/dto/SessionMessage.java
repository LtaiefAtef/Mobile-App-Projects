package com.auth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic envelope for all WebSocket messages sent over STOMP.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionMessage {

    public enum Type {
        USER_JOINED,
        USER_LEFT,
        DATA_UPDATE,
        SESSION_CLOSED,
        PING,
        SYSTEM
    }

    private Type type;

    /** Username of the sender */
    private String sender;

    /** Session code this message belongs to */
    private String sessionCode;

    /**
     * Arbitrary payload — can be any string / JSON string.
     * Both sides agree on the schema (e.g. a Contract JSON).
     */
    private String payload;

    private long timestamp;
}
