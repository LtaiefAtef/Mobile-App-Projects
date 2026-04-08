package com.auth.backend.dto;

import lombok.Data;

public class SessionRequests {

    @Data
    public static class CreateSessionRequest {
        private String username;
    }

    @Data
    public static class JoinSessionRequest {
        private String code;
        private String username;
    }

    @Data
    public static class UpdateDataRequest {
        private String code;
        private String username;
        private String sharedData;
    }
}
